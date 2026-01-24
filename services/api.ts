import { API_BASE } from "@/lib/appwrite";

export const IGDB_CONFIG = {
    BASE_URL: 'https://api.igdb.com/v4',
    headers: {
      'Accept': 'application/json',
      'Client-ID': 'h47uvldjvq5w0sdw00qh6md6i2a4c0',
      'Authorization': 'Bearer aiqpktsq1prlvbacbtsun79e84gs82',
      'Content-Type': 'text/plain',  
    }
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

export const fetchGames = async ({ query }: { query: string}) => {
      
    const endpoint = `${IGDB_CONFIG.BASE_URL}/games`;
    let bodyStr = '';

  if (query) {
    const safeQuery = escapeQuotes(query);
    bodyStr = `search "${safeQuery}"; fields name, cover.url, rating, release_dates.y, genres.name; where version_parent = null;`;
  } else {
    bodyStr = 'fields name, cover.url, rating, release_dates.y; where aggregated_rating > 95; limit 30;';
  }
    const response = await fetch(endpoint, {
              method: 'POST',
              headers: IGDB_CONFIG.headers,
              body: bodyStr, 
})

    if(!response.ok) {
        throw new Error('Failed to fetch games', response.statusText);
    }

    const untransformedData = await response.json();

    function getMinYear(releaseDates: { id: number; y: number }[] ): string | null {
      if (!Array.isArray(releaseDates) || releaseDates.length === 0) return null;      
      const years = releaseDates
        .map(rd => rd.y)
        .filter(year => typeof year === 'number');
    
      if (years.length === 0) return null;
    
      return Math.min(...years).toString();
    }
    
    const data = untransformedData.map(item => {
      const releaseDates = Array.isArray(item.release_dates) ? item.release_dates : [];
      const minYearStr = getMinYear(releaseDates);
      return {
        id: item.id,
        cover_url: "//images.igdb.com/igdb/image/upload/t_cover_big/" + item.cover?.url.split('/').pop(),
        name: item.name,
        rating: item.rating,
        release_date: minYearStr,
      };
    });

    return data;
}

export const fetchGameDetails = async (gameId: string): Promise<GameDetails> => {
  // проверка данных в локальном API
  try {
    const apiResp = await fetch(`${API_BASE}/games/${gameId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (apiResp.ok) {
      const apiData = await apiResp.json();
      // контроллер games_get_single возвращает объект { game: doc, request: ... }
      if (apiData && apiData.game) {
        console.log(apiData);
        return {
          gameId: apiData.game.gameId,
          title: apiData.game.title,
          releaseDate: apiData.game.releaseDate ? (new Date(apiData.game.releaseDate)).getFullYear().toString() : null,
          description: apiData.game.description,
          averageRating: apiData.game.averageRating,
          coverImage: apiData.game.coverImage,
          genre: apiData.game.genre ?? apiData.game.genres ?? null,
          developer: apiData.game.developer ?? null,
        } as unknown as GameDetails;
      }
    }
    // если 404 или нет game — продолжим получать из IGDB
  } catch (err) {
    // пропустить и пробовать IGDB
    console.warn('Local API check failed, will fetch from IGDB:', err);
  }

  // запрос в IGDB
  const bodyStr = `fields name, summary, cover.url, rating, release_dates.y, genres.name, involved_companies.company.name; where id = ${gameId};`;
  const endpoint = `${IGDB_CONFIG.BASE_URL}/games`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: IGDB_CONFIG.headers,
      body: bodyStr,
    });

    if (!response.ok) throw new Error('Failed to fetch details from IGDB');

    const untransformedData = await response.json();

    function getMinYear(releaseDates: { id: number; y: number }[] ): string | null {
      if (!Array.isArray(releaseDates) || releaseDates.length === 0) return null;
      const years = releaseDates
        .map(rd => rd.y)
        .filter(year => typeof year === 'number');
      if (years.length === 0) return null;
      return Math.min(...years).toString();
    }

    const item = untransformedData[0];
    if (!item) throw new Error('No data from IGDB');

    const releaseDates = Array.isArray(item.release_dates) ? item.release_dates : [];
    const minYearStr = getMinYear(releaseDates);

    // объединение genres.name и involved_companies.company.name
    const genresArray = Array.isArray(item.genres) ? item.genres.map((g: any) => g.name).filter(Boolean) : [];
    const genresStr = genresArray.length ? genresArray.join('-') : '';

    const companiesArray = Array.isArray(item.involved_companies)
      ? item.involved_companies.map((ic: any) => ic.company?.name).filter(Boolean)
      : [];
    const developerStr = companiesArray.length ? companiesArray.join('-') : '';

    //подготовка объекта для записи в локальную БД (совпадает с полями контроллера games_add_game)
    const gameToSave = {
      gameId: gameId,
      title: item.name,
      genre: genresStr,
      developer: developerStr,
      releaseDate: minYearStr ? minYearStr : null,
      description: item.summary ?? null,
      averageRating: item.rating ?? null,
      coverImage: item.cover ? "//images.igdb.com/igdb/image/upload/t_cover_big/" + item.cover.url.split('/').pop() : null,
    };

    // запись в локальный API
    try {
      const saveResp = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(gameToSave),
      });

      // Возврат результата сервера (createdGame) или локального объекта с id при успешном сохранении 
      if (saveResp.ok) {
        const savedData = await saveResp.json();
        // Контроллер games_add_game возвращает createdGame в поле createdGame
        const created = savedData.createdGame ?? savedData.game ?? null;
        if (created) {
          return {
            gameId: created.gameId ?? gameId,
            title: created.title ?? gameToSave.title,
            releaseDate: created.releaseDate ? (new Date(created.releaseDate)).getFullYear().toString() : gameToSave.releaseDate,
            description: created.description ?? gameToSave.description,
            averageRating: created.averageRating ?? gameToSave.averageRating,
            coverImage: created.coverImage ?? gameToSave.coverImage,
            genre: created.genre ?? gameToSave.genre,
            developer: created.developer ?? gameToSave.developer,
          } as unknown as GameDetails;
        }
      } else {
        // возврат данных из IGDB при неуспешном сохранении 
        console.warn('Saving to local API failed:', saveResp.statusText);
      }
    } catch (err) {
      console.warn('Error saving to local API:', err);
    }

    // возврат объекта из IGDB, если запись в локальную БД не удалась или не вернула данные
    return {
      gameId: item.id,
      title: item.name,
      releaseDate: minYearStr,
      description: item.summary,
      averageRating: item.rating,
      coverImage: "//images.igdb.com/igdb/image/upload/t_cover_big/" + (item.cover?.url.split('/').pop() ?? ''),
      genre: genresStr,
      developer: developerStr,
    } as unknown as GameDetails;

  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchCollectionItems = async ({ query, userId }: { query: string; userId: string }) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const response = await fetch(`${API_BASE}/collectionitems/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch games', response.statusText);
  }

const data = await response.json();

  const transformedData = (data.games || []).map(item => ({
    userId: item.userId,
    gameId: item.gameId,
    title: item.title,
    coverImage: item.coverImage
  }));

  return transformedData;
  
}

export const fetchSingleColItem = async ({ query, userId, gameId }: { query: string; userId: string, gameId: string }) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const response = await fetch(`${API_BASE}/collectionitems/${userId}/${gameId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch games', response.statusText);
  }

const data = await response.json();


  return data;
}

export const fetchSingleUser = async ({ query, userId }: { query: string; userId: string }) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch games', response.statusText);
  }

const data = await response.json();


  return data;
}

export const fetchReviewsByGame = async ({ query, gameId }: { query: string; gameId: string }) => {
    
  const response = await fetch(`${API_BASE}/reviews/game/${gameId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  
if(!response.ok) {
      throw new Error('Failed to fetch reviews', response.statusText);
  }

const data = await response.json();
  
  const transformedData = (data.reviews || []).map((item, index) => ({
    userId: item.userId,
    gameId: item.gameId,
    userName: item.userName,
    title: item.title,
    reviewTitle: item.reviewTitle,
    reviewText: item.reviewText,
    reviewId: item.reviewId || index + 1, // Используем index+1 как временное решение
  }));

  console.log('fetchReviewsByGame transformed data:', transformedData);

  return transformedData;
  
}

export const fetchReviewsByUser = async ({ query, userId }: { query: string; userId: string }) => {
  
  const response = await fetch(`${API_BASE}/reviews/user/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch reviews', response.statusText);
  }

const data = await response.json();

  const transformedData = (data.reviews || []).map(item => ({
    userId: item.userId,
    gameId: item.gameId,
    userName: item.userName,
    title: item.title,
    reviewTitle: item.reviewTitle,
    reviewText: item.reviewText
  }));

  return transformedData;
  
}

export const fetchComments = async ({ query, reviewId }: { query: string; reviewId: string }) => {
    
  const response = await fetch(`${API_BASE}/comments/review/${reviewId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
  })

 
  if(!response.ok) {
      throw new Error('Failed to fetch comments', response.statusText);
  }

  const data = await response.json();


  // Возвращаем данные как есть, без трансформации
  return data;
  
}

export const fetchGamelists = async ({ query }: { query: string }) => {
 

  

  const response = await fetch(`${API_BASE}/gamelists/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  

  if(!response.ok) {
      throw new Error('Failed to fetch gamelists', response.statusText);
  }

  const data = await response.json();

  
 
  const transformedData = (data.gamelists || []).map((list: any, index: number) => ({
    listId: list.listId,
    listTitle: list.listTitle,
    userName: list.userName,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    games: list.games || []
  }));

  console.log('fetchGamelists transformed data:', transformedData);
  return transformedData;
  
}

export const fetchGameListSingle = async ({ query, listId }: { query: string; listId: string }) => {
  
  const response = await fetch(`${API_BASE}/gamelists/${listId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch gamelists', response.statusText);
  }

const data = await response.json();
  console.log('fetchGameListSingle raw data:', data);
   
  // For single list, backend returns a single object, not an array
  const transformedData = {
    listId: data.listId,
    listTitle: data.listTitle,
    userName: data.userName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    games: data.games || []
  };

  console.log('fetchGameListSingle transformed data:', transformedData);
  return transformedData;
  
}

export const fetchListsByUser = async ({ query, userId }: { query: string; userId: string }) => {
  
  const response = await fetch(`${API_BASE}/gamelists/user/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch lists', response.statusText);
  }

const data = await response.json();

  const transformedData = (data.gameLists || []).map(item => ({
    userId: item.userId,
    listId: item.listId,
    listTitle: item.listTitle,
  }));

  return transformedData;
  
}

export const fetchListsByGame = async ({ query, gameId }: { query: string; gameId: string }) => {
  
  const response = await fetch(`${API_BASE}/gamelists/game/${gameId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
})

  if(!response.ok) {
      throw new Error('Failed to fetch lists', response.statusText);
  }

const data = await response.json();

  const transformedData = (data.gameLists || []).map(item => ({
    userId: item.userId,
    userName: item.userName,
    listId: item.listId,
    listTitle: item.listTitle,
  }));

  return transformedData;
  
}