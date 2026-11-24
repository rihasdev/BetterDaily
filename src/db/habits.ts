import { db, type BetterDailyDB } from './settings'
import { localDate } from '../domain/date'
import { localDateSchema } from '../domain/dailyActions'
import { habitSchema,revisionSchema,planSchema,logSchema,prioritySchema,definitionsAt,scheduled,nextDate,summarize,type Habit,type HabitLog,type Priority,type DailyPlan } from '../domain/habits'
const stamp=()=>new Date().toISOString()
const zone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone
function pastOrToday(date:string,today:string){localDateSchema.parse(date);localDateSchema.parse(today);if(date>today)throw Error('Choose today or an earlier date.')}
export async function ensurePlan(date:string,database=db,today=localDate()):Promise<DailyPlan>{
  pastOrToday(date,today)
  return database.transaction('rw',database.habitRevisions,database.dailyPlans,async()=>{
    const old=await database.dailyPlans.get(date)
    if(old)return planSchema.parse(old)
    const revisions=(await database.habitRevisions.toArray()).map(r=>revisionSchema.parse(r))
    const value=planSchema.parse({localDate:date,timeZone:zone(),habits:scheduled(definitionsAt(revisions,date),date),createdAt:stamp(),updatedAt:stamp()})
    await database.dailyPlans.add(value)
    return value
  })
}
export async function readDefinitions(date:string,database=db){return definitionsAt((await database.habitRevisions.toArray()).map(r=>revisionSchema.parse(r)),date)}
export async function saveHabit(input:Habit,applyToday:boolean,database=db,today=localDate()){
  const habit=habitSchema.parse(input)
  const effectiveDate=applyToday?today:nextDate(today)
  localDateSchema.parse(effectiveDate)
  await database.transaction('rw',database.habitRevisions,database.dailyPlans,database.habitLogs,async()=>{
    const revisions=(await database.habitRevisions.toArray()).map(r=>revisionSchema.parse(r))
    const existing=definitionsAt(revisions,nextDate(today)).find(h=>h.id===habit.id)
    if(existing&&existing.kind!==habit.kind)throw Error('Habit type cannot be changed.')
    if(applyToday){
      const old=await database.dailyPlans.get(today)
      // Freeze all other habits; only revise the selected one today.
      const base=old??planSchema.parse({localDate:today,timeZone:zone(),habits:scheduled(definitionsAt(revisions,today),today),createdAt:stamp(),updatedAt:stamp()})
      const included=scheduled([habit],today).length>0
      const logs=await database.habitLogs.where('[localDate+habitId]').equals([today,habit.id]).count()
      if(!included&&logs)throw Error('This habit has entries today. Archive or change its schedule from tomorrow, or remove today’s entries first.')
      const habits=base.habits.filter(h=>h.id!==habit.id)
      if(included)habits.push(habit)
      await database.dailyPlans.put(planSchema.parse({...base,habits,updatedAt:stamp()}))
      // An explicit today change supersedes a previously queued tomorrow revision.
      await database.habitRevisions.delete(habit.id+':'+nextDate(today))
    }
    await database.habitRevisions.put(revisionSchema.parse({id:habit.id+':'+effectiveDate,habitId:habit.id,effectiveDate,habit,updatedAt:stamp()}))
  })
  return effectiveDate
}
async function findHabit(database:BetterDailyDB,date:string,id:string){
  const plan=await database.dailyPlans.get(date)
  const habit=plan?.habits.find(h=>h.id===id)
  if(!habit)throw Error('This habit is not scheduled for that date.')
  return habit
}
export async function addAmount(date:string,habitId:string,amount:number,database=db,today=localDate()){
  await ensurePlan(date,database,today)
  return database.transaction('rw',database.dailyPlans,database.habitLogs,async()=>{
    const h=await findHabit(database,date,habitId)
    if(h.kind==='binary'||!Number.isInteger(amount)||amount<=0||amount>(h.kind==='water'?10000:1440))throw Error('Enter a positive whole quantity within the allowed range.')
    const log=logSchema.parse({id:crypto.randomUUID(),habitId,localDate:date,status:'amount',amount,createdAt:stamp(),updatedAt:stamp(),timeZone:zone()})
    await database.habitLogs.add(log)
    await database.habitLogs.delete('status:'+date+':'+habitId)
    return log
  })
}
export async function editAmount(date:string,id:string,amount:number,database=db,today=localDate()){
  pastOrToday(date,today)
  await database.transaction('rw',database.dailyPlans,database.habitLogs,async()=>{
    const log=await database.habitLogs.get(id)
    if(!log||log.localDate!==date||log.status!=='amount')throw Error('Entry not found.')
    const h=await findHabit(database,date,log.habitId)
    if(h.kind==='binary'||!Number.isInteger(amount)||amount<=0||amount>(h.kind==='water'?10000:1440))throw Error('Enter a positive whole quantity within the allowed range.')
    await database.habitLogs.put(logSchema.parse({...log,amount,updatedAt:stamp()}))
  })
}
export async function deleteAmount(date:string,id:string,database=db,today=localDate()){
  pastOrToday(date,today)
  await database.transaction('rw',database.habitLogs,async()=>{
    const log=await database.habitLogs.get(id)
    if(!log||log.localDate!==date||log.status!=='amount')throw Error('Entry not found.')
    await database.habitLogs.delete(id)
  })
}
export async function setHabitStatus(date:string,habitId:string,status:'done'|'skipped'|'clear',database=db,today=localDate()){
  await ensurePlan(date,database,today)
  await database.transaction('rw',database.dailyPlans,database.habitLogs,async()=>{
    const h=await findHabit(database,date,habitId)
    const id='status:'+date+':'+habitId
    if(status==='clear'){await database.habitLogs.delete(id);return}
    if(status==='done'&&h.kind!=='binary')throw Error('Log a quantity to complete this habit.')
    const logs=await database.habitLogs.where('[localDate+habitId]').equals([date,habitId]).toArray()
    if(status==='skipped'&&h.kind!=='binary'&&summarize(h,logs).done)throw Error('This habit is already complete.')
    const old=await database.habitLogs.get(id)
    await database.habitLogs.put(logSchema.parse({id,habitId,localDate:date,status,amount:0,createdAt:old?.createdAt??stamp(),updatedAt:stamp(),timeZone:old?.timeZone??zone()}))
  })
}
export async function readDay(date:string,database=db){
  const plan=await database.dailyPlans.get(date)
  if(!plan)throw Error('Daily plan has not been created.')
  const logs=(await database.habitLogs.where('localDate').equals(date).toArray()).map(l=>logSchema.parse(l))
  const priorities=(await database.priorities.where('localDate').equals(date).toArray()).map(p=>prioritySchema.parse(p)).sort((a,b)=>a.slot-b.slot)
  const affirmation=!!await database.affirmationLogs.get(date)
  return {plan:planSchema.parse(plan),logs,priorities,affirmation}
}
export type DayData=Awaited<ReturnType<typeof readDay>>
export async function savePriority(date:string,slot:number,title:string,goalId:Priority['goalId'],database=db,today=localDate()){
  pastOrToday(date,today)
  await database.transaction('rw',database.priorities,async()=>{
    const id=date+':'+slot
    const old=await database.priorities.get(id)
    await database.priorities.put(prioritySchema.parse({id,localDate:date,slot,title,goalId,done:old?.done??false,createdAt:old?.createdAt??stamp(),updatedAt:stamp(),timeZone:old?.timeZone??zone()}))
  })
}
export async function togglePriority(date:string,slot:number,done:boolean,database=db,today=localDate()){
  pastOrToday(date,today)
  await database.transaction('rw',database.priorities,async()=>{
    const old=await database.priorities.get(date+':'+slot)
    if(!old)throw Error('Priority not found.')
    await database.priorities.put(prioritySchema.parse({...old,done,updatedAt:stamp()}))
  })
}
export async function deletePriority(date:string,slot:number,database=db,today=localDate()){
  pastOrToday(date,today);await database.priorities.delete(date+':'+slot)
}
