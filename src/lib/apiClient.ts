const API_BASE_URL = 'http://localhost:5179'; // Default ASP.NET Core port

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    let errorMessage = `API Error: ${response.status}`;
    
    if (errorData.errors && typeof errorData.errors === 'object') {
      const firstErrorKey = Object.keys(errorData.errors)[0];
      if (firstErrorKey && Array.isArray(errorData.errors[firstErrorKey])) {
        errorMessage = errorData.errors[firstErrorKey][0];
      }
    } else if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.title) {
      errorMessage = errorData.title;
    }
    
    // Dispatch global toast event
    window.dispatchEvent(new CustomEvent('globalToast', { 
      detail: { type: 'error', message: errorMessage } 
    }));
    
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}
