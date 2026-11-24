import { Sun, Sunrise, Moon, Sprout, Heart, Brain, Droplets, Footprints, Dumbbell, Smartphone, BookOpen, Target } from 'lucide-react'
const groups=[
  {name:'Morning',icon:Sunrise,items:[{name:'Life vision',icon:Target},{name:'Morning affirmation',icon:Sprout},{name:'Sunlight, movement & water',icon:Droplets}]},
  {name:'During the day',icon:Sun,items:[{name:'Micro-miracles',icon:Heart},{name:'Mindful decision filter',icon:Brain},{name:'Thought journal',icon:BookOpen},{name:'Sports & activity',icon:Dumbbell}]},
  {name:'Evening',icon:Moon,items:[{name:'Digital sunset',icon:Smartphone},{name:'Evening reflection',icon:Footprints}]}
]
export function Today({faithMode}:{faithMode:boolean}){
  return <>
    <p className="eyebrow">YOUR DAILY JOURNEY</p>
    <h1>A fresh start.</h1><p className="muted">Small steps are still steps forward.</p>
    <section className="hero"><div><span>LEVEL 1 · SEEDLING</span><h2>Grow at your own pace.</h2><p>Daily tracking and XP are coming in later milestones.</p></div><Sprout size={64} aria-hidden="true"/></section>
    <section className="card intention"><p className="eyebrow">TODAY'S INTENTION</p><h2>{faithMode?"Today is going to be a great day, Insha'Allah.":"I will approach today with intention and kindness."}</h2></section>
    {groups.map(({name,icon:Icon,items})=><section key={name} className="card"><h2 className="section-title"><Icon aria-hidden="true" size={22}/>{name}</h2>{items.map(({name,icon:ItemIcon})=><div className="feature-row" key={name}><ItemIcon size={19} aria-hidden="true"/><span>{name}</span><small>Planned</small></div>)}</section>)}
    {faithMode&&<section className="card"><h2>Islamic lifestyle mode</h2><p className="muted">Salah, Dua and Dhikr tools are planned. Worship will never earn points.</p></section>}
  </>
}
