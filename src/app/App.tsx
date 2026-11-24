import { useEffect, useState } from 'react'
import { House, Target, BookOpen, ChartNoAxesColumn, Settings as SettingsIcon, Sprout } from 'lucide-react'
import { readSettings,writeSettings,type Settings } from '../db/settings'
import { localDate } from '../domain/date'
import { Today } from '../features/today/Today'
import { UpdateNotice } from '../components/UpdateNotice'
import { LifeVision } from '../features/goals/LifeVision'
import { HabitSettings } from '../features/habits/HabitSettings'
import { History, Routine } from '../features/habits/Routine'

const tabs=[{name:'Today',icon:House},{name:'Goals',icon:Target},{name:'Journal',icon:BookOpen},{name:'Progress',icon:ChartNoAxesColumn}] as const
type Tab=typeof tabs[number]['name']|'Settings'
const planned={
  Journal:['Micro-miracles','Mindful decisions','Thought journal','Evening reflection'],
}
export default function App(){
  const [settings,setSettings]=useState<Settings|null>(null)
  const [tab,setTab]=useState<Tab>('Today')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [date,setDate]=useState(localDate())
  const [retry,setRetry]=useState(0)
  useEffect(()=>{
    let active=true
    readSettings().then(s=>{if(active){setSettings(s);setError('')}}).catch(()=>{if(active)setError('Unable to open local storage. Please check browser storage permissions and retry.')})
    return()=>{active=false}
  },[retry])
  useEffect(()=>{
    const update=()=>setDate(localDate())
    const timer=window.setInterval(update,30000)
    window.addEventListener('focus',update)
    document.addEventListener('visibilitychange',update)
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update)}
  },[])
  useEffect(()=>{
    document.documentElement.dataset.theme=settings?.theme??'system'
  },[settings?.theme])
  async function save(patch:Partial<Omit<Settings,'id'>>){
    if(!settings||busy)return
    setBusy(true);setError('')
    try{const next=await writeSettings({...settings,...patch});setSettings(next)}
    catch{setError('Your change could not be saved. Please retry.')}
    finally{setBusy(false)}
  }
  if(!settings)return <main className="shell"><h1>BetterDaily</h1><p role="status">{error||'Opening your local profile…'}</p>{error&&<button onClick={()=>{setError('');setRetry(v=>v+1)}}>Retry</button>}</main>
  if(!settings.onboarded)return <main className="shell onboarding"><Sprout size={58} aria-hidden="true"/><h1>Welcome to BetterDaily.</h1><p>Small actions. Meaningful changes. Every day.</p><section className="card"><h2>Your data stays here</h2><p>No account required. Preferences are stored in this browser. Clearing site data may remove them. Journal and backup tools are not available yet.</p><label className="toggle"><input type="checkbox" checked={settings.faithMode} disabled={busy} onChange={e=>void save({faithMode:e.target.checked})}/> Enable optional Islamic lifestyle mode</label></section>{error&&<p role="alert">{error}</p>}<button className="primary" disabled={busy} onClick={()=>void save({onboarded:true})}>{busy?'Saving…':'Get started'}</button></main>
  return <div className="shell">
    <a className="skip" href="#main">Skip to content</a>
    <header><div className="brand"><Sprout size={28} aria-hidden="true"/>betterdaily.</div><button className="icon-button" aria-label="Settings" aria-current={tab==='Settings'?'page':undefined} onClick={()=>setTab('Settings')}><SettingsIcon aria-hidden="true"/></button></header>
    <UpdateNotice/>
    <main id="main">
      <p className="date">{date} · Early development</p>
      {tab==='Today'?<Today faithMode={settings.faithMode} date={date}/>:tab==='Goals'?<><LifeVision/><Routine key={date} date={date} today={date} prioritiesOnly/></>:tab==='Progress'?<History today={date}/>:tab==='Settings'?<>
        <h1>Settings</h1><section className="card"><h2>Personalisation</h2><label className="toggle"><input type="checkbox" checked={settings.faithMode} disabled={busy} onChange={e=>void save({faithMode:e.target.checked})}/> Islamic lifestyle mode</label><label className="select-label">Appearance<select value={settings.theme} disabled={busy} onChange={e=>void save({theme:e.target.value as Settings['theme']})}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>{busy&&<p role="status">Saving…</p>}{error&&<p role="alert">{error}</p>}</section><section className="card"><h2>Privacy & installation</h2><p>Preferences live on this device. This is not encrypted storage. Backup, restore and data deletion controls will be implemented before MVP release.</p><p>When using the production build, look for Install app or Add to Home Screen in your browser menu.</p></section><HabitSettings key={date} today={date}/>
      </>:<><h1>{tab}</h1><section className="card"><h2>Coming next</h2><p className="muted">This screen is part of the app shell. These tools are not yet functional.</p>{planned[tab].map(name=><div className="feature-row" key={name}>{name}<small>Planned</small></div>)}</section></>}
    </main>
    <nav aria-label="Main navigation">{tabs.map(({name,icon:Icon})=><button key={name} aria-current={tab===name?'page':undefined} onClick={()=>setTab(name)}><Icon size={22} aria-hidden="true"/><span>{name}</span></button>)}</nav>
  </div>
}
