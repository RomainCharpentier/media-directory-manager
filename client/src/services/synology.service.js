import { getItem, setItem } from './localstorage.service.js';
import axios from 'axios';

const headers = {
  'Access-Control-Allow-Origin': '*'
};

const logout = () =>
  axios.get('/webapi/entry.cgi', {
    params: {
      api: 'SYNO.API.Auth',
      version: '6',
      method: 'logout',
      session: 'FileStation'
    },
    headers
  });

const login = async () => {
  await logout();
  const response = await axios.get('/webapi/entry.cgi', {
    params: {
      api: 'SYNO.API.Auth',
      version: '6',
      method: 'login',
      account: process.env.REACT_APP_SYNOLOGY_API_LOGIN,
      passwd: process.env.REACT_APP_SYNOLOGY_API_PASSWORD,
      enable_syno_token: 'yes',
      session: 'FileStation'
    },
    headers
  });
  setItem('token', response.data.data.synotoken);
};

const createApi = async (api) => {
  const response = await api();
  if (response.data.error && response.data.error.code === 119) {
    await login();
    return api();
  }
  return response;
};

const getFiles = (folder = '/Media') =>
  createApi(() =>
    axios.get('/webapi/entry.cgi', {
      params: {
        api: 'SYNO.FileStation.List',
        version: '2',
        method: 'list',
        SynoToken: getItem('token'),
        folder_path: folder,
        additional: '["real_path","size","time,perm","type"]'
      },
      headers
    })
  );

const deleteFile = (filePath) =>
  createApi(() =>
    axios.get('/webapi/entry.cgi', {
      params: {
        api: 'SYNO.FileStation.Delete',
        version: '2',
        method: 'delete',
        SynoToken: getItem('token'),
        path: filePath,
        recursive: true
      },
      headers
    })
  );

export { getFiles, deleteFile };
