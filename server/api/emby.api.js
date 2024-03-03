// https://dev.emby.media/doc/restapi/Locating-the-Server.html

import axios from 'axios';
import dotenv from 'dotenv';
//import he from 'he';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const getFiles = () => {
  return axios.get(
    `${process.env.EMBY_URL}/emby/Users/${process.env.EMBY_USERID}/Items}`,
    {
      params: {
        api_key: process.env.EMBY_API_KEY,
        Recursive: true,
        IncludeItemTypes: ['Movie', 'Episode'],
        SortBy: 'DatePlayed',
        SortOrder: 'descending',
        Limit: 10
      }
    }
  );
};

const getFile = (filePath) => {
  console.log(filePath);
  return axios.get(`${process.env.EMBY_URL}/emby/Items`, {
    params: {
      api_key: process.env.EMBY_API_KEY,
      Recursive: true,
      // Path: he.decode(filePath)
      Path: filePath,
      Fields:
        'Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines'
    }
  });
};

export { getFiles, getFile };
