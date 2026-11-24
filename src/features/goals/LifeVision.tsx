import { useEffect, useState, type FormEvent } from 'react'
import { Target, Eye, EyeOff } from 'lucide-react'
import { readVision, saveVision } from '../../db/dailyActions'
import { visionInputSchema, type VisionInput } from '../../domain/dailyActions'

function CategoryEditor({initial,onSaved}:{initial:VisionInput,onSaved:(value:VisionInput)=>void}){
  const [draft,setDraft]=useState(initial)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const changed=draft.title!==initial.title||draft.description!==initial.description||draft.hidden!==initial.hidden
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(busy||!changed)return
    const valid=visionInputSchema.safeParse(draft)
    if(!valid.success){setError(valid.error.issues[0]?.message??'Please check your entry.');return}
    setBusy(true);setError('');setMessage('')
    try{const saved=await saveVision(valid.data);setDraft(saved);onSaved(saved);setMessage('Saved on this device.')}
    catch{setError('Could not save your vision. Your draft is still here; please retry.')}
    finally{setBusy(false)}
  }
  function patch(value:Partial<VisionInput>){setDraft(old=>({...old,...value}));setMessage('');setError('')}
  return <form className="card vision-card" onSubmit={submit}>
    <h2>{initial.title}</h2>
    <label className="field">Category name<input value={draft.title} maxLength={80} required disabled={busy} onChange={e=>patch({title:e.target.value})}/></label>
    <label className="field">What do I want in this area?<textarea value={draft.description} maxLength={4000} rows={4} disabled={busy} placeholder="Describe the life you want to build…" onChange={e=>patch({description:e.target.value})}/></label>
    <label className="toggle"><input type="checkbox" checked={draft.hidden} disabled={busy} onChange={e=>patch({hidden:e.target.checked})}/> Hide this category from my vision</label>
    <div className="action-row"><button type="submit" className="primary inline-primary" disabled={busy||!changed}>{busy?'Saving…':'Save category'}</button>{changed&&<button type="button" disabled={busy} onClick={()=>{setDraft(initial);setError('');setMessage('')}}>Discard changes</button>}</div>
    {changed&&!busy&&<p className="muted small">Unsaved changes. Save before leaving this screen.</p>}
    {message&&<p role="status" className="save-message">{message}</p>}{error&&<p role="alert">{error}</p>}
  </form>
}
export function LifeVision(){
  const [rows,setRows]=useState<VisionInput[]|null>(null)
  const [error,setError]=useState('')
  const [retry,setRetry]=useState(0)
  const [editing,setEditing]=useState(false)
  useEffect(()=>{
    let active=true
    readVision().then(data=>{if(active){setRows(data);setError('')}}).catch(()=>{if(active)setError('Could not open your life vision. Please retry.')})
    return()=>{active=false}
  },[retry])
  return <>
    <h1>Goals</h1>
    <section className="hero"><div><span>YOUR ONE-PAGE MIRACLE</span><h2>What do I really want?</h2><p>Are my actions helping me move toward this?</p></div><Target size={60} aria-hidden="true"/></section>
    {!rows?<section className="card"><p role="status">{error||'Opening your vision…'}</p>{error&&<button onClick={()=>{setError('');setRetry(n=>n+1)}}>Retry</button>}</section>:<>
      <div className="action-row"><button onClick={()=>setEditing(v=>!v)}>{editing?'View my vision':'Edit categories'}</button></div>
      {editing?<><p className="muted">All categories are optional. Rename, hide or leave them blank. Save each category before leaving.</p>{rows.map(row=><CategoryEditor key={row.id} initial={row} onSaved={value=>setRows(old=>old?.map(item=>item.id===value.id?value:item)??null)}/>)}</>:<>
        {rows.filter(row=>!row.hidden).map(row=><section className="card" key={row.id}><h2>{row.title}</h2><p className={row.description.trim()?'vision-copy':'muted'}>{row.description.trim()||'No vision written yet.'}</p></section>)}
        {rows.every(row=>row.hidden)&&<section className="card"><EyeOff aria-hidden="true"/><p>All categories are hidden. Use Edit categories to show them again.</p></section>}
        {rows.some(row=>row.hidden)&&<p className="muted small"><Eye size={16} aria-hidden="true" className="inline-icon"/> Hidden categories are retained on this device.</p>}
      </>}
      <p className="muted small">Goal-to-habit links and daily priorities will be added in a later increment. No XP is awarded yet.</p>
    </>}
  </>
}
