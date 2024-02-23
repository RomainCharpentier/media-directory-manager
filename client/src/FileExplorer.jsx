import React, { useEffect, useState } from 'react';
import folderIcon from './folder.png';
import fileIcon from './file.png';
import './FileExplorer.css';
import { getFiles } from './services/synology.service';
import { formatFileSize } from './utils/format.utils';

const DEFAULT_FOLDER = '/Media/Films/DC';
const FileExplorer = () => {
  const [files, setFiles] = useState([]);
  const [folderPath, setFolderPath] = useState(DEFAULT_FOLDER);

  useEffect(() => {
    fetchData(DEFAULT_FOLDER);
  }, []);

  const getFilesRecursive = async (folder) => {
    const response = await getFiles(folder);
    const files = response.data.data.files;

    return Promise.all(
      files.map(async (file) => {
        if (file.isdir) {
          const folderContent = await getFilesRecursive(file.path);
          file.items = folderContent;
        }
        return file;
      })
    );
  };

  const fetchData = async (folder) => {
    try {
      const folders = await getFilesRecursive(folder);
      setFiles(folders.sort((a, b) => getSize(b) - getSize(a)));
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchData(folderPath);
    }
  };

  const renderFiles = (files, depth = 0) => {
    return (
      <ul className={`depth-${depth}`}>
        {files.map((item) => (
          <li key={item.name}>
            <img src={item.isdir ? folderIcon : fileIcon} alt="file" />
            <span className="file-info">
              <span className="file-name">{item.name}</span>
              <span className="file-size">
                {formatFileSize(item.additional.size)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="file-explorer">
      <h1>Explorer le contenu d'un répertoire</h1>
      <input
        type="text"
        value={folderPath}
        onChange={(e) => setFolderPath(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button onClick={() => fetchData(folderPath)}>Confirm</button>
      <div className="file-list">{renderFiles(files)}</div>
      {(!files || !files.length) && <p>Chargement ...</p>}
    </div>
  );
};

export default FileExplorer;
