import { z } from 'zod'
import { categoryIdSchema, localDateSchema } from './dailyActions'
export const periods=['Morning','During the day','Evening'] as const
export const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const
export const allDays=[0,1,2,3,4,5,6]
const kinds=z.enum(['sunlight','water','movement','binary'])
export const habitSchema=z.object({
  id:z.string().min(1).max(100), label:z.string().trim().min(1).max(80),
  kind:kinds, target:z.number().int().positive().max(10000),
  weekdays:z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(v=>new Set(v).size===v.length),
  period:z.enum(periods), goalId:categoryIdSchema.nullable(), archived:z.boolean(),
}).refine(h=>h.kind==='water'||h.target<=(h.kind==='binary'?1:1440),'Invalid target')
export type Habit=z.infer<typeof habitSchema>
export const revisionSchema=z.object({id:z.string(),habitId:z.string(),effectiveDate:localDateSchema,habit:habitSchema,updatedAt:z.string()})
export type HabitRevision=z.infer<typeof revisionSchema>
export const planSchema=z.object({localDate:localDateSchema,timeZone:z.string(),habits:z.array(habitSchema),createdAt:z.string(),updatedAt:z.string()})
export type DailyPlan=z.infer<typeof planSchema>
export const logSchema=z.object({id:z.string(),habitId:z.string(),localDate:localDateSchema,status:z.enum(['amount','done','skipped']),amount:z.number().int().min(0).max(10000),createdAt:z.string(),updatedAt:z.string(),timeZone:z.string()})
export type HabitLog=z.infer<typeof logSchema>
export const prioritySchema=z.object({id:z.string(),localDate:localDateSchema,slot:z.number().int().min(0).max(2),title:z.string().trim().min(1).max(160),done:z.boolean(),goalId:categoryIdSchema.nullable(),createdAt:z.string(),updatedAt:z.string(),timeZone:z.string()})
export type Priority=z.infer<typeof prioritySchema>
export const defaultHabits:Habit[]=[
  {id:'sunlight',label:'Sunlight',kind:'sunlight',target:10,weekdays:allDays,period:'Morning',goalId:null,archived:false},
  {id:'water',label:'Water',kind:'water',target:250,weekdays:allDays,period:'Morning',goalId:null,archived:false},
  {id:'movement',label:'Movement',kind:'movement',target:10,weekdays:allDays,period:'Morning',goalId:null,archived:false},
]
export function nextDate(value:string){localDateSchema.parse(value);const d=new Date(value+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
export function definitionsAt(revisions:HabitRevision[],date:string):Habit[]{
  localDateSchema.parse(date)
  const result=new Map(defaultHabits.map(h=>[h.id,h]))
  const sorted=[...revisions].filter(r=>r.effectiveDate<=date).sort((a,b)=>a.effectiveDate.localeCompare(b.effectiveDate))
  for(const r of sorted)result.set(r.habitId,r.habit)
  return [...result.values()]
}
export function scheduled(habits:Habit[],date:string){
  const day=new Date(localDateSchema.parse(date)+'T00:00:00Z').getUTCDay()
  return habits.filter(h=>!h.archived&&h.weekdays.includes(day))
}
export function unit(h:Habit){return h.kind==='water'?'mL':h.kind==='binary'?'':'min'}
export function summarize(h:Habit,logs:HabitLog[]){
  const items=logs.filter(l=>l.habitId===h.id)
  const amount=items.filter(l=>l.status==='amount').reduce((n,l)=>n+l.amount,0)
  const done=h.kind==='binary'?items.some(l=>l.status==='done'):amount>=h.target
  return {amount,done,skipped:!done&&items.some(l=>l.status==='skipped')}
}
