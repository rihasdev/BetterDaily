import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BetterDailyDB, defaults, readSettings } from './settings'
import { readVision, saveVision, readAffirmation, saveAffirmation, resetAffirmation, setAffirmationAcknowledged } from './dailyActions'
import { defaultAffirmations } from '../domain/dailyActions'

let database:BetterDailyDB
let count=0
beforeEach(()=>{database=new BetterDailyDB('daily-actions-test-'+(++count))})
afterEach(async()=>{await database.delete()})
describe('life vision',()=>{
  it('starts with six optional empty categories',async()=>{
    const vision=await readVision(database)
    expect(vision).toHaveLength(6)
    expect(vision.every(v=>!v.hidden&&v.description==='')).toBe(true)
  })
  it('saves descriptions, renamed categories and hidden status across reopening',async()=>{
    const row=(await readVision(database))[0]
    await saveVision({...row,title:'My family',description:'Be present and kind.',hidden:true},database)
    database.close()
    const reopened=new BetterDailyDB(database.name)
    try{expect((await readVision(reopened))[0]).toEqual({...row,title:'My family',description:'Be present and kind.',hidden:true})}finally{reopened.close()}
  })
  it('rejects invalid edits without replacing stored data',async()=>{
    const row=(await readVision(database))[0]
    await saveVision({...row,description:'Keep me'},database)
    await expect(saveVision({...row,title:' '},database)).rejects.toThrow()
    await expect(saveVision({...row,description:'x'.repeat(4001)},database)).rejects.toThrow()
    expect((await readVision(database))[0].description).toBe('Keep me')
  })
})
describe('affirmations',()=>{
  const date='2026-11-24'
  it('keeps general and faith custom text separate',async()=>{
    await saveAffirmation('faith','My faith-based intention.',database)
    expect((await readAffirmation('general',date,database)).text).toBe(defaultAffirmations.general)
    expect((await readAffirmation('faith',date,database)).text).toBe('My faith-based intention.')
    await resetAffirmation('faith',database)
    expect((await readAffirmation('faith',date,database)).text).toBe(defaultAffirmations.faith)
  })
  it('records one completion per date, independent of text and mode; undo removes only that date',async()=>{
    await Promise.all([setAffirmationAcknowledged(date,true,database),setAffirmationAcknowledged(date,true,database)])
    await saveAffirmation('general','A new intention.',database)
    expect(await database.affirmationLogs.count()).toBe(1)
    expect((await readAffirmation('faith',date,database)).acknowledged).toBe(true)
    expect((await readAffirmation('general','2026-11-25',database)).acknowledged).toBe(false)
    await setAffirmationAcknowledged('2026-11-25',true,database)
    await setAffirmationAcknowledged(date,false,database)
    expect(await database.affirmationLogs.count()).toBe(1)
    expect((await readAffirmation('general',date,database)).acknowledged).toBe(false)
  })
  it('rejects blank or long text and invalid dates',async()=>{
    await expect(saveAffirmation('general',' ',database)).rejects.toThrow()
    await expect(saveAffirmation('general','x'.repeat(301),database)).rejects.toThrow()
    await expect(setAffirmationAcknowledged('2026-02-30',true,database)).rejects.toThrow()
    expect(await database.affirmationLogs.count()).toBe(0)
  })
})
it('upgrades version 1 settings without losing data',async()=>{
  const old=new Dexie(database.name)
  old.version(1).stores({settings:'id'})
  try{await old.table('settings').put({...defaults,onboarded:true,theme:'dark'})}finally{old.close()}
  expect(await readSettings(database)).toEqual({...defaults,onboarded:true,theme:'dark'})
  expect(await readVision(database)).toHaveLength(6)
})
