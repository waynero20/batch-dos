import { describe, expect, it } from 'vitest'
import { ROSTER } from './roster'
import { rankRoster } from './roster-search'

const search = (query: string, limit?: number) => rankRoster(ROSTER, query, limit)

describe('rankRoster', () => {
  it('returns nothing until something is typed', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('finds a member by first name alone', () => {
    expect(search('wayne')[0]).toBe('Rondina, Wayne')
  })

  it('matches terms in any order, so "wayne rondina" works like the sheet order', () => {
    expect(search('rondina wayne')).toEqual(['Rondina, Wayne'])
    expect(search('wayne rondina')).toEqual(['Rondina, Wayne'])
  })

  it('ranks a surname prefix above a match buried mid-word', () => {
    // "Axlrose" also contains "ros", but the Ros- surnames are what you meant.
    expect(search('ros')).toEqual([
      'Rosal, Jean Marie',
      'Rosette, Avril',
      'Arigo, Jam Bridgette Axlrose',
    ])
  })

  it('folds accents, so "nina" reaches "Niña"', () => {
    expect(search('nina')).toEqual(['Perez, Niña Marie Joana'])
  })

  it('keeps shared surnames together and alphabetical', () => {
    expect(search('yaun')).toEqual(['Yaun, Leela', 'Yaun, Rodito'])
  })

  it('ignores the comma, so a typed full name still matches', () => {
    // "Veran, Jenny" also contains "ran", inside the surname — so she may follow,
    // but the man actually called Ran has to come first.
    expect(search('veran, ran')[0]).toBe('Veran, Ran Clark')
  })

  it('requires every term to match', () => {
    expect(search('wayne tan')).toEqual([])
  })

  it('returns nothing for a name that is not on the masterlist', () => {
    expect(search('zzz')).toEqual([])
  })

  it('caps how many names come back', () => {
    // A bare "a" matches most of the roster; the input only has room for a few.
    expect(search('a', 6)).toHaveLength(6)
    expect(search('a').length).toBeLessThanOrEqual(6)
  })
})
