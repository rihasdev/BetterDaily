import { z } from 'zod'

export const visionCategories = [
  {id:'relationships',title:'Relationships & family'},
  {id:'career',title:'Career & learning'},
  {id:'finances',title:'Money & finances'},
  {id:'physical',title:'Physical well-being'},
  {id:'emotional',title:'Emotional well-being'},
  {id:'personal',title:'Spiritual & personal growth'},
] as const
export const categoryIdSchema=z.enum(['relationships','career','finances','physical','emotional','personal'])
export const visionInputSchema=z.object({
  id:categoryIdSchema,
  title:z.string().trim().min(1,'Enter a category name.').max(80),
  description:z.string().max(4000),
  hidden:z.boolean(),
})
export const visionRecordSchema=visionInputSchema.extend({createdAt:z.string(),updatedAt:z.string()})
export type VisionInput=z.infer<typeof visionInputSchema>
export type VisionRecord=z.infer<typeof visionRecordSchema>
export const modeSchema=z.enum(['general','faith'])
export type AffirmationMode=z.infer<typeof modeSchema>
export const affirmationTextSchema=z.string().trim().min(1,'Enter an affirmation.').max(300)
export const affirmationRecordSchema=z.object({mode:modeSchema,text:affirmationTextSchema,updatedAt:z.string()})
export type AffirmationRecord=z.infer<typeof affirmationRecordSchema>
export const localDateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
  const date=new Date(value+'T00:00:00Z')
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value
},'Invalid calendar date')
export const affirmationLogSchema=z.object({localDate:localDateSchema,acknowledgedAt:z.string(),timeZone:z.string()})
export type AffirmationLog=z.infer<typeof affirmationLogSchema>
export const defaultAffirmations:Record<AffirmationMode,string>={
  general:'I will approach today with intention and kindness.',
  faith:"Today is going to be a great day, Insha'Allah.",
}
export function defaultVision():VisionInput[]{
  return visionCategories.map(c=>({...c,description:'',hidden:false}))
}
