import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image — return a plain <img> to avoid Image Optimization API errors in jsdom
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props
    return Object.assign(document.createElement('img'), { src, alt, ...rest })
  },
}))

// Mock next/link — return a plain <a> to avoid Next.js router context requirement
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: unknown; [key: string]: unknown }) => {
    const a = document.createElement('a')
    a.href = href
    return Object.assign(a, rest, { children })
  },
}))

// Mock navigator.clipboard
Object.defineProperty(globalThis, 'navigator', {
  value: {
    ...globalThis.navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  },
  writable: true,
})
