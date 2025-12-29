import { useAuthStore } from '../store/auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  // Don't set Content-Type if it's FormData (for file uploads)
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    // Only set Content-Type if it's not FormData
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    Object.assign(headers, { 'Authorization': `Bearer ${token}` });
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If the response is 401 (Unauthorized), try to refresh the token
  if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (accessToken) => {
            try {
              const retryHeaders: HeadersInit = {
                ...headers,
                Authorization: `Bearer ${accessToken}`,
              };
              const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: retryHeaders,
                credentials: 'include',
              });

              if (!retryResponse.ok) {
                const error = await retryResponse.json().catch(() => ({ error: retryResponse.statusText }));
                reject(new ApiError(retryResponse.status, error.error || 'Request failed', error));
                return;
              }

              const data = await retryResponse.json();
              resolve(data as T);
            } catch (error) {
              reject(error);
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const { accessToken } = await refreshResponse.json();
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        
        // Retry the original request with the new token
        Object.assign(headers, { 'Authorization': `Bearer ${accessToken}` });
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        processQueue(new ApiError(401, 'Session expired'), null);
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        window.location.href = '/auth/login';
        return Promise.reject(new ApiError(401, 'Session expired'));
      }
    } catch (error) {
      processQueue(error, null);
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      window.location.href = '/auth/login';
      return Promise.reject(new ApiError(401, 'Session expired'));
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, error.error || 'Request failed', error);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) => {
    // Check if data is FormData (for file uploads) and handle accordingly
    if (data instanceof FormData) {
      return request<T>(endpoint, {
        method: 'POST',
        body: data,
        // Content-Type header will be set by browser for FormData
      });
    } else {
      return request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },
  put: <T>(endpoint: string, data?: any) => {
    // Check if data is FormData (for file uploads) and handle accordingly
    if (data instanceof FormData) {
      return request<T>(endpoint, {
        method: 'PUT',
        body: data,
        // Content-Type header will be set by browser for FormData
      });
    } else {
      return request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },
  patch: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};


