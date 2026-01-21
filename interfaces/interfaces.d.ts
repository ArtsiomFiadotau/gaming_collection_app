interface Game {
  id: number;
  name: string;
  summary: string;
  cover_url: string;
  release_date: string;
  rating: number;
}

interface TrendingGame {
  searchTerm: string;
  gameId: number;
  title: string;
  count: number;
  coverUrl: string;
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
  game: TrendingGame;
  index: number;
}
