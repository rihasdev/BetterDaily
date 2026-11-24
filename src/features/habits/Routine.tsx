import { useEffect, useState, useRef, type FormEvent } from 'react'
import { liveQuery } from 'dexie'
import { Sun, Sunrise, Moon, CheckCircle2, Droplets, Footprints, ListChecks } from 'lucide-react'
import { ensurePlan, readDay, addAmount, editAmount, deleteAmount, setHabitStatus, savePriority, togglePriority, deletePriority, type DayData } from '../../db/habits'
import { readVision, setAffirmationAcknowledged } from '../../db/dailyActions'
import { periods, summarize, unit, type Habit, type HabitLog, type Priority } from '../../domain/habits'
import type { VisionInput } from '../../domain/dailyActions'

function useDay(date:string,today:string,retry:number){
  const [result,setResult]=useState<{date:string,data:DayData,goals:VisionInput[]}|null>(null)
  const [failure,setFailure]=useState<{date:string,message:string}|null>(null)
  useEffect(()=>{
    let active=true
    let subscription:{unsubscribe:()=>void}|undefined
    ensurePlan(date,undefined,today).then(()=>{
      if(!active)return
      subscription=liveQuery(async()=>({data:await readDay(date),goals:await readVision()})).subscribe({
        next:value=>{if(active){setResult({date,...value});setFailure(null)}},
        error:()=>{if(active)setFailure({date,message:'Could not read your daily records. Please retry.'})},
      })
    }).catch(()=>{if(active)setFailure({date,message:'Could not open your daily plan. Please retry.'})})
    return()=>{active=false;subscription?.unsubscribe()}
  },[date,today,retry])
  return {result:result?.date===date?result:null,error:failure?.date===date?failure.message:''}
}
function useWrite(){
  const lock=useRef(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  async function run(action:()=>Promise<unknown>){
    if(lock.current)return false
    lock.current=true;setBusy(true);setError('')
    try{await action();return true}
    catch(e){setError(e instanceof Error?e.message:'Could not save. Please retry.');return false}
    finally{lock.current=false;setBusy(false)}
  }
  return {busy,error,run}
}
function Feedback({busy,error}:{busy:boolean,error:string}){
  return <>{busy&&<p role="status" className="small">Saving…</p>}{error&&<p role="alert">{error}</p>}</>
}
function AmountEntry({log,date,today,h}:{log:HabitLog,date:string,today:string,h:Habit}){
  const [editing,setEditing]=useState(false)
  const [draft,setDraft]=useState(String(log.amount))
  const w=useWrite()
  async function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(await w.run(()=>editAmount(date,log.id,Number(draft),undefined,today)))setEditing(false)
  }
  return <li className="log-entry">
    {editing?<form className="action-row" onSubmit={save}><label className="field compact-field">Edit {h.label} amount ({unit(h)})<input type="number" min="1" max={h.kind==='water'?10000:1440} step="1" required value={draft} disabled={w.busy} onChange={e=>setDraft(e.target.value)}/></label><button type="submit" disabled={w.busy}>Save entry</button><button type="button" disabled={w.busy} onClick={()=>setEditing(false)}>Cancel</button></form>:<div className="action-row"><span>{log.amount} {unit(h)}</span><button disabled={w.busy} aria-label={'Edit '+h.label+' '+log.amount+' '+unit(h)} onClick={()=>{setDraft(String(log.amount));setEditing(true)}}>Edit</button><button disabled={w.busy} aria-label={'Delete '+h.label+' '+log.amount+' '+unit(h)} onClick={()=>void w.run(()=>deleteAmount(date,log.id,undefined,today))}>Delete</button></div>}
    <Feedback {...w}/>
  </li>
}
function HabitCard({h,logs,date,today,goals}:{h:Habit,logs:HabitLog[],date:string,today:string,goals:VisionInput[]}){
  const status=summarize(h,logs)
  const [amount,setAmount]=useState('')
  const w=useWrite()
  const goal=goals.find(g=>g.id===h.goalId)
  const Icon=h.kind==='water'?Droplets:h.kind==='sunlight'?Sun:h.kind==='movement'?Footprints:ListChecks
  const amounts=logs.filter(l=>l.habitId===h.id&&l.status==='amount').sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
  const steps=h.kind==='water'?[100,150,250]:[5,10,15]
  async function add(value:number){
    if(await w.run(()=>addAmount(date,h.id,value,undefined,today)))setAmount('')
  }
  return <article className="habit-item" aria-label={h.label}>
    <div className="habit-heading"><h3><Icon size={20} aria-hidden="true"/>{h.label}</h3><span className="habit-state">{status.done?'Completed':status.skipped?'Skipped':'Open'}</span></div>
    {goal&&<p className="muted small">Linked goal: {goal.title}</p>}
    {h.kind==='binary'?<div className="action-row"><button className="primary inline-primary" disabled={w.busy} onClick={()=>void w.run(()=>setHabitStatus(date,h.id,status.done?'clear':'done',undefined,today))}>{status.done?'Undo completion':'Mark complete'}</button></div>:<>
      <p className="quantity">{status.amount} / {h.target} {unit(h)}</p>
      <progress aria-label={h.label+' progress'} max={h.target} value={Math.min(status.amount,h.target)}/>
      <div className="action-row">{steps.map(n=><button key={n} disabled={w.busy} aria-label={'Add '+h.label+' '+n+' '+unit(h)} onClick={()=>void add(n)}>+{n} {unit(h)}</button>)}</div>
      <form className="action-row" onSubmit={e=>{e.preventDefault();void add(Number(amount))}}><label className="field compact-field">{h.label} amount ({unit(h)})<input type="number" required min="1" max={h.kind==='water'?10000:1440} step="1" value={amount} disabled={w.busy} onChange={e=>setAmount(e.target.value)}/></label><button type="submit" disabled={w.busy}>Add amount</button></form>
      {amounts.length>0&&<details><summary>Manage entries ({amounts.length})</summary><ul className="entry-list">{amounts.map(log=><AmountEntry key={log.id} log={log} date={date} today={today} h={h}/>)}</ul></details>}
    </>}
    {(!status.done||status.skipped)&&<div className="action-row"><button disabled={w.busy} onClick={()=>void w.run(()=>setHabitStatus(date,h.id,status.skipped?'clear':'skipped',undefined,today))}>{status.skipped?'Undo skip':'Skip for this day'}</button></div>}
    <Feedback {...w}/>
  </article>
}
function PrioritySlot({value,slot,date,today,goals}:{value:Priority|undefined,slot:number,date:string,today:string,goals:VisionInput[]}){
  const [title,setTitle]=useState(value?.title??'')
  const [goal,setGoal]=useState<Priority['goalId']>(value?.goalId??null)
  const w=useWrite()
  const options=goals.filter(g=>!g.hidden||g.id===goal)
  async function save(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    await w.run(()=>savePriority(date,slot,title,goal,undefined,today))
  }
  return <div className="priority-item">
    <form onSubmit={save}>
      <label className="field">Priority {slot+1}<input maxLength={160} required value={title} disabled={w.busy} onChange={e=>setTitle(e.target.value)} placeholder="One meaningful action"/></label>
      <label className="field">Link priority {slot+1} to a goal<select value={goal??''} disabled={w.busy} onChange={e=>setGoal((e.target.value||null) as Priority['goalId'])}><option value="">No link</option>{options.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
      <div className="action-row"><button type="submit" disabled={w.busy||!title.trim()||(title.trim()===value?.title&&goal===value.goalId)}>Save priority {slot+1}</button>{value&&<button type="button" disabled={w.busy} onClick={()=>void w.run(()=>deletePriority(date,slot,undefined,today))}>Remove priority {slot+1}</button>}</div>
    </form>
    {value&&<button disabled={w.busy} aria-label={(value.done?'Undo':'Complete')+' priority '+(slot+1)} onClick={()=>void w.run(()=>togglePriority(date,slot,!value.done,undefined,today))}>{value.done?'Completed · Undo':'Mark priority complete'}</button>}
    <Feedback {...w}/>
  </div>
}
function Priorities({data,date,today,goals}:{data:DayData,date:string,today:string,goals:VisionInput[]}){
  return <section className="card" aria-label="Daily priorities"><h2>Three daily priorities</h2><p className="muted small">Choose what matters most. All three are optional; link them to your vision if useful.</p>{[0,1,2].map(slot=>{const value=data.priorities.find(p=>p.slot===slot);return <PrioritySlot key={date+':'+slot+':'+(value?.title??'')+':'+(value?.goalId??'')} value={value} slot={slot} date={date} today={today} goals={goals}/>})}</section>
}
export function Routine({date,today,prioritiesOnly=false,history=false}:{date:string,today:string,prioritiesOnly?:boolean,history?:boolean}){
  const [retry,setRetry]=useState(0)
  const {result,error}=useDay(date,today,retry)
  const w=useWrite()
  if(error||!result)return <section className="card"><p role={error?'alert':'status'}>{error||'Loading daily plan…'}</p>{error&&<button onClick={()=>setRetry(n=>n+1)}>Retry</button>}</section>
  const {data,goals}=result
  if(prioritiesOnly)return <Priorities data={data} goals={goals} date={date} today={today}/>
  const completed=data.plan.habits.filter(h=>summarize(h,data.logs).done).length
  const total=data.plan.habits.length
  const next=data.plan.habits.find(h=>{const s=summarize(h,data.logs);return !s.done&&!s.skipped})
  const icons=[Sunrise,Sun,Moon]
  return <>
    <section className="card" aria-label="Daily progress"><p className="eyebrow">YOUR DAILY PROGRESS</p><h2>{total?completed+' of '+total+' scheduled habits completed':'No habits scheduled'}</h2>{total>0&&<progress aria-label="Scheduled habit progress" value={completed} max={total}/>}<p className="small muted">Morning affirmation: {data.affirmation?'acknowledged':'not acknowledged'} (tracked separately). Priorities and worship are not included in this count.</p>{next&&<p>Next habit: {next.label}</p>}{history&&<button disabled={w.busy} onClick={()=>void w.run(()=>setAffirmationAcknowledged(date,!data.affirmation))}>{data.affirmation?'Undo affirmation for this date':'Acknowledge affirmation for this date'}</button>}<Feedback {...w}/></section>
    <Priorities data={data} goals={goals} date={date} today={today}/>
    <p className="muted small">The starting quantities are optional examples, not health recommendations. Never look directly at the sun or force excessive hydration. Change or disable habits in Settings.</p>
    {periods.map((period,i)=>{const habits=data.plan.habits.filter(h=>h.period===period);const Icon=icons[i];return habits.length>0&&<section className="card" key={period}><h2 className="section-title"><Icon size={22} aria-hidden="true"/>{period} habits</h2>{habits.map(h=><HabitCard key={date+':'+h.id} h={h} logs={data.logs} goals={goals} date={date} today={today}/>)}</section>})}
    {total>0&&completed===total&&<p className="routine-celebration"><CheckCircle2 aria-hidden="true" size={20}/> A meaningful day of small steps.</p>}
  </>
}
export function History({today}:{today:string}){
  const [date,setDate]=useState(today)
  const selected=date>today?today:date
  return <><h1>Progress</h1><section className="card"><h2>Daily history</h2><label className="field">View date<input type="date" max={today} value={selected} onChange={e=>{if(e.target.value&&e.target.value<=today)setDate(e.target.value)}}/></label><button onClick={()=>setDate(today)}>Back to today</button><p className="muted small">Edit this day's records without changing today's entries. Scheduled targets are preserved for each date. XP and weekly summaries are planned for M4.</p></section><Routine key={selected} date={selected} today={today} history/></>
}
