const API_URL = '/api';

export const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem('ziply_auth_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status === 304) {
      const text = await res.text();
      return text ? JSON.parse(text) : undefined;
    }

    const text = await res.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = { error: 'Invalid JSON response from server' };
    }

    if (!res.ok) {
      throw { status: res.status, ...result };
    }

    return result;
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
    const text = await res.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = { error: 'Invalid JSON response from server' };
    }

    if (!res.ok) {
      throw { status: res.status, ...result };
    }

    return result;
  },

  async patch(endpoint: string, data: any) {
    const token = localStorage.getItem('ziply_auth_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = { error: 'Invalid JSON response from server' };
    }

    if (!res.ok) {
      throw { status: res.status, ...result };
    }

    return result;
  },
};
