import { describe, expect, it } from 'vitest'
import { DATES, candidateMonths, monthGrid, monthIndexOf } from './ballot'

const dayOf = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay()

describe('monthGrid', () => {
  const months = candidateMonths()

  it('pages only through the months holding an option', () => {
    expect(months).toEqual([
      { year: 2026, month: 11 },
      { year: 2027, month: 0 },
    ])
  })

  it('is always six Sunday-to-Saturday weeks, so paging never changes its height', () => {
    for (const { year, month } of months) {
      const grid = monthGrid(year, month)
      expect(grid.weeks).toHaveLength(6)
      for (const week of grid.weeks) expect(week).toHaveLength(7)
      expect(dayOf(grid.weeks[0]![0]!.iso)).toBe(0)
      expect(dayOf(grid.weeks[5]![6]!.iso)).toBe(6)
    }
  })

  it('runs consecutively, corner days included', () => {
    const days = monthGrid(2026, 11).weeks.flat().map((c) => c.iso)
    expect(new Set(days).size).toBe(days.length)
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(`${days[i - 1]}T00:00:00Z`)
      prev.setUTCDate(prev.getUTCDate() + 1)
      expect(days[i]).toBe(prev.toISOString().slice(0, 10))
    }
  })

  it('marks days outside the month so they can be greyed out', () => {
    const grid = monthGrid(2026, 11)
    const inMonth = grid.weeks.flat().filter((c) => c.inMonth)
    expect(inMonth).toHaveLength(31)
    expect(inMonth.every((c) => c.iso.startsWith('2026-12'))).toBe(true)
    expect(grid.weeks.flat().some((c) => !c.inMonth)).toBe(true)
  })

  it('names the month', () => {
    expect(monthGrid(2026, 11).label).toBe('December 2026')
    expect(monthGrid(2027, 0).label).toBe('January 2027')
  })

  it('marks only the ballot dates as pickable, once each, across all months', () => {
    const marked = months.flatMap((m) =>
      monthGrid(m.year, m.month).weeks.flat().filter((c) => c.dateId && c.inMonth),
    )
    expect(marked.map((c) => c.dateId).sort()).toEqual(DATES.map((d) => d.id).sort())
    for (const cell of marked) {
      expect(DATES.find((d) => d.id === cell.dateId)!.iso).toBe(cell.iso)
    }
  })

  it('finds the month a date belongs to', () => {
    expect(monthIndexOf('dec-26')).toBe(0)
    expect(monthIndexOf('jan-2')).toBe(1)
    expect(monthIndexOf('jan-9')).toBe(1)
  })
})
