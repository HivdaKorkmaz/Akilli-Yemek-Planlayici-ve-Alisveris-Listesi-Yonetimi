import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useState } from 'react';

const HomePage = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  
  // Hoşgeldiniz yazısı için yeni animasyonlar
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.3)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Sıralı animasyonlar
    Animated.sequence([
      // Önce hoşgeldiniz yazısı
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      // Sonra alt yazı
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      // En son butonlar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
      ]),
    ]).start();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
        ]}
      >
        <Animated.Text 
          style={[
            styles.welcomeText,
            {
              opacity: titleFade,
              transform: [{ scale: titleScale }]
            }
          ]}
        >
          Hoş Geldiniz!
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subText,
            {
              opacity: subtitleFade
            }
          ]}
        >
          Alışveriş listenizi oluşturmak için giriş yapın
        </Animated.Text>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Ionicons name="log-in-outline" size={24} color="#FF0000" />
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.signUpButton]}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Ionicons name="person-add-outline" size={24} color="#FF0000" />
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF0000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  buttonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomePage; 