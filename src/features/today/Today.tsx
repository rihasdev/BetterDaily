import { Sun, Moon, Sprout, Heart, Brain, Footprints, Dumbbell, Smartphone, BookOpen } from 'lucide-react'
import { Affirmation } from '../habits/Affirmation'
import { Routine } from '../habits/Routine'
const groups=[
  {name:'During the day',icon:Sun,items:[{name:'Micro-miracles',icon:Heart},{name:'Mindful decision filter',icon:Brain},{name:'Thought journal',icon:BookOpen},{name:'Sports & activity',icon:Dumbbell}]},
  {name:'Evening',icon:Moon,items:[{name:'Digital sunset',icon:Smartphone},{name:'Evening reflection',icon:Footprints}]}
]
export function Today({faithMode,date}:{faithMode:boolean,date:string}){
  const mode=faithMode?'faith':'general'
  return <>
    <p className="eyebrow">YOUR DAILY JOURNEY</p>
    <h1>A fresh start.</h1><p className="muted">Small steps are still steps forward.</p>
    <section className="hero"><div><span>LEVEL 1 · SEEDLING</span><h2>Grow at your own pace.</h2><p>Build your routine one action at a time. XP is coming in a later milestone.</p></div><Sprout size={64} aria-hidden="true"/></section>
    <Affirmation key={mode+':'+date} mode={mode} date={date}/>
    <p className="muted small">Open Goals to review your life vision.</p>
    <Routine key={date} date={date} today={date}/>
    {groups.map(({name,icon:Icon,items})=><section key={name} className="card"><h2 className="section-title"><Icon aria-hidden="true" size={22}/>{name}</h2>{items.map(({name,icon:ItemIcon})=><div className="feature-row" key={name}><ItemIcon size={19} aria-hidden="true"/><span>{name}</span><small>Planned</small></div>)}</section>)}
    {faithMode&&<section className="card"><h2>Islamic lifestyle mode</h2><p className="muted">Salah, Dua and Dhikr tools are planned. Worship will never earn points.</p></section>}
  </>
}
