// src/services/api.js
import axios from 'axios';
import { getToken, storeToken } from '../utils/authStorage';

const API_URL = 'http://192.168.1.13:8000';

export const fetchProjects = async () => {
  let token = await getToken();

  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/projC/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.projects; // Return the project data
  } catch (error) {
    if (error.response && error.response.status === 401) { // Unauthorized
      await refreshToken(); // Attempt to refresh the token
      token = await getToken(); // Retrieve the new token
      // Retry the request with the new token
      const retryResponse = await axios.get(`${API_URL}/projC/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return retryResponse.data.projects; // Return the project data
    } else {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }
};

const refreshToken = async () => {
  const refreshToken = await getToken();

  if (!refreshToken) {
    console.error('No refresh token found');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/authmobile/refresh/`, {
      refresh: refreshToken,
    });

    const { access } = response.data;
    await storeToken(access); // Store the new access token
  } catch (error) {
    console.error('Error refreshing the token:', error);
  }
};