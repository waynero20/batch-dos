import { describe, expect, it } from 'vitest'
import { FOOD } from './ballot'

/**
 * The caterers' figures were transcribed out of single sentences and into separate
 * label/price/note fields so the card could lay them out. Nothing about that is
 * type-checked — a price dropped in the move would render as a tidy, wrong card — so
 * the numbers are pinned here against the proposal.
 */
describe('FOOD', () => {
  it('keeps every caterer nameable', () => {
    expect(FOOD.map((f) => f.name)).toEqual([
      'Packages & Bilao',
      "Rodmer's Lechon",
      'Food Trays',
    ])
    for (const f of FOOD) expect(f.tagline.trim()).not.toBe('')
  })

  it("carries the proposal's figures exactly", () => {
    const prices = Object.fromEntries(FOOD.map((f) => [f.id, f.rows.map((r) => r.price)]))
    expect(prices).toEqual({
      'bilao-packages': ['₱3,000–15,000', '₱1,200–3,000', '₱250–350'],
      rodmers: ['₱1,200', '₱700'],
      'food-trays': ['₱300–1,000', '₱500–2,000', '₱1,000–3,000'],
    })
  })

  it('gives every row a label and a peso price', () => {
    for (const f of FOOD) {
      expect(f.rows.length, `${f.id} rows`).toBeGreaterThanOrEqual(2)
      for (const row of f.rows) {
        expect(row.label.trim(), `${f.id} label`).not.toBe('')
        expect(row.price, `${f.id} price`).toMatch(/^₱[\d,–]+$/)
      }
    }
  })

  it('keeps the head-count figures alongside their prices', () => {
    const notes = FOOD.flatMap((f) => f.rows.map((r) => r.note)).filter(Boolean)
    expect(notes).toContain('15–40 pax')
    expect(notes).toContain('10–25 pax')
    expect(notes).toContain('40–50 pax')
    expect(notes).toContain('a head, tables and chairs in')
  })
})
