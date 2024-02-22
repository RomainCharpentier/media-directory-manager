import React, { useEffect, useState } from 'react';
import folderIcon from './folder.png';
import fileIcon from './file.png';
import './FileExplorer.css';
import { getFileList } from './services/synology.service';

//https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf
const FileExplorer = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchData('/Media/Films/DC');
  }, []);

  const fetchData = async (folder) => {
    try {
      const response = await getFileList(folder);
      const files = response.data.data.files;

      const folders = await Promise.all(
        files.map(async (file) => {
          if (file.isdir) {
            const r2 = await getFileList(file.path);
            file.items = r2.data.data.files;
          }
          return file;
        })
      );

      setFiles(folders.sort((a, b) => getSize(b) - getSize(a)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
    const folderEntries = folder.items;
    if (!folderEntries || !folderEntries.length) {
      return 0;
    }
    return (
      folder.additional.size +
      folderEntries
        .map((item) => {
          if (item.isdir) {
            return getFolderSize(item);
          } else {
            return item.additional.size;
          }
        })
        .reduce((a, b) => a + b)
    );
  };

  const getSize = (file) => {
    if (file.isdir) {
      return getFolderSize(file);
    }
    return file.additional.size;
  };

  const renderFiles = (files, depth = 0) => {
    return (
      <ul className={`depth-${depth}`}>
        {files.map((item) => (
          <>
            {!item.isdir ? (
              <li key={item.name}>
                <img src={fileIcon} alt="file" />
                <span className="file-info">
                  <span className="file-name">{item.name}</span>
                  <span className="file-size">
                    {formatFileSize(item.additional.size)}
                  </span>
                </span>
              </li>
            ) : (
              <li key={item.name}>
                <img src={folderIcon} alt="folder" />
                <span className="file-info">
                  <span className="file-name">{item.name}</span>
                  <span className="file-size">
                    {formatFileSize(getFolderSize(item))}
                  </span>
                </span>
              </li>
            )}
          </>
        ))}
      </ul>
    );
  };

  return (
    <div className="file-explorer">
      <h1>Explorer le contenu d'un répertoire</h1>
      <div className="file-list">{renderFiles(files)}</div>
      {(!files || !files.length) && <p>Chargement ...</p>}
    </div>
  );
};

export default FileExplorer;
