import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Chatbot from '../../../components/Chatbot';

const { width } = Dimensions.get('window');

interface Meal {
  id: string;
  name: string;
  description: string;
  image: string;
  time: string;
  calories: string;
  recipe?: {
    ingredients: string[];
    instructions: string[];
  };
}

const HomePage = () => {
  const router = useRouter();
  
  // Öğünler için state
  const [meals, setMeals] = useState<{
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
  }>({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  
  // Yemek ekleme modalı için state
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [newMealName, setNewMealName] = useState('');
  const [newMealDescription, setNewMealDescription] = useState('');
  const [newMealTime, setNewMealTime] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');

  // Tarif modalı için state
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<{ ingredients: string[]; instructions: string[]; } | null>(null);

  const navigateTo = (route: any) => {
    router.push(route);
  };

  const openAddMealModal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setNewMealName('');
    setNewMealDescription('');
    setNewMealTime('');
    setNewMealCalories('');
    setShowAddMealModal(true);
  };

  const addMeal = () => {
    if (!selectedMealType || !newMealName.trim()) return;
    
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: newMealName.trim(),
      description: newMealDescription.trim(),
      image: 'https://picsum.photos/200/200',
      time: newMealTime.trim(),
      calories: newMealCalories.trim(),
    };
    
    setMeals(prev => ({
      ...prev,
      [selectedMealType]: newMeal
    }));
    
    setShowAddMealModal(false);
  };

  const removeMeal = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setMeals(prev => ({
      ...prev,
      [mealType]: null
    }));
  };

  const openRecipeModal = (recipe: { ingredients: string[]; instructions: string[]; }) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const handleAddMealFromChatbot = (mealType: 'breakfast' | 'lunch' | 'dinner', mealName: string, recipe?: { ingredients: string[]; instructions: string[] }) => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName,
      description: recipe ? 'Tarif mevcut' : '',
      image: 'https://picsum.photos/200/200',
      time: '',
      calories: '',
      recipe: recipe
    };
    
    setMeals(prev => ({
      ...prev,
      [mealType]: newMeal
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ... Mevcut kodlar ... */}
      </ScrollView>

      {/* Chatbot Bileşeni */}
      <Chatbot onAddMeal={handleAddMealFromChatbot} />

      {/* ... Diğer modaller ... */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
});

export default HomePage; 