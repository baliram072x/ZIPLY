const API_URL = '/api';

export const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem('ziply_auth_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${res.status}`);
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('ziply_auth_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'API Error');
    return result;
  },
};
