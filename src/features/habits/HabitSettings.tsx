import { useEffect, useState, useRef, type FormEvent } from 'react'
import { liveQuery } from 'dexie'
import { readDefinitions, saveHabit } from '../../db/habits'
import { readVision } from '../../db/dailyActions'
import { allDays,dayNames,periods,nextDate,unit,habitSchema,type Habit } from '../../domain/habits'
import type { VisionInput } from '../../domain/dailyActions'
function HabitEditor({initial,goals,today,isNew=false,onSaved}:{initial:Habit,goals:VisionInput[],today:string,isNew?:boolean,onSaved?:()=>void}){
  const [draft,setDraft]=useState(initial)
  const [target,setTarget]=useState(String(initial.target))
  const [applyToday,setApplyToday]=useState(false)
  const [busy,setBusy]=useState(false)
  const lock=useRef(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  function patch(value:Partial<Habit>){setDraft(old=>({...old,...value}));setError('');setMessage('')}
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(lock.current)return
    const parsed=habitSchema.safeParse({...draft,target:draft.kind==='binary'?1:Number(target)})
    if(!parsed.success){setError('Enter a name, valid target and at least one weekday.');return}
    lock.current=true;setBusy(true);setError('');setMessage('')
    try{const date=await saveHabit(parsed.data,applyToday,undefined,today);setMessage('Schedule saved from '+date+'.');onSaved?.()}
    catch(e){setError(e instanceof Error?e.message:'Could not save this habit.')}
    finally{lock.current=false;setBusy(false)}
  }
  return <form className="habit-editor" aria-label={isNew?'New custom habit':'Edit '+initial.label} onSubmit={submit}>
    <h3>{isNew?'New custom habit':initial.label+(initial.archived?' · Archived':'')}</h3>
    <label className="field">Habit name<input required maxLength={80} value={draft.label} disabled={busy} onChange={e=>patch({label:e.target.value})}/></label>
    {draft.kind!=='binary'&&<label className="field">Daily target ({unit(draft)})<input required type="number" min="1" max={draft.kind==='water'?10000:1440} step="1" value={target} disabled={busy} onChange={e=>{setTarget(e.target.value);setMessage('')}}/></label>}
    <label className="field">Routine period<select value={draft.period} disabled={busy} onChange={e=>patch({period:e.target.value as Habit['period']})}>{periods.map(p=><option key={p}>{p}</option>)}</select></label>
    <fieldset><legend>Scheduled weekdays</legend><div className="weekdays">{dayNames.map((name,i)=><label key={name}><input type="checkbox" checked={draft.weekdays.includes(i)} disabled={busy} onChange={e=>patch({weekdays:e.target.checked?[...draft.weekdays,i].sort():draft.weekdays.filter(d=>d!==i)})}/>{name}</label>)}</div></fieldset>
    <label className="field">Linked goal<select value={draft.goalId??''} disabled={busy} onChange={e=>patch({goalId:(e.target.value||null) as Habit['goalId']})}><option value="">No link</option>{goals.filter(g=>!g.hidden||g.id===draft.goalId).map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
    {!isNew&&<label className="toggle"><input type="checkbox" checked={draft.archived} disabled={busy} onChange={e=>patch({archived:e.target.checked})}/> Archive / disable habit</label>}
    <label className="toggle"><input type="checkbox" checked={applyToday} disabled={busy} onChange={e=>setApplyToday(e.target.checked)}/> Apply to today's plan too</label>
    <p className="muted small">Changes apply from tomorrow by default. Older plans stay unchanged. You can re-enable archived habits later.</p>
    <button className="primary inline-primary" type="submit" disabled={busy}>{busy?'Saving…':isNew?'Create custom habit':'Save habit schedule'}</button>
    {message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}
  </form>
}
export function HabitSettings({today}:{today:string}){
  const [data,setData]=useState<{habits:Habit[],goals:VisionInput[]}|null>(null)
  const [error,setError]=useState('')
  const [retry,setRetry]=useState(0)
  const [newHabit,setNewHabit]=useState<Habit|null>(null)
  useEffect(()=>{
    const sub=liveQuery(async()=>({habits:await readDefinitions(nextDate(today)),goals:await readVision()})).subscribe({next:value=>{setData(value);setError('')},error:()=>setError('Could not load habit settings. Please retry.')})
    return()=>sub.unsubscribe()
  },[today,retry])
  return <section className="card" aria-label="Habit settings"><h2>Manage habits</h2><p className="muted small">Configure upcoming schedules, targets and goal links. Archived habits preserve their history.</p>
    {error?<><p role="alert">{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry</button></>:!data?<p role="status">Loading habits…</p>:<>
      {data.habits.map(h=><details key={h.id}><summary>{h.label}{h.archived?' · Archived':''}</summary><HabitEditor key={JSON.stringify(h)} initial={h} goals={data.goals} today={today}/></details>)}
      {newHabit?<><HabitEditor key={newHabit.id} initial={newHabit} goals={data.goals} today={today} isNew onSaved={()=>setNewHabit(null)}/><button onClick={()=>setNewHabit(null)}>Cancel new habit</button></>:<button onClick={()=>setNewHabit({id:crypto.randomUUID(),label:'',kind:'binary',target:1,weekdays:[...allDays],period:'Morning',goalId:null,archived:false})}>Add custom habit</button>}
    </>}
  </section>
}
