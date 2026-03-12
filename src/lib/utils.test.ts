import { describe, it, expect } from 'vitest'
import { cn, formatScanCount } from './utils'

describe('cn', () => {
  it('merges multiple class name strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('omits falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null as never, '')).toBe('foo')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('resolves Tailwind conflicts via twMerge (last wins)', () => {
    // twMerge should collapse conflicting utility classes
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('returns empty string when given no arguments', () => {
    expect(cn()).toBe('')
  })
})

describe('formatScanCount', () => {
  it('returns "0" for 0', () => {
    expect(formatScanCount(0)).toBe('0')
  })

  it('returns the raw number string for values under 1 000', () => {
    expect(formatScanCount(999)).toBe('999')
  })

  it('returns "1.0k" for 1 000', () => {
    expect(formatScanCount(1000)).toBe('1.0k')
  })

  it('returns "1.2k" for 1 200', () => {
    expect(formatScanCount(1200)).toBe('1.2k')
  })

  it('returns "10.0k" for 10 000', () => {
    expect(formatScanCount(10000)).toBe('10.0k')
  })

  it('returns "100.0k" for 100 000 (ANLYT-02)', () => {
    expect(formatScanCount(100000)).toBe('100.0k')
  })
})
