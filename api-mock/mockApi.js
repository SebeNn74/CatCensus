// Wrapper que reexporta la implementación modular del mock API.
import { initializeMockApi } from './fetchInterceptor.js'
import { resetMockDatabase, getMockDatabase } from './db.js'

export { initializeMockApi, resetMockDatabase, getMockDatabase }