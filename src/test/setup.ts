import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

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

// Mock next/image — render a plain <img> React element
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: { src: string; alt: string; width?: number; height?: number; className?: string }) =>
    React.createElement('img', { src, alt, width, height, className }),
}))

// Mock next/link — render a plain <a> React element with children
vi.mock('next/link', () => ({
  default: ({ href, children, className, ...rest }: { href: string; children: React.ReactNode; className?: string; [key: string]: unknown }) =>
    React.createElement('a', { href, className, ...rest }, children),
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
