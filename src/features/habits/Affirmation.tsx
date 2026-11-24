import { useEffect, useState, type FormEvent } from 'react'
import { Sprout, CheckCircle2 } from 'lucide-react'
import { readAffirmation, saveAffirmation, resetAffirmation, setAffirmationAcknowledged } from '../../db/dailyActions'
import { affirmationTextSchema, type AffirmationMode } from '../../domain/dailyActions'

export function Affirmation({mode,date}:{mode:AffirmationMode,date:string}){
  const [state,setState]=useState<{text:string,acknowledged:boolean}|null>(null)
  const [draft,setDraft]=useState('')
  const [editing,setEditing]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    let active=true
    readAffirmation(mode,date).then(value=>{if(active){setState(value);setDraft(value.text);setError('')}}).catch(()=>{if(active)setError('Could not load the affirmation. Please retry.')})
    return()=>{active=false}
  },[mode,date,retry])
  async function edit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    if(!state||busy)return
    const parsed=affirmationTextSchema.safeParse(draft)
    if(!parsed.success){setError(parsed.error.issues[0]?.message??'Check the affirmation.');return}
    setBusy(true);setError('');setMessage('')
    try{const text=await saveAffirmation(mode,parsed.data);setState(old=>old?{...old,text}:old);setDraft(text);setEditing(false);setMessage('Affirmation saved.')}
    catch{setError('Could not save your affirmation. Please retry.')}
    finally{setBusy(false)}
  }
  async function reset(){
    if(!state||busy)return
    setBusy(true);setError('');setMessage('')
    try{const text=await resetAffirmation(mode);setState(old=>old?{...old,text}:old);setDraft(text);setEditing(false);setMessage('Default affirmation restored.')}
    catch{setError('Could not restore the default. Please retry.')}
    finally{setBusy(false)}
  }
  async function acknowledge(){
    if(!state||busy)return
    setBusy(true);setError('');setMessage('')
    try{const acknowledged=await setAffirmationAcknowledged(date,!state.acknowledged);setState(old=>old?{...old,acknowledged}:old);setMessage(acknowledged?'Morning check-in saved.':'Morning check-in undone.')}
    catch{setError('Could not save your check-in. Please retry.')}
    finally{setBusy(false)}
  }
  return <section className="card intention" aria-label="Morning affirmation">
    <p className="eyebrow">TODAY'S INTENTION</p>
    {!state?<><p role="status">{error||'Loading your affirmation…'}</p>{error&&<button onClick={()=>{setError('');setRetry(n=>n+1)}}>Retry</button>}</>:<>
      <h2 className="vision-copy">{state.text}</h2>
      <p className="muted small">A moment to begin with intention. Skip any day without penalty.</p>
      {editing?<form onSubmit={edit}><label className="field">Your affirmation<textarea rows={3} maxLength={300} required value={draft} disabled={busy} onChange={e=>setDraft(e.target.value)}/></label><div className="action-row"><button className="primary inline-primary" type="submit" disabled={busy}>Save affirmation</button><button type="button" disabled={busy} onClick={()=>{setDraft(state.text);setEditing(false);setError('')}}>Cancel</button><button type="button" disabled={busy} onClick={()=>void reset()}>Restore default</button></div></form>:<div className="action-row"><button className="primary inline-primary" disabled={busy} onClick={()=>void acknowledge()}>{state.acknowledged?<><CheckCircle2 size={18} aria-hidden="true"/> Undo check-in</>:<><Sprout size={18} aria-hidden="true"/> Acknowledge today</>}</button><button disabled={busy} onClick={()=>{setDraft(state.text);setEditing(true);setMessage('');setError('')}}>Edit affirmation</button></div>}
      {busy&&<p role="status">Saving…</p>}
      {message&&!busy&&<p role="status" className="save-message">{message}</p>}
      {error&&<p role="alert">{error}</p>}
    </>}
  </section>
}
