// https://anilist.gitbook.io/anilist-apiv2-docs/

import axios from 'axios';

const searchAnimes = async (searchInput) => {
  const query = `
    query ($page: Int, $perPage: Int, $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          perPage
        }
        media(search: $search, type: ANIME, sort: FAVOURITES_DESC) {
          id
          title {
            romaji
            english
            native
          }
          type
          genres
        }
      }
    }
 `;

  const result = await axios({
    method: 'post',
    query,
    variables: {
      search: searchInput,
      page: 1,
      perPage: 10
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }).catch((err) => console.error(err.message));

  return result;
};

export { searchAnimes };
