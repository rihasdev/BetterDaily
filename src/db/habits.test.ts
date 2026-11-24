import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { BetterDailyDB,defaults,readSettings } from './settings'
import { ensurePlan,readDay,saveHabit,addAmount,editAmount,deleteAmount,setHabitStatus,savePriority,togglePriority,deletePriority } from './habits'
import { defaultHabits,allDays,summarize,type Habit } from '../domain/habits'
const today='2026-11-24',past='2026-11-23',tomorrow='2026-11-25'
const water=defaultHabits[1]
const custom:Habit={id:'custom-test',label:'Read a page',kind:'binary',target:1,weekdays:allDays,period:'Evening',goalId:'career',archived:false}
let db:BetterDailyDB
let count=0
beforeEach(()=>{db=new BetterDailyDB('habits-test-'+(++count))})
afterEach(async()=>{await db.delete()})
describe('quantity tracking',()=>{
  it('adds 100+150 mL, reverses completion on deletion, edits and rejects invalid amounts',async()=>{
    const a=await addAmount(today,'water',100,db,today)
    const b=await addAmount(today,'water',150,db,today)
    expect(summarize(water,(await readDay(today,db)).logs)).toMatchObject({amount:250,done:true})
    await deleteAmount(today,a.id,db,today)
    expect(summarize(water,(await readDay(today,db)).logs)).toMatchObject({amount:150,done:false})
    await editAmount(today,b.id,250,db,today)
    expect(summarize(water,(await readDay(today,db)).logs).done).toBe(true)
    await expect(addAmount(today,'water',-1,db,today)).rejects.toThrow()
    await expect(editAmount(today,b.id,0,db,today)).rejects.toThrow()
    expect((await readDay(today,db)).logs).toHaveLength(1)
  })
  it('keeps prior dates separate and preserves data when reopened',async()=>{
    await addAmount(today,'water',100,db,today)
    const old=await addAmount(past,'water',150,db,today)
    await editAmount(past,old.id,250,db,today)
    db.close()
    const reopened=new BetterDailyDB(db.name)
    try{
      expect(summarize(water,(await readDay(today,reopened)).logs).amount).toBe(100)
      expect(summarize(water,(await readDay(past,reopened)).logs).amount).toBe(250)
      await expect(addAmount(tomorrow,'water',10,reopened,today)).rejects.toThrow()
    }finally{reopened.close()}
  })
})
describe('schedule revisions',()=>{
  it('freezes old plans, reconstructs unlogged dates and applies tomorrow by default',async()=>{
    await ensurePlan(today,db,today)
    await saveHabit({...water,target:500},false,db,today)
    expect((await ensurePlan(today,db,today)).habits.find(h=>h.id==='water')?.target).toBe(250)
    expect((await ensurePlan(past,db,today)).habits.find(h=>h.id==='water')?.target).toBe(250)
    expect((await ensurePlan(tomorrow,db,tomorrow)).habits.find(h=>h.id==='water')?.target).toBe(500)
  })
  it('can explicitly change today without changing yesterday',async()=>{
    await ensurePlan(past,db,today)
    await ensurePlan(today,db,today)
    await saveHabit({...water,target:500},true,db,today)
    expect((await ensurePlan(today,db,today)).habits.find(h=>h.id==='water')?.target).toBe(500)
    expect((await ensurePlan(past,db,today)).habits.find(h=>h.id==='water')?.target).toBe(250)
  })
  it('schedules only selected weekdays and archives without deleting history',async()=>{
    await saveHabit({...custom,weekdays:[2]},true,db,today)
    expect((await ensurePlan(today,db,today)).habits.some(h=>h.id===custom.id)).toBe(true)
    expect((await ensurePlan(past,db,today)).habits.some(h=>h.id===custom.id)).toBe(false)
    await setHabitStatus(today,custom.id,'done',db,today)
    await expect(saveHabit({...custom,archived:true},true,db,today)).rejects.toThrow()
    await saveHabit({...custom,archived:true},false,db,today)
    expect((await ensurePlan(tomorrow,db,tomorrow)).habits.some(h=>h.id===custom.id)).toBe(false)
    expect(summarize(custom,(await readDay(today,db)).logs).done).toBe(true)
  })
  it('stores only one binary completion per date and supports skip and undo',async()=>{
    await saveHabit(custom,true,db,today)
    await Promise.all([setHabitStatus(today,custom.id,'done',db,today),setHabitStatus(today,custom.id,'done',db,today)])
    expect((await readDay(today,db)).logs).toHaveLength(1)
    await setHabitStatus(today,custom.id,'clear',db,today)
    await setHabitStatus(today,custom.id,'skipped',db,today)
    expect(summarize(custom,(await readDay(today,db)).logs)).toMatchObject({done:false,skipped:true})
    await setHabitStatus(today,custom.id,'clear',db,today)
    expect((await readDay(today,db)).logs).toHaveLength(0)
  })
})
it('supports three linked priorities per date with update, completion and removal',async()=>{
  await ensurePlan(today,db,today)
  await ensurePlan(past,db,today)
  await savePriority(today,0,'Learn SQL','career',db,today)
  await savePriority(today,1,'Walk',null,db,today)
  await savePriority(today,2,'Call family','relationships',db,today)
  await expect(savePriority(today,3,'Fourth',null,db,today)).rejects.toThrow()
  await togglePriority(today,0,true,db,today)
  await savePriority(today,0,'Practise SQL','career',db,today)
  await savePriority(past,0,'Old task',null,db,today)
  await deletePriority(past,0,db,today)
  const result=await readDay(today,db)
  expect(result.priorities).toHaveLength(3)
  expect(result.priorities[0]).toMatchObject({title:'Practise SQL',done:true,goalId:'career'})
  expect((await readDay(past,db)).priorities).toHaveLength(0)
})
it('preserves settings, vision and affirmation records when upgrading v2',async()=>{
  const old=new Dexie(db.name)
  old.version(1).stores({settings:'id'})
  old.version(2).stores({settings:'id',goals:'id',affirmations:'mode',affirmationLogs:'localDate'})
  const stamp='2026-11-24T00:00:00Z'
  try{
    await old.table('settings').put({...defaults,onboarded:true})
    await old.table('goals').put({id:'career',title:'Career',description:'Keep my vision',hidden:false,createdAt:stamp,updatedAt:stamp})
    await old.table('affirmations').put({mode:'general',text:'Keep my affirmation',updatedAt:stamp})
  }finally{old.close()}
  expect(await readSettings(db)).toMatchObject({onboarded:true})
  expect((await db.goals.get('career'))?.description).toBe('Keep my vision')
  expect((await db.affirmations.get('general'))?.text).toBe('Keep my affirmation')
  expect((await ensurePlan(today,db,today)).habits).toHaveLength(3)
})
