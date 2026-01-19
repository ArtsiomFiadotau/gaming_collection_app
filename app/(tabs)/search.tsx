import GameCard from '@/components/GameCard';
import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchGames } from '@/services/api';
//import { updateSearchCount } from '@/lib/appwrite';
import useFetch from '@/services/useFetch';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
  

  const { 
    data: games, 
    loading: gamesLoading, 
    error: gamesError,
    refetch: loadGames,
    reset, 
  } = useFetch (() => fetchGames({
    query: searchQuery
  }), false)

  // useEffect(() => {
      
  //   const timeoutId = setTimeout(async () => { 
  //   if(searchQuery.trim()) {
  //       await loadGames();

  //       if(games?.length >0 && games?.[0])
  //       await updateSearchCount(searchQuery, games[0]);
  //     } else {
  //         reset()
  //     }
  //   }, 500);
  //     return () => clearTimeout(timeoutId);
  // }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0"
    resizeMode="cover" />

        <FlatList
              data={games}
              renderItem={({ item }) => <GameCard {...item} />}
              keyExtractor={(item) => item.id.toString()}
              className="px-5"
              numColumns={3}
              columnWrapperStyle={{
                  justifyContent: 'center',
                  gap: 16,
                  marginVertical: 16
              }}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListHeaderComponent={
                <>
                    <View className="w-full flex-row justify-center mt-20 items-center">
                        <Image source={icons.logo} className="w-12 h-10" />
                    </View>

                    <View className="my-5">
                        <SearchBar 
                            placeholder="Search games..." 
                            value={searchQuery}
                            onChangeText={(text: string) => setSearchQuery(text)}
                        />
                    </View>
                    
                    {gamesLoading && (
                        <ActivityIndicator size="large" color="#0000ff" className="my-3" />
                    )}

                      {gamesError && (
                          <Text className="text-red-500 px-5 my-3">
                              Error: {gamesError.message}
                          </Text>
                      )}

                      {
                        !gamesLoading && !gamesError && searchQuery.trim() 
                        && games?.length > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for{' '}
                                <Text className="text-accent">{searchQuery}</Text>

                            </Text>
                      )}
                </>
              }
              ListEmptyComponent=
              {!gamesLoading && !gamesError ? (
                  <View className="mt-10 px-5">
                        <Text className="text-center text-gray-500">
                              {searchQuery.trim() ? 'No games found' : 'Search for a game'}
                        </Text>
                  </View>
                ) : null
              }
        />
    </View>
  )
}

export default Search