import GameCard from "@/components/GameCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchGames } from "@/services/api";
import useFetch from "@/services/useFetch";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";
import { Account, Client } from 'react-native-appwrite';


let client: Client;
let account: Account;

client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('695e953f00040467eb05')   // Your Project ID
  .setPlatform('gaming_collection_app');   // Your package name / bundle identifier


export default function Index() {
      const { user } = useAuthStore();

      console.log("useAuthStore", user);
      const router = useRouter();

      const { 
        data: games, 
        loading: gamesLoading, 
        error: gamesError 
      } = useFetch (() => fetchGames({
        query: '',
      }))
  
  return (
    <View className="flex-1 bg-primary">
        
        <Image source={images.bg} className="absolute w-full z-0" />
        <Text>t</Text>
        <ScrollView className="flex-1 px-5" 
      showsVerticalScrollIndicator={false} contentContainerStyle={{ 
      minHeight: "100%",
      paddingBottom: 10 }}>
            <Image source={icons.logo} 
      className="w-12 h-10 mt-20 mb-5 mx-auto" />
            {gamesLoading ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="mt-10 self-center"
                />
            ) : gamesError ? (
              <Text>Error: {gamesError?.message}</Text>
            ) : (           
              <View className="flex-1 mt-5">
                <SearchBar
                  onPress={() => router.push("/search")}
                  placeholder="Search a game"
                />

                <>
                  <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Games</Text>

                  <FlatList 
                      data={games}
                      renderItem={({ item }) => (
                          <GameCard
                            {...item}
                          />
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={3}
                      columnWrapperStyle={{
                          justifyContent: 'flex-start',
                          gap: 20,
                          paddingRight: 5,
                          marginBottom: 10
                      }}
                      className="mt-2 pb-32"
                      scrollEnabled={false}
                      nestedScrollEnabled={true} //добавил из-за предупреждения
                  />
                </>
              </View>
            )}     
      </ScrollView>
    </View>
  );
}
