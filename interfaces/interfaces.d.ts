interface Game {
  id: number;
  name: string;
  summary: string;
  cover_url: string;
  release_date: string;
  rating: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface GameDetails {
  gameId: number;
  title: string;
  genre: string;
  developer: string;
  releaseDate: string;
  description: string | null;
  averageRating: number;
  coverImage: string | null;  
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}
