import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from './use-copy-to-clipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    // Reset clipboard mock before each test
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with copied = false', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.copied).toBe(false)
  })

  it('sets copied = true after a successful copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })

    expect(result.current.copied).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world')
  })

  it('resets copied to false after 2000ms', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('hello world')
    })

    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.copied).toBe(false)
  })

  it('silently handles clipboard API denial — copied stays false', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new DOMException('Permission denied', 'NotAllowedError')
    )

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      // Should not throw
      await result.current.copy('hello world')
    })

    expect(result.current.copied).toBe(false)
  })
})
