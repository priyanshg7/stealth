/**
 * Centralized API Client for KisanMitra Frontend
 * Normalizes HTTP requests, headers, timeouts, and error handling.
 */

const DEFAULT_TIMEOUT_MS = 15000;

export async function apiRequest(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT_MS,
    isFormData = false
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestHeaders = { ...headers };
  if (!isFormData && body && typeof body === 'object' && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: isFormData || typeof body === 'string' ? body : JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorJson = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Not JSON
      }

      const errorMessage = errorJson.detail || errorText || `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorJson;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeout / 1000}s`);
    }
    throw err;
  }
}

export const apiClient = {
  get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => apiRequest(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => apiRequest(url, { ...options, method: 'PUT', body }),
  delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' })
};
