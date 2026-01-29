import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { createUser } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({userName: '', email: '', password: ''});
    const setUser = useAuthStore((s) => s.setUser);
    const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);
  
    const submit = async () => {
        const { userName, email, password } = form;
        
        if(!userName || !email || !password) return Alert.alert('Error','Please fill all fields')
        
        setIsSubmitting(true)
        
        try {
            const user = await createUser({ userName, email, password });
            
            if (!user) throw new Error('No user returned from createUser');
            
            // Обновляем глобальный стор
            setUser(user);
            setIsAuthenticated(true);
            
            Alert.alert('Success', 'Account created successfully!');
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-primary"
        >
          <View className="gap-10 bg-primary rounded-lg p-5 mt-5 flex-1 justify-center">
            <CustomInput 
              placeholder="Enter your full name"
              value={form.userName}
              onChangeText={(text) => setForm((prev) => ({...prev, userName: text}))}
              label="Full name"
            />
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
              title='Sign Up'
              isLoading={isSubmitting}
              onPress={submit}
            />     
            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-50">
                    Already have an account?
                </Text>
                <Link href="/sign-in" className='base-bold text-gray-200'>
                    Sign in
                </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      )
}

export default SignUp