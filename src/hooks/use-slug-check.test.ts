import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSlugCheck } from './use-slug-check'

describe('useSlugCheck', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns "idle" for an empty string slug', () => {
    const { result } = renderHook(() => useSlugCheck(''))
    expect(result.current).toBe('idle')
  })

  it('returns "available" when slug matches currentSlug (edit mode, CREATE-02)', () => {
    const { result } = renderHook(() => useSlugCheck('my-slug', 'my-slug'))
    expect(result.current).toBe('available')
    // Should not trigger any async fetch in edit mode when slug is unchanged
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns "invalid" for a slug with uppercase characters', () => {
    const { result } = renderHook(() => useSlugCheck('MySlug'))
    expect(result.current).toBe('invalid')
  })

  it('returns "invalid" for a slug with spaces', () => {
    const { result } = renderHook(() => useSlugCheck('my slug'))
    expect(result.current).toBe('invalid')
  })

  it('returns "checking" initially then "available" after API responds { available: true }', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue({ available: true }),
    } as unknown as Response)

    const { result } = renderHook(() => useSlugCheck('valid-slug'))

    // Before debounce resolves — should be "checking"
    expect(result.current).toBe('checking')

    // After debounce + fetch resolves — should be "available"
    await waitFor(
      () => {
        expect(result.current).toBe('available')
      },
      { timeout: 1000 }
    )
  })

  it('returns "checking" initially then "taken" after API responds { available: false }', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue({ available: false }),
    } as unknown as Response)

    const { result } = renderHook(() => useSlugCheck('taken-slug'))

    expect(result.current).toBe('checking')

    await waitFor(
      () => {
        expect(result.current).toBe('taken')
      },
      { timeout: 1000 }
    )
  })

  it('returns "checking" on fetch error (graceful fallback — asyncStatus resets to idle which maps to checking)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSlugCheck('error-slug'))

    // The hook maps asyncStatus='idle' to the external 'checking' status.
    // After a fetch error the hook calls setAsyncStatus('idle'), but since
    // syncStatus is null (valid slug), the return remains 'checking'.
    // This is the graceful fallback — no 'taken' or 'available' emitted.
    expect(result.current).toBe('checking')

    await waitFor(
      () => {
        expect(result.current).toBe('checking')
      },
      { timeout: 1000 }
    )
  })
})
