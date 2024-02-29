import React, { useEffect, useState } from 'react';
import './FileExplorer.css';
import { getFiles } from '../services/auth.service';
import { formatFileSize } from '../utils/format.utils';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
  Button,
  List,
  TextField,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FolderIcon from '@mui/icons-material/Folder';
import { grey, pink, yellow } from '@mui/material/colors';

const DEFAULT_FOLDER = '/Media/Films/DC';
const FileExplorer = () => {
  const [files, setFiles] = useState([]);
  const [folderPath, setFolderPath] = useState(DEFAULT_FOLDER);
  const [filesError, setFilesError] = useState(null);

  useEffect(() => {
    fetchData(folderPath);
  }, [folderPath]);

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
    setFiles([]);
    setFilesError(null);
    try {
      const folders = await getFilesRecursive(folder);
      setFiles(folders.sort((a, b) => getSize(b) - getSize(a)));
    } catch (error) {
      console.error('Error fetching data:', error);
      setFilesError(error);
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

  const getIcon = (file) => {
    if (file.isdir) {
      return <FolderIcon />;
    }
    switch (file.additional.type) {
      case 'MKV':
        return <VideoFileIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const renderFiles = (files, depth = 0) => {
    return (
      <List dense={true} sx={{ width: '100%' }}>
        {files.map((item) => (
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
            disablePadding
          >
            <ListItemButton
              onClick={() => {
                if (item.isdir) {
                  setFolderPath(item.path);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: item.isdir ? yellow[700] : grey[500] }}>
                  {getIcon(item)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={formatFileSize(getSize(item))}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <div className="file-explorer">
      <h1>Explorer le contenu d'un répertoire</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={() =>
            setFolderPath(folderPath.split('/').slice(0, -1).join('/'))
          }
        >
          <ArrowBackIcon />
        </IconButton>
        <TextField
          style={{ flex: '1' }}
          label="Folder path"
          variant="outlined"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <IconButton aria-label="search" onClick={() => fetchData(folderPath)}>
          <SearchIcon />
        </IconButton>
      </div>
      <div className="file-list">{renderFiles(files)}</div>
      {!files.length && !filesError && (
        <CircularProgress color="inherit" size="5rem" />
      )}
      {filesError && <p>Error : {filesError.message}</p>}
    </div>
  );
};

export default FileExplorer;
