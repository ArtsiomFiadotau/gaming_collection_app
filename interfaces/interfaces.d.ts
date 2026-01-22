interface Game {
  id: number;
  name: string;
  summary: string;
  cover_url: string;
  release_date: string;
  rating: number;
}

interface CollectionItem {
  userId: number;
  gameId: number,
  rating: number;
  status: string;
  isOwned: string;
  dateStarted: date;
  dateCompleted: date;
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
