import GameList from '@/components/GameList';
import ReviewComponent from '@/components/ReviewComponent';
import { icons } from '@/constants/icons';
import { API_BASE } from '@/lib/appwrite';
import { fetchGameDetails, fetchReviewsByGame, fetchListsByGame } from '@/services/api';
import useFetch from '@/services/useFetch';
import useAuthStore from '@/store/auth.store';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const GameDetails = () => {
  const { id } = useLocalSearchParams();
  const user = useAuthStore(state => state.user);
  const { data: game, loading } = useFetch(() => fetchGameDetails(id as string));
  const [activeTab, setActiveTab] = useState<'info'|'reviews'|'lists'>('info');

// Get reviews for current game
  const gameIdStr = Array.isArray(id) ? id[0] : (id?.toString() || '');
  console.log('GameReviews - gameIdStr:', gameIdStr);
  
const { data: reviewsData, loading: reviewsLoading } = useFetch(
    () => fetchReviewsByGame({ gameId: gameIdStr, query: '' }),
    !!gameIdStr
  );

  // Get lists containing current game
  const { data: listsData, loading: listsLoading } = useFetch(
    () => fetchListsByGame({ gameId: gameIdStr, query: '' }),
    !!gameIdStr
  );

  console.log('GameDetails - listsData:', listsData);
  console.log('GameDetails - listsLoading:', listsLoading);
  console.log('GameDetails - gameIdStr:', gameIdStr);

  const addToCollection = async () => {
    if (!game?.gameId) {
      Alert.alert('Error', 'Game data not loaded');
      return;
    }
    try {
      const payload = {
        userId: Number(user?.userId),
        gameId: Number(game.gameId),
        rating: 0,
        status: 'Not specified',
        isOwned: false,
        dateStarted: null,
        dateCompleted: null,
      };

      const resp = await fetch(`${API_BASE}/collectionItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const data = await resp.json();
        Alert.alert('Success', 'Game added to collection');
      } else {
        const errText = await resp.text();
        Alert.alert('Error', `Failed to add: ${resp.status} ${errText}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error while adding to collection');
      console.warn(err);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: game?.coverImage
                ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game?.coverImage.split('/').pop()}`
                : undefined
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />
        </View>

        <View className="px-5 mt-4 flex-row items-center justify-start gap-x-3">
          <TouchableOpacity
            className="px-4 py-2 rounded-md bg-accent"
            onPress={addToCollection}
          >
            <Text className="text-white font-semibold text-center">Add to Collection</Text>
          </TouchableOpacity>

<TouchableOpacity
            className="flex-1 px-4 py-2 rounded-md bg-dark-100 items-center justify-center"
            onPress={() => {
              router.push(`/lists/listCreation?gameId=${game?.gameId}`);
            }}
          >
            <Text className="text-white font-semibold text-center">Add to List</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 mt-4 w-full">
          <View style={{ flexDirection: 'row' }}>
            {[
              { key: 'info', label: 'Info' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'lists', label: 'Lists' }
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key as any)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: isActive ? 2 : 0,
                    borderColor: isActive ? '#fff' : 'transparent',
                    backgroundColor: isActive ? '#374151' : 'transparent',
                    borderRadius: 6,
                    marginRight: 6
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === 'info' && (
            <View className="flex-col items-start justify-center mt-5 px-5">
              <Text className="text-white font-bold text-xl">{game?.title}</Text>
              <View className="flex-row items-center gap-x-1 mt-2">
                <Text className="text-light-200 text-sm">
                  {game?.releaseDate?.toString()?.split('-')?.[0] ?? game?.releaseDate ?? 'N/A'}
                </Text>
              </View>
              <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                <Image source={icons.star} className="size-6"/>
                <Text className="text-light-200 text-x5">{Math.round(game?.averageRating ?? 0)}</Text>
              </View>
              <View className="flex-col items-start mt-3">
                <Text className="text-light-200 font-normal text-sm">Summary</Text>
                <Text className="text-light-100 font-bold text-sm mt-2">{game?.description || 'N/A'}</Text>
              </View>
              <View className="flex-col items-start mt-3">
                <Text className="text-light-200 font-normal text-sm">Genres</Text>
                <Text className="text-light-100 font-bold text-sm mt-2">{game?.genre || 'N/A'}</Text>
              </View>
              <View className="flex-col items-start mt-3">
                <Text className="text-light-200 font-normal text-sm">Developers</Text>
                <Text className="text-light-100 font-bold text-sm mt-2">{game?.developer || 'N/A'}</Text>
              </View>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View className="mt-5 px-5">
<TouchableOpacity
                className="bg-accent rounded-lg py-3 flex-row items-center justify-center mb-4"
                onPress={() => router.push(`/reviews/review?gameId=${gameIdStr}`)}
              >
                <Text className="text-white font-semibold">Add a review</Text>
              </TouchableOpacity>

              {reviewsLoading ? (
                <ActivityIndicator size="large" color="#fff" className="mt-10 self-center" />
) : reviewsData && reviewsData.length > 0 ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ width: '100%' }}
                >
{reviewsData.map((review: any, index: number) => (
                    <ReviewComponent
                      key={review.reviewId || index}
                      reviewTitle={review.reviewTitle}
                      userName={review.userName}
                      title={review.title}
                      reviewText={review.reviewText}
                      reviewId={review.reviewId}
                      gameId={gameIdStr}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text className="text-gray-400 text-center mt-10">No reviews yet</Text>
              )}
            </View>
          )}

{activeTab === 'lists' && (
            <View className="px-5 py-3">
              {listsLoading ? (
                <View className="flex-1 justify-center items-center py-8">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white mt-2">Loading lists...</Text>
                </View>
              ) : listsData && listsData.length > 0 ? (
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 400 }}
                >
                  {listsData.map((list: any, index: number) => (
                    <GameList
                      key={list.listId || index}
                      listId={list.listId}
                      listTitle={list.listTitle}
                      userName={list.userName}
                      createdAt={list.createdAt}
                      updatedAt={list.updatedAt}
                      games={list.games}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-gray-400 text-center">This game is not in any lists yet</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

<TouchableOpacity
        onPress={() => router.replace('/')}
        className='absolute bottom-11 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
      >
        <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff"/> 
        <Text className='text-white font-semibold text-base'>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameDetails;