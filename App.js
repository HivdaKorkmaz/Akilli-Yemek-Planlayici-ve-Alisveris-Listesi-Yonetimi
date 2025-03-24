import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './src/screens/HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomePage}
          options={{
            headerShown: false // Header'ı gizliyoruz çünkü kendi header'ımızı kullanıyoruz
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 