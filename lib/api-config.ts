// API Configuration
// Toggle between real API and mock data

export const API_CONFIG = {
  // Set to false to use mock data (for development without backend)
  USE_REAL_API: true,

  // Backend API URL
  BASE_URL: "http://sewedyassessmentsys.runasp.net/api",

  // Timeout for API requests (milliseconds)
  TIMEOUT: 10000,
};

// Helper to check if we should use real API
export function shouldUseRealAPI(): boolean {
  return API_CONFIG.USE_REAL_API;
}

// Helper to get API base URL
export function getAPIBaseURL(): string {
  return API_CONFIG.BASE_URL;
}
