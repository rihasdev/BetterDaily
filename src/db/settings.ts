import Dexie, { type Table } from 'dexie'
import { z } from 'zod'

export const settingsSchema = z.object({
  id:z.literal('local'),
  onboarded:z.boolean(),
  faithMode:z.boolean(),
  theme:z.enum(['light','dark','system']),
})
export type Settings = z.infer<typeof settingsSchema>
export const defaults: Settings = {id:'local',onboarded:false,faithMode:false,theme:'system'}

export class BetterDailyDB extends Dexie {
  settings!: Table<Settings, string>
  constructor(name='BetterDaily') {
    super(name)
    this.version(1).stores({settings:'id'})
  }
}
export const db = new BetterDailyDB()
export async function readSettings(database=db): Promise<Settings> {
  const value = await database.settings.get('local')
  return value === undefined ? {...defaults} : settingsSchema.parse(value)
}
export async function writeSettings(value:Settings,database=db): Promise<Settings> {
  const validated=settingsSchema.parse(value)
  await database.settings.put(validated)
  return validated
}
