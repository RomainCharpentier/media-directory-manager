import axios from 'axios';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

const axiosInstance = axios.create({
  baseURL: process.env.SYNOLOGY_URL,
  headers,
  withCredentials: true
});

axios.default
  .request({
    baseURL: process.env.SYNOLOGY_URL,
    withCredentials: 'true'
  })
  .then((res) => {
    // console.log(res);
  });

axiosInstance.interceptors.request.use(
  function (config) {
    // Log de la requête avec les headers
    // console.log('Request:', config);

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const logout = () =>
  axiosInstance.get('/webapi/entry.cgi', {
    params: {
      api: 'SYNO.API.Auth',
      version: '6',
      method: 'logout',
      session: 'FileStation'
    }
  });

const login = async (user, password) => {
  await logout();
  return axiosInstance.get('/webapi/entry.cgi', {
    params: {
      api: 'SYNO.API.Auth',
      version: '6',
      method: 'login',
      account: user,
      passwd: password,
      enable_syno_token: 'yes',
      session: 'FileStation'
    }
  });
};

const createApi = async (api) => {
  const response = await api();
  // if (response.data.error && response.data.error.code === 119) {
  //   await login();
  //   return api();
  // }
  return response;
};

const getFiles = (folder = '/Media', { token, cookie }) => {
  return createApi(() =>
    axiosInstance.get(
      '/webapi/entry.cgi',
      {
        params: {
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list',
          SynoToken: token,
          folder_path: folder,
          additional: '["real_path","size","time,perm","type"]'
        },
        headers: { ...headers, Cookie: cookie }
      },
      {
        withCredentials: true
      }
    )
  );
};

const deleteFile = (filePath, token) =>
  createApi(() =>
    axiosInstance.get('/webapi/entry.cgi', {
      params: {
        api: 'SYNO.FileStation.Delete',
        version: '2',
        method: 'delete',
        SynoToken: token,
        path: filePath,
        recursive: true
      }
    })
  );

export { login, getFiles, deleteFile };
