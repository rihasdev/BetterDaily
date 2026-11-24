import { describe, expect, it } from 'vitest'
import { localDate } from './date'
describe('local date',()=>{
  it('uses local calendar components',()=>expect(localDate(new Date(2024,1,29,23,59))).toBe('2024-02-29'))
  it('rolls into a new year',()=>expect(localDate(new Date(2026,11,31,24))).toBe('2027-01-01'))
})
