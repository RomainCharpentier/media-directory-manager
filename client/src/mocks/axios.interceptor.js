import axios from 'axios';

const axiosInstance = axios.create();

const isMockEnabled = process.argv.includes('start:mock');

if (isMockEnabled) {
  axiosInstance.interceptors.request.use((config) => {
    if (config.url === '/api/user') {
      return Promise.resolve({ data: { id: 1, name: 'John Doe' } });
    }
    return config;
  });
}

export default axiosInstance;
