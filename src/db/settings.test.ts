import 'fake-indexeddb/auto'
import { afterEach, expect, it } from 'vitest'
import { BetterDailyDB, defaults, readSettings, writeSettings } from './settings'
const db=new BetterDailyDB('BetterDaily-test')
afterEach(async()=>{await db.delete()})
it('defaults to general mode',async()=>expect(await readSettings(db)).toEqual(defaults))
it('persists a validated setting across reopening',async()=>{
  await writeSettings({...defaults,onboarded:true,faithMode:true},db)
  db.close()
  const next=new BetterDailyDB('BetterDaily-test')
  try {expect(await readSettings(next)).toMatchObject({onboarded:true,faithMode:true})} finally {next.close()}
})
it('rejects invalid settings',async()=>{
  await expect(writeSettings({...defaults,theme:'invalid'} as unknown as typeof defaults,db)).rejects.toThrow()
  expect(await readSettings(db)).toEqual(defaults)
})
