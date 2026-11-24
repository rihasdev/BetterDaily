import { db, type BetterDailyDB } from './settings'
import { defaultVision, visionInputSchema, visionRecordSchema, modeSchema, affirmationTextSchema, affirmationRecordSchema, affirmationLogSchema, defaultAffirmations, localDateSchema, type VisionInput, type AffirmationMode } from '../domain/dailyActions'

export async function readVision(database:BetterDailyDB=db):Promise<VisionInput[]>{
  const rows=await database.goals.toArray()
  const records=new Map(rows.map(row=>{const valid=visionRecordSchema.parse(row);return [valid.id,valid] as const}))
  return defaultVision().map(category=>visionInputSchema.parse(records.get(category.id)??category))
}
export async function saveVision(input:VisionInput,database:BetterDailyDB=db):Promise<VisionInput>{
  const value=visionInputSchema.parse(input)
  await database.transaction('rw',database.goals,async()=>{
    const old=await database.goals.get(value.id)
    const now=new Date().toISOString()
    await database.goals.put({...value,createdAt:old?.createdAt??now,updatedAt:now})
  })
  return value
}
export async function readAffirmation(mode:AffirmationMode,date:string,database:BetterDailyDB=db){
  modeSchema.parse(mode);localDateSchema.parse(date)
  return database.transaction('r',database.affirmations,database.affirmationLogs,async()=>{
    const record=await database.affirmations.get(mode)
    const log=await database.affirmationLogs.get(date)
    return {text:record?affirmationRecordSchema.parse(record).text:defaultAffirmations[mode],acknowledged:log?!!affirmationLogSchema.parse(log):false}
  })
}
export async function saveAffirmation(mode:AffirmationMode,text:string,database:BetterDailyDB=db){
  const record=affirmationRecordSchema.parse({mode,text:affirmationTextSchema.parse(text),updatedAt:new Date().toISOString()})
  await database.affirmations.put(record)
  return record.text
}
export async function resetAffirmation(mode:AffirmationMode,database:BetterDailyDB=db){
  modeSchema.parse(mode)
  await database.affirmations.delete(mode)
  return defaultAffirmations[mode]
}
export async function setAffirmationAcknowledged(date:string,done:boolean,database:BetterDailyDB=db){
  localDateSchema.parse(date)
  await database.transaction('rw',database.affirmationLogs,async()=>{
    if(!done){await database.affirmationLogs.delete(date);return}
    // The date is the primary key; repeated actions never create duplicate completions.
    if(!await database.affirmationLogs.get(date)){
      const value=affirmationLogSchema.parse({localDate:date,acknowledgedAt:new Date().toISOString(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone})
      await database.affirmationLogs.add(value)
    }
  })
  return done
}
