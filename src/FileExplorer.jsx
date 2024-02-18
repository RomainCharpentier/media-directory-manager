import React, { useState } from 'react';
import folderIcon from './folder.png';
import fileIcon from './file.png';
import './FileExplorer.css';

const FileExplorer = () => {
  const [files, setFiles] = useState([]);

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
        {Object.entries(files).map(([name, item], index) => (
          <>
            {name === 'files' ? (
              item && (
                item.map((file, fileIndex) => (
                  <li key={index}>
                    <img src={fileIcon} alt="file" />
                    <span className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </span>
                  </li>
                ))
              )
            ) : (
              <li key={index}>
                <img src={folderIcon} alt="folder" />
                <span className="file-info">
                  <span className="file-name">{name}</span>
                  <span className="file-size">{formatFileSize(getFolderSize(item))}</span>
                  {/*item.files ? renderFiles(item.files, depth + 1) : null*/}
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
      <input type="file" webkitdirectory="" directory="" onChange={handleFileChange} />
      <div className="file-list">{renderFiles(files)}</div>
    </div>
  );
};

export default FileExplorer;
