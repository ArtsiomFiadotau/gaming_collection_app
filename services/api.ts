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

export const fetchGameDetails = async (gameId: string): Promise<GameDetails> => {
  let bodyStr = '';
  bodyStr = `fields name, summary, cover.url, rating, release_dates.y; where id = ${gameId};`;
  const endpoint = `${IGDB_CONFIG.BASE_URL}/games`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: IGDB_CONFIG.headers,
        body: bodyStr, 
      })

      if(!response.ok) throw new Error('Failed to fetch details');

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
        summary: item.summary,
        rating: item.rating,
        release_date: minYearStr,
      };
    });
      console.log(data);
      return data[0]; 
    } 
    catch (error) {
      console.log(error);
      throw error;
    }
}  