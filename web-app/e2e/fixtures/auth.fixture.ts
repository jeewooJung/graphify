import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { TEST_USERS } from '../helpers/test-data';

export type AuthFixtures = {
  apiClient: ApiClient;
  userToken: string;
  adminToken: string;
};

export const test = base.extend<AuthFixtures>({
  apiClient: async ({ request }, use) => {
    const apiClient = new ApiClient(request);
    await use(apiClient);
  },

  userToken: async ({ apiClient }, use) => {
    // Register user if needed (or assume already exists)
    try {
      const { status } = await apiClient.register(
        TEST_USERS.user1.username,
        TEST_USERS.user1.email,
        TEST_USERS.user1.password,
        TEST_USERS.user1.displayName,
      );
      // 201 = created, 400 = already exists
    } catch (e) {
      // Ignore if already exists
    }

    // Login to get token
    const token = await apiClient.login(TEST_USERS.user1.username, TEST_USERS.user1.password);
    await use(token);
  },

  adminToken: async ({ apiClient }, use) => {
    // Register admin if needed
    try {
      await apiClient.register(
        TEST_USERS.admin.username,
        TEST_USERS.admin.email,
        TEST_USERS.admin.password,
        TEST_USERS.admin.displayName,
      );
    } catch (e) {
      // Ignore if already exists
    }

    // Login to get admin token
    const token = await apiClient.login(TEST_USERS.admin.username, TEST_USERS.admin.password);
    await use(token);
  },
});

export { expect };
