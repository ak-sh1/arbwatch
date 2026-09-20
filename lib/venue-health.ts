import { VenueHealth, VENUE_UNHEALTHY_THRESHOLD_ERRORS } from './types';

// In-memory venue health tracking
const venueHealthMap = new Map<string, VenueHealth>();

/**
 * Initialize venue health tracking
 */
export const initVenueHealth = (venue: string) => {
  if (!venueHealthMap.has(venue)) {
    venueHealthMap.set(venue, {
      venue,
      is_healthy: true,
      last_success_at: null,
      last_error_at: null,
      consecutive_errors: 0,
    });
  }
};

/**
 * Record successful venue response
 */
export const recordVenueSuccess = (venue: string) => {
  initVenueHealth(venue);
  const health = venueHealthMap.get(venue)!;
  
  health.is_healthy = true;
  health.last_success_at = new Date();
  health.consecutive_errors = 0;
  
  venueHealthMap.set(venue, health);
};

/**
 * Record venue error
 */
export const recordVenueError = (venue: string, errorMessage: string) => {
  initVenueHealth(venue);
  const health = venueHealthMap.get(venue)!;
  
  health.last_error_at = new Date();
  health.error_message = errorMessage;
  health.consecutive_errors += 1;
  
  // Mark unhealthy if consecutive errors exceed threshold
  if (health.consecutive_errors >= VENUE_UNHEALTHY_THRESHOLD_ERRORS) {
    health.is_healthy = false;
  }
  
  venueHealthMap.set(venue, health);
};

/**
 * Get venue health status
 */
export const getVenueHealth = (venue: string): VenueHealth => {
  initVenueHealth(venue);
  return venueHealthMap.get(venue)!;
};

/**
 * Get all venue health statuses
 */
export const getAllVenueHealth = (): VenueHealth[] => {
  return Array.from(venueHealthMap.values());
};

/**
 * Check if venue is healthy
 */
export const isVenueHealthy = (venue: string): boolean => {
  const health = getVenueHealth(venue);
  return health.is_healthy;
};

/**
 * Calculate uptime percentage for a venue
 * Based on success rate over last N attempts (stored in consecutive_errors)
 */
export const calculateVenueUptime = (venue: string): number => {
  const health = getVenueHealth(venue);
  
  if (!health.last_success_at && !health.last_error_at) {
    return 100; // No data yet
  }
  
  // Simple uptime based on health status
  return health.is_healthy ? 100 : 0;
};
