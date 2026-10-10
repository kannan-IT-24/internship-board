/**
 * InternHub API Client
 * Centralized service for communication with the Express + SQLite backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Fetch list of internships from backend with pagination, search, and filters.
 */
export async function getInternships({ page = 1, limit = 50, q, domain, mode } = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (q && q.trim()) params.append('q', q.trim());
  if (domain && domain !== 'All Domains') params.append('domain', domain);
  if (mode && mode !== 'All Modes') params.append('mode', mode);

  const url = `${API_BASE_URL}/internships?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const errorMessage = data?.error?.message || `Request failed with status ${response.status}`;
      const errorCode = data?.error?.code || 'FETCH_ERROR';
      throw new ApiError(errorMessage, errorCode, response.status);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Unable to connect to backend API at ${API_BASE_URL}. Ensure the server is running on port 5000.`,
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * Fetch a single internship record by ID.
 */
export async function getInternshipById(id) {
  const url = `${API_BASE_URL}/internships/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const errorMessage = data?.error?.message || `Internship not found (${response.status})`;
      const errorCode = data?.error?.code || 'NOT_FOUND';
      throw new ApiError(errorMessage, errorCode, response.status);
    }

    return data.data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Unable to reach API server to fetch internship ${id}.`,
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * Submit an internship application.
 */
export async function submitApplication({ internship_id, applicant_name, applicant_email }) {
  const url = `${API_BASE_URL}/applications`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        internship_id,
        applicant_name,
        applicant_email,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'error') {
      const errorMessage = data?.error?.message || 'Failed to submit application.';
      const errorCode = data?.error?.code || 'SUBMISSION_ERROR';
      throw new ApiError(errorMessage, errorCode, response.status);
    }

    return data.data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Network error: Failed to connect to server to submit application.',
      'NETWORK_ERROR',
      0
    );
  }
}

/**
 * Check backend health status.
 */
export async function checkHealth() {
  const url = `${API_BASE_URL}/health`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    throw new ApiError('Backend health check unreachable.', 'OFFLINE', 0);
  }
}
