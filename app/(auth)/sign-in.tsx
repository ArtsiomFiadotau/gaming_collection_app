import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { signIn } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({email: '', password: ''});
  const setUser = useAuthStore((s) => s.setUser);
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

  const submit = async () => {
    const { email, password } = form;
    
    if(!email || !password) return Alert.alert('Error','Please enter valid email or password')
    
    setIsSubmitting(true)

    try {
      const user = await signIn({ email, password});
      if (!user) throw new Error('No user returned from signIn');

      // Обновляем глобальный стор
      setUser(user);
      setIsAuthenticated(true);

      Alert.alert('Success', 'Login successful!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary"
    >
      <View className="gap-10 bg-primary rounded-lg p-5 mt-5 flex-1 justify-center">
        <CustomInput 
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(text) => setForm((prev) => ({...prev, email: text}))}
          label="Email"
          keyboardType="email-address"
        />

        <CustomInput 
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) => setForm((prev) => ({...prev, password: text}))}
          label="Password"
          secureTextEntry={true}
        />

        <CustomButton 
          title='Sign In'
          isLoading={isSubmitting}
          onPress={submit}
        />     

        <View className="flex justify-center mt-5 flex-row gap-2">
          <Text className="base-regular text-gray-50" >
            Don't have an account?
          </Text>
          <Link href="/sign-up" className='base-bold text-gray-200'>
            Sign up
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SignIn