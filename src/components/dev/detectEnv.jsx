/**
 * Checks if the current environment is production by inspecting the hostname.
 * This is a robust client-side method that avoids build-tool-specific variables.
 * @returns {boolean} - True if the environment is considered production, false otherwise.
 */
export const isProduction = () => {
  // Ensure this code only runs in the browser
  if (typeof window === 'undefined') {
    // Return a safe default for SSR or other non-browser environments.
    // Assuming non-browser is not production for client-side logic.
    return false;
  }

  const hostname = window.location.hostname;

  // Local development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }

  // Base44 preview environments
  if (hostname.includes('preview--')) {
    return false;
  }
  
  // If it's not a known development/preview environment, assume it's production.
  return true;
};