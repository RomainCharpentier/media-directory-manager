import axios from 'axios';

const backendUrl = 'http://localhost:5000';

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${backendUrl}/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFiles = async (folder = '/Media') => {
  try {
    const token = localStorage.getItem('token').replace(/['"]+/g, '');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${backendUrl}/files`, {
      params: { folder }
    });
    return response;
  } catch (error) {
    throw error;
  }
};
