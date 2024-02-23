import axios from 'axios';

const api = axios.create();

const isMockEnabled = process.argv.includes('start:mock');

export default api;
