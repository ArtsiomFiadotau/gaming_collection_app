import useAuthStore from "@/store/auth.store";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import './globals.css';

export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  const [fontsLoaded, error] = useFonts();

  useEffect(() => {
    if(error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    fetchAuthenticatedUser()

  }, []);

  if(!fontsLoaded || isLoading) return null;

  return (
    <Stack>
      <Stack.Screen
      name="(tabs)"
      options={{ 
        headerShown: false 
      }}
    />
    <Stack.Screen
      name="games/[id]"
      options={{ 
        headerShown: false
      }}
    />
    <Stack.Screen
      name="(auth)"
      options={{ 
        headerShown: false 
      }}
    />
  </Stack>)
}
