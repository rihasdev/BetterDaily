import { useRegisterSW } from 'virtual:pwa-register/react'
export function UpdateNotice(){
  const {needRefresh:[needRefresh],updateServiceWorker}=useRegisterSW()
  return needRefresh ? <aside className="card update" role="status">A new version is available. <button onClick={()=>void updateServiceWorker(true)}>Reload</button></aside> : null
}
