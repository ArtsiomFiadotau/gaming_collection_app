import { Link } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameListProps {
  listId: number;
  listTitle: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  games: Array<{
    gameId: number;
    title: string;
    coverImage: string;
  }>;
}

const GameList = ({ listId, listTitle, userName, games }: GameListProps) => {
  return (
    <View className="bg-dark-100 rounded-lg p-4 mb-4">
     
      <Link href={`/lists/${listId}`} asChild>
        <TouchableOpacity className="mb-4">
        
          <Text className="text-white font-bold text-xl text-center">{listTitle}</Text>      
          <View className="flex-row justify-between items-center mb-3">
          <Text className="text-light-200 text-sm">Author</Text>
          <Text className="text-white text-sm">{userName}</Text>
          </View>
        </TouchableOpacity>
      </Link>
      

      {/* Третья строка - список игр с изображениями */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 0 }}
        className="mb-2"
      >
        {games.map((game: any, index: number) => (
          <View key={game.gameId} className="flex-col items-center mr-4">
            <Image
              source={{
                uri: game.coverImage
                    ?
                `https:${game.coverImage}` 
                    : 'https://placehold.co/600x400/1a1a1a/ffffff.png'
            }}
              className="w-20 h-20 rounded-lg bg-gray-700"
              resizeMode="cover"
              style={{ width: 80, height: 80 }}
            />
            
          </View>
        ))}
      </ScrollView>
    </View>
   
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#374151',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
});

export default GameList;