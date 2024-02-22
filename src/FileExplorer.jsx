import React, { useEffect, useState } from 'react';
import folderIcon from './folder.png';
import fileIcon from './file.png';
import './FileExplorer.css';
import axios from 'axios';

//https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf
const FileExplorer = () => {
  const [files, setFiles] = useState([]);

  const headers = {
    'Access-Control-Allow-Origin': '*'
  };


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
      const token = await axios.get(
        '/webapi/entry.cgi',
        {
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
        })
      const response = await axios.get(
        '/webapi/entry.cgi',
        {
          params: {
            api: 'SYNO.FileStation.List',
            version: '2',
            method: 'list',
            SynoToken: token.data.data.synotoken,
            folder_path: '/Media/Films',
            recursive: true,
            additional: '["real_path","size","time,perm","type"]'
          },
          headers
        })
        console.log(response.data.data.files)
        await axios.get(
          '/webapi/entry.cgi',
          {
            params: {
              api: 'SYNO.API.Auth',
              version: '6',
              method: 'logout',
              session: 'FileStation'
            },
            headers
          })
      // setFiles(response.data.data.files);
      setFiles(response.data.data.files.sort((a,b) => b.additional.size - a.additional.size));
  }

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    const sortedFiles = sortFilesByDirectories(fileList);
    setFiles(Object.entries(sortedFiles)[0][1]);
  };

  const sortFilesByDirectories = (fileList) => {
    const filesByDirectories = {};
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const pathSegments = file.webkitRelativePath.split('/');
      let currentDirectory = filesByDirectories;
      for (let j = 0; j < pathSegments.length - 1; j++) {
        const directory = pathSegments[j];
        if (!currentDirectory[directory]) {
          currentDirectory[directory] = {};
        }
        currentDirectory = currentDirectory[directory];
      }
      if (!currentDirectory.files) {
        currentDirectory.files = [];
      }
      currentDirectory.files.push(file);
    }
    return filesByDirectories;
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  };

  const getFolderSize = (folder) => {
    const folderEntries = Object.entries(folder)
    if (!folderEntries || !folderEntries.length) {
      return 0
    }
    if (folderEntries.length === 1 && folderEntries.items) {
      return folder.items.map(item => item.size).reduce((a,b) => a + b, 0)
    }
    return folderEntries.map(([name, item]) => {
      if (name === 'files') {
        return item.map(item => item.size).reduce((a,b) => a + b, 0)
      } else {
        return getFolderSize(item)
      }
    }).reduce((a,b) => a + b, 0)
  }

  const renderFiles = (files, depth = 0) => {
    return (
      <ul className={`depth-${depth}`}>
          {files.map(item => <>
            {!item.isdir ? (
                  <li key={item.name}>
                    <img src={fileIcon} alt="file" />
                    <span className="file-info">
                      <span className="file-name">{item.name}</span>
                      <span className="file-size">{formatFileSize(item.additional.size)}</span>
                    </span>
                  </li>
            ) : (
              <li key={item.name}>
                <img src={folderIcon} alt="folder" />
                <span className="file-info">
                  <span className="file-name">{item.name}</span>
                  <span className="file-size">{formatFileSize(item.additional.size)}</span>
                </span>
              </li>
            )}
          </>
        )}
      </ul>
    );
  };  

  return (
    <div className="file-explorer">
      <h1>Explorer le contenu d'un répertoire</h1>
      <div className="file-list">{renderFiles(files)}</div>
      { (!files || !files.length) && <p>Chargement ...</p>}
    </div>
  );
};

export default FileExplorer;
