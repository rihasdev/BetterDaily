// Do not use UTC ISO slicing for a user's local calendar date.
export function localDate(date=new Date()): string {
  const pad=(n:number)=>String(n).padStart(2,'0')
  return [String(date.getFullYear()).padStart(4,'0'),pad(date.getMonth()+1),pad(date.getDate())].join('-')
}
