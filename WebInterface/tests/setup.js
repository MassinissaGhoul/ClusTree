import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Vue Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn()
}

const mockRoute = {
  params: {},
  query: {},
  path: '/',
  name: 'Home',
  meta: {}
}

// Global mocks for all components
config.global.mocks = {
  $router: mockRouter,
  $route: mockRoute
}

// Mock router-link component
config.global.stubs = {
  'router-link': {
    template: '<a><slot /></a>'
  }
}

// Global test utilities
global.mockRouter = mockRouter
global.mockRoute = mockRoute

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})