//import { CLIENT_ID } from '../server/index.js';

// export const fetchGameData = async () => {
//     const token = await getValidToken(); // получаем валидный токен
//     const client_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
//     if (!token) throw new Error('Could not get token');
  
//     // пример API-запроса с использованием токена
//     const response = await fetch('https://api.igdb.com/v4/games', {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         //'Client-ID': `${client_ID}`,
//         //'Authorization': `Bearer ${token}`,
//         'Client-ID': 'h47uvldjvq5w0sdw00qh6md6i2a4c0',
//         'Authorization': 'Bearer aiqpktsq1prlvbacbtsun79e84gs82',
//         'Content-Type': 'text/plain',
//       },
//       //body: JSON.stringify('fields name, platforms; limit 10;'),
//       body: 'fields name, platforms; limit 10;',
//     });
  
//     if (!response.ok) {
//       throw new Error(`Error fetching game data: ${response.statusText}`);
//     }
  
//     const data = await response.json();
//     console.log('fetchGameData результат:', data); // добавьте сюда
//     return data;
//   }
  

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
    bodyStr = `search "${safeQuery}"; fields name, cover.url, rating, release_dates.y; where version_parent = null;`;
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