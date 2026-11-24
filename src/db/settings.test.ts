import 'fake-indexeddb/auto'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { BetterDailyDB, defaults, readSettings, writeSettings } from './settings'
let db: BetterDailyDB
beforeEach(()=>{db=new BetterDailyDB('BetterDaily-test')})
afterEach(async()=>{await db.delete()})
it('defaults to general mode',async()=>expect(await readSettings(db)).toEqual(defaults))
it('persists a validated setting across reopening',async()=>{
  await writeSettings({...defaults,onboarded:true,faithMode:true},db)
  db.close()
  const next=new BetterDailyDB(db.name)
  try {expect(await readSettings(next)).toMatchObject({onboarded:true,faithMode:true})} finally {next.close()}
})
it('rejects invalid settings',async()=>{
  await expect(writeSettings({...defaults,theme:'invalid'} as unknown as typeof defaults,db)).rejects.toThrow()
  expect(await readSettings(db)).toEqual(defaults)
})
