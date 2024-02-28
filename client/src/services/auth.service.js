import axios from 'axios';
import { setItem, getItem } from './localstorage.service';

const backendUrl = 'http://localhost:5000';

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${backendUrl}/login`, {
      username,
      password,
      params: {
        connectToSyno: true
      }
    });
    if (response.status === 200) {
      setItem('username', username);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = () => Boolean(getItem('token'));

export const getFiles = async (path = '/Media') => {
  try {
    const token = localStorage.getItem('token').replace(/['"]+/g, '');
    axios.defaults.headers.common['Authorization'] = token;
    const response = await axios.get(`${backendUrl}/files`, {
      params: { path }
    });
    return response;
  } catch (error) {
    throw error;
  }
};
