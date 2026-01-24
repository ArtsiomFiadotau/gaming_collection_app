import GameCardInternal from '@/components/GameCardInternal';
import { fetchGameListSingle } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameListProps {
  gameId: number;
  title: string;
  coverImage: string;
}

const ListDetail = () => {
  const { listId } = useLocalSearchParams();

  // Получаем детальную информацию о списке
  const listIdString = Array.isArray(listId) ? listId[0] : listId;
  console.log('ListDetail - listIdString:', listIdString);
  const { data: listData, loading: listLoading } = useFetch(
    () => fetchGameListSingle({ query: '', listId: listIdString }),
    !!listIdString
  );
  
  console.log('ListDetail - listData:', listData);

  const handleBack = () => {
    router.push('/lists');
  };

  if (listLoading) {
    return (
      <SafeAreaView className='bg-primary flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-4">Loading list...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='bg-primary flex-1'>
      {/* Фоновое изображение */}
      <Image 
        source={require('@/assets/images/bg.png')} 
        className="flex-1 absolute w-full z-0" 
        resizeMode="cover" 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 pt-8">
          {/* Кнопка "Back" */}
          <TouchableOpacity
            onPress={handleBack}
            className="bg-accent rounded-lg py-3 px-6 mb-4"
            style={{ alignSelf: 'flex-start' }}
          >
            <Text className="text-white font-semibold">← Back</Text>
          </TouchableOpacity>

          {/* Заголовок списка */}
          {listData && (
            <Text className="text-white font-bold text-2xl text-center mb-6">
              {listData.listTitle}
            </Text>
          )}

          {/* Информация об авторе */}
          {listData && (
            <View className="flex-row justify-between items-center bg-dark-100 rounded-lg p-4 mb-6">
              <Text className="text-light-200 text-sm">Author</Text>
              <Text className="text-white text-sm">{listData.userName}</Text>
            </View>
          )}

          {/* Список игр в виде карточек */}
          {listData && listData.games && listData.games.length > 0 ? (
            <View className="flex-row flex-wrap gap-4">
              {listData?.games?.map((game: any, index: number) => (
                <GameCardInternal
                  key={game.gameId || index}
                  gameId={game.gameId}
                  title={game.title}
                  coverImage={game.coverImage}
                />
              ))}
            </View>
          ) : (
            <Text className="text-white text-center mt-10">No games found in this list</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListDetail;