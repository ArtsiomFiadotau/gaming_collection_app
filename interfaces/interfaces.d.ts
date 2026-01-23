interface Game {
  id: number;
  name: string;
  summary: string;
  cover_url: string;
  release_date: string;
  rating: number;
}

interface ColItem {
  gameId: number;
  userId: number;
  title: number;
  coverImage: string;
}


interface GameMyApi {
  gameId: number;
  title: string;
  genre: string;
  developer: string;
  description: string;
  coverImage: string;
  releaseDate: string;
  averageRating: number;
}

interface CollectionItem {
  userId: number;
  gameId: number,
  rating?: number | null;
  status: string | null;
  isOwned: string | null;
  dateStarted: string | null;
  dateCompleted: string | null;
  game?: GameMyApi | null;
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
