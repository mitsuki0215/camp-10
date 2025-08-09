import { auth } from '../firebase/config';

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = {
  async get(endpoint, useAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw { response: { data: errorData }, message: `HTTP error! status: ${response.status}` };
    // }
    
    return response.json();
  },

  async post(endpoint, data, useAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw { response: { data: errorData }, message: `HTTP error! status: ${response.status}` };
    // }
    
    return response.json();
  },

  async put(endpoint, data, useAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw { response: { data: errorData }, message: `HTTP error! status: ${response.status}` };
    // }
    
    return response.json();
  },

  async delete(endpoint, useAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (useAuth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw { response: { data: errorData }, message: `HTTP error! status: ${response.status}` };
    // }
    
    return response.json();
  },
};

export default apiClient;