/**
 * Test data constants for E2E scenarios
 */

export const TEST_USERS = {
  admin: {
    username: 'admin@test.com',
    email: 'admin@test.com',
    password: 'Admin1234!',
    displayName: 'Admin User',
  },
  user1: {
    username: 'testuser1@test.com',
    email: 'testuser1@test.com',
    password: 'Test1234!',
    displayName: 'Test User 1',
  },
  user2: {
    username: 'testuser2@test.com',
    email: 'testuser2@test.com',
    password: 'Test1234!',
    displayName: 'Test User 2',
  },
  user3: {
    username: 'testuser3@test.com',
    email: 'testuser3@test.com',
    password: 'Test1234!',
    displayName: 'Test User 3',
  },
};

export const TEST_TEAMS = {
  backend: {
    name: 'Backend Team',
    description: 'Backend development team',
  },
  frontend: {
    name: 'Frontend Team',
    description: 'Frontend development team',
  },
};

export const TEST_PROJECTS = {
  core: {
    name: 'Graphify Core',
    description: 'Core module',
  },
  api: {
    name: 'Graphify API',
    description: 'REST API module',
  },
};

export const API_BASE_URL = 'http://localhost:8086/api';
export const FRONTEND_BASE_URL = 'http://localhost:3006';

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};
