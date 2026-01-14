import { images } from '@/constants/images';
import { Slot } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function _Layout() {
  return (
    
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">
            <View className="w-full relative" style={{ height: Dimensions.get('screen').height / 2.25}}>
                <ImageBackground source={images.loginGraphic} className="size-full rounded-b-lg" resizeMode="cover"/>
                 
            </View>     
            <Slot /> 
            </ScrollView>   
            
    </KeyboardAvoidingView>
   
  )
  
}