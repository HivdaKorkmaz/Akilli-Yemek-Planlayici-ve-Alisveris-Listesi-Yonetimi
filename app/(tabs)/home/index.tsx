import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions, Image, FlatList, Alert } from 'react-native';
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

interface ExtraMeal extends Meal {
  type: string; // Öğün türü (ara öğün, atıştırmalık vb.)
}

interface MealCardProps {
  title: string;
  meal: Meal | null;
  gradientColors: [string, string];
  iconName: keyof typeof Ionicons.glyphMap;
  onAdd: () => void;
  onRemove: () => void;
  onViewRecipe: (recipe: { ingredients: string[]; instructions: string[] }) => void;
}

const MealCard: React.FC<MealCardProps> = ({ 
  title, 
  meal, 
  gradientColors, 
  iconName, 
  onAdd, 
  onRemove, 
  onViewRecipe 
}) => {
  const handleViewDetails = () => {
    if (meal?.recipe) {
      onViewRecipe(meal.recipe);
    }
  };

  return (
    <View style={styles.mealCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.mealGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{title}</Text>
          {!meal && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={onAdd}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {meal ? (
          <TouchableOpacity 
            style={styles.mealContent}
            onPress={handleViewDetails}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: meal.image }} 
              style={styles.mealImage}
            />
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDescription}>{meal.description}</Text>
              {meal.recipe && (
                <TouchableOpacity 
                  style={styles.recipeButton}
                  onPress={() => onViewRecipe(meal.recipe!)}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.recipeButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="book-outline" size={18} color="#fff" style={styles.recipeButtonIcon} />
                    <Text style={styles.recipeButtonText}>Tarifi Gör</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={onRemove}
              >
                <Ionicons name="trash" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyMeal}>
            <Ionicons name={iconName} size={40} color="#fff" />
            <Text style={styles.emptyMealText}>Henüz {title.toLowerCase()} eklenmedi</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  isChecked: boolean;
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

  // Alışveriş listesi için state
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Malzeme ekleme için state
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  // Ek Öğünler için state
  const [extraMeals, setExtraMeals] = useState<ExtraMeal[]>([]);
  const [showAddExtraMealModal, setShowAddExtraMealModal] = useState(false);
  const [newExtraMealType, setNewExtraMealType] = useState('');
  const [newExtraMealName, setNewExtraMealName] = useState('');
  const [newExtraMealDescription, setNewExtraMealDescription] = useState('');
  const [newExtraMealTime, setNewExtraMealTime] = useState('');
  const [newExtraMealCalories, setNewExtraMealCalories] = useState('');

  // En çok kullanılan malzemeler
  const commonIngredients = [
    // Temel Gıda
    { name: 'Yumurta', category: 'Temel Gıda' },
    { name: 'Ekmek', category: 'Temel Gıda' },
    { name: 'Pirinç', category: 'Temel Gıda' },
    { name: 'Makarna', category: 'Temel Gıda' },
    { name: 'Bulgur', category: 'Temel Gıda' },
    { name: 'Un', category: 'Temel Gıda' },
    { name: 'Şeker', category: 'Temel Gıda' },
    { name: 'Tuz', category: 'Temel Gıda' },
    { name: 'Zeytinyağı', category: 'Temel Gıda' },
    { name: 'Ayçiçek Yağı', category: 'Temel Gıda' },
    { name: 'Mercimek', category: 'Temel Gıda' },
    { name: 'Nohut', category: 'Temel Gıda' },
    { name: 'Fasulye', category: 'Temel Gıda' },

    // Süt Ürünleri
    { name: 'Süt', category: 'Süt Ürünleri' },
    { name: 'Peynir', category: 'Süt Ürünleri' },
    { name: 'Yoğurt', category: 'Süt Ürünleri' },
    { name: 'Tereyağı', category: 'Süt Ürünleri' },
    { name: 'Kaşar Peyniri', category: 'Süt Ürünleri' },
    { name: 'Beyaz Peynir', category: 'Süt Ürünleri' },
    { name: 'Lor Peyniri', category: 'Süt Ürünleri' },
    { name: 'Krem Peynir', category: 'Süt Ürünleri' },

    // Sebze
    { name: 'Domates', category: 'Sebze' },
    { name: 'Salatalık', category: 'Sebze' },
    { name: 'Soğan', category: 'Sebze' },
    { name: 'Sarımsak', category: 'Sebze' },
    { name: 'Patates', category: 'Sebze' },
    { name: 'Havuç', category: 'Sebze' },
    { name: 'Biber', category: 'Sebze' },
    { name: 'Patlıcan', category: 'Sebze' },
    { name: 'Kabak', category: 'Sebze' },
    { name: 'Ispanak', category: 'Sebze' },
    { name: 'Marul', category: 'Sebze' },
    { name: 'Maydanoz', category: 'Sebze' },
    { name: 'Dereotu', category: 'Sebze' },
    { name: 'Roka', category: 'Sebze' },

    // Et ve Balık
    { name: 'Tavuk', category: 'Et ve Balık' },
    { name: 'Kıyma', category: 'Et ve Balık' },
    { name: 'Köfte', category: 'Et ve Balık' },
    { name: 'Balık', category: 'Et ve Balık' },
    { name: 'Hindi', category: 'Et ve Balık' },
    { name: 'Sucuk', category: 'Et ve Balık' },
    { name: 'Pastırma', category: 'Et ve Balık' },
    { name: 'Salam', category: 'Et ve Balık' },

    // Baharat ve Soslar
    { name: 'Karabiber', category: 'Baharat ve Soslar' },
    { name: 'Kırmızı Biber', category: 'Baharat ve Soslar' },
    { name: 'Pul Biber', category: 'Baharat ve Soslar' },
    { name: 'Kimyon', category: 'Baharat ve Soslar' },
    { name: 'Kekik', category: 'Baharat ve Soslar' },
    { name: 'Nane', category: 'Baharat ve Soslar' },
    { name: 'Zerdeçal', category: 'Baharat ve Soslar' },
    { name: 'Tarçın', category: 'Baharat ve Soslar' },
    { name: 'Ketçap', category: 'Baharat ve Soslar' },
    { name: 'Mayonez', category: 'Baharat ve Soslar' },
    { name: 'Hardal', category: 'Baharat ve Soslar' },
    { name: 'Soya Sosu', category: 'Baharat ve Soslar' },

    // Meyve
    { name: 'Elma', category: 'Meyve' },
    { name: 'Muz', category: 'Meyve' },
    { name: 'Portakal', category: 'Meyve' },
    { name: 'Mandalina', category: 'Meyve' },
    { name: 'Üzüm', category: 'Meyve' },
    { name: 'Çilek', category: 'Meyve' },
    { name: 'Karpuz', category: 'Meyve' },
    { name: 'Kavun', category: 'Meyve' },
    { name: 'Armut', category: 'Meyve' },
    { name: 'Şeftali', category: 'Meyve' },

    // Kuruyemiş
    { name: 'Ceviz', category: 'Kuruyemiş' },
    { name: 'Fındık', category: 'Kuruyemiş' },
    { name: 'Badem', category: 'Kuruyemiş' },
    { name: 'Antep Fıstığı', category: 'Kuruyemiş' },
    { name: 'Kuru Üzüm', category: 'Kuruyemiş' },
    { name: 'Kuru Kayısı', category: 'Kuruyemiş' },
    { name: 'Kuru İncir', category: 'Kuruyemiş' },

    // İçecekler
    { name: 'Su', category: 'İçecekler' },
    { name: 'Meyve Suyu', category: 'İçecekler' },
    { name: 'Soda', category: 'İçecekler' },
    { name: 'Çay', category: 'İçecekler' },
    { name: 'Kahve', category: 'İçecekler' },
    { name: 'Limonata', category: 'İçecekler' },
    { name: 'Ayran', category: 'İçecekler' }
  ];

  // Kategorilere göre malzemeleri grupla
  const groupedIngredients = commonIngredients.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof commonIngredients>);

  // Alışveriş listesi modalı için state
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrelenmiş malzemeleri hesapla
  const filteredIngredients = selectedCategory
    ? groupedIngredients[selectedCategory]
    : commonIngredients.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Alışveriş listesi görüntüleme modalı için state
  const [showViewListModal, setShowViewListModal] = useState(false);

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

  // Alışveriş listesi fonksiyonları
  const addShoppingItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      isChecked: false
    };
    
    setShoppingItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQuantity('');
    setShowAddItemModal(false);
  };

  const toggleItemChecked = (id: string) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  // Öğünlerden malzemeleri alışveriş listesine ekle
  const addIngredientsToShoppingList = () => {
    const allIngredients: string[] = [];
    
    // Tüm öğünlerin malzemelerini topla
    Object.values(meals).forEach(meal => {
      if (meal?.recipe?.ingredients) {
        allIngredients.push(...meal.recipe.ingredients);
      }
    });

    // Tekrar eden malzemeleri birleştir
    const uniqueIngredients = [...new Set(allIngredients)];
    
    // Yeni malzemeleri listeye ekle
    const newItems = uniqueIngredients.map(ingredient => ({
      id: Date.now().toString() + Math.random(),
      name: ingredient,
      quantity: '',
      isChecked: false
    }));

    setShoppingItems(prev => [...prev, ...newItems]);
  };

  // Malzemeyi listeye ekle
  const addIngredientToList = (ingredientName: string, quantity: string = '') => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: ingredientName,
      quantity: quantity,
      isChecked: false
    };
    setShoppingItems(prev => [...prev, newItem]);
    setIngredientQuantity('');
    Alert.alert('Başarılı', `${ingredientName}${quantity ? ` (${quantity})` : ''} alışveriş listesine eklendi.`);
  };

  const addExtraMeal = () => {
    if (!newExtraMealType.trim() || !newExtraMealName.trim()) return;
    
    const newMeal: ExtraMeal = {
      id: Date.now().toString(),
      type: newExtraMealType.trim(),
      name: newExtraMealName.trim(),
      description: newExtraMealDescription.trim(),
      image: 'https://picsum.photos/200/200',
      time: newExtraMealTime.trim(),
      calories: newExtraMealCalories.trim(),
    };
    
    setExtraMeals(prev => [...prev, newMeal]);
    setShowAddExtraMealModal(false);
    setNewExtraMealType('');
    setNewExtraMealName('');
    setNewExtraMealDescription('');
    setNewExtraMealTime('');
    setNewExtraMealCalories('');
  };

  const removeExtraMeal = (id: string) => {
    setExtraMeals(prev => prev.filter(meal => meal.id !== id));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hızlı İşlemler */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            {/* Alışveriş Listesi */}
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => {
                if (shoppingItems.length === 0) {
                  setShowShoppingListModal(true);
                } else {
                  setShowViewListModal(true);
                }
              }}
            >
        <LinearGradient
                colors={['#FF4757', '#FF6B81']}
                style={styles.quickActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name="cart" size={32} color="#fff" />
          </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionText}>Alışveriş Listesi</Text>
                  <Text style={styles.quickActionSubtext}>
                    {shoppingItems.length === 0 ? 'Yeni liste oluştur' : `${shoppingItems.length} ürün`}
                  </Text>
                </View>
                <View style={styles.quickActionFooter}>
                  <Text style={styles.quickActionButtonText}>
                    {shoppingItems.length === 0 ? 'Liste Oluştur' : 'Listeyi Gör'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
            </TouchableOpacity>

            {/* Tarifler */}
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigateTo('/recipes')}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name="book" size={32} color="#fff" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionText}>Tarifler</Text>
                  <Text style={styles.quickActionSubtext}>Yeni tarifler keşfet</Text>
                </View>
                <View style={styles.quickActionFooter}>
                  <Text style={styles.quickActionButtonText}>Keşfet</Text>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Günlük Öğünler Başlığı */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Günlük Öğünler</Text>
              <Text style={styles.headerSubtitle}>Bugün ne yiyeceksin?</Text>
            </View>
            <View style={styles.extraMealsHeader}>
            <TouchableOpacity 
                style={styles.addExtraMealButton}
                onPress={() => setShowAddExtraMealModal(true)}
            >
              <LinearGradient
                  colors={['#FF4757', '#FF6B81']}
                  style={styles.addExtraMealButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.addExtraMealButtonText}>Ek Öğün Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Öğün Kartları */}
        <View style={styles.mealsContainer}>
          <MealCard
            title="Kahvaltı"
            meal={meals.breakfast}
            gradientColors={['#FF6B6B', '#FF8E8E']}
            iconName="cafe"
            onAdd={() => openAddMealModal('breakfast')}
            onRemove={() => removeMeal('breakfast')}
            onViewRecipe={openRecipeModal}
          />

          <MealCard
            title="Öğle Yemeği"
            meal={meals.lunch}
            gradientColors={['#4ECDC4', '#45B7AF']}
            iconName="restaurant"
            onAdd={() => openAddMealModal('lunch')}
            onRemove={() => removeMeal('lunch')}
            onViewRecipe={openRecipeModal}
          />

          <MealCard
            title="Akşam Yemeği"
            meal={meals.dinner}
            gradientColors={['#6C5CE7', '#8C7AE6']}
            iconName="moon"
            onAdd={() => openAddMealModal('dinner')}
            onRemove={() => removeMeal('dinner')}
            onViewRecipe={openRecipeModal}
          />
        </View>

        {/* Ek Öğünler Listesi */}
        <View style={styles.extraMealsList}>
          {extraMeals.map((meal) => (
            <View key={meal.id} style={styles.extraMealCard}>
            <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.extraMealGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
                <View style={styles.extraMealHeader}>
                  <Text style={styles.extraMealType}>{meal.type}</Text>
                        <TouchableOpacity 
                    style={styles.removeExtraMealButton}
                    onPress={() => removeExtraMeal(meal.id)}
                        >
                    <Ionicons name="trash" size={20} color="#fff" />
                        </TouchableOpacity>
                          </View>
                <View style={styles.extraMealContent}>
                  <Image 
                    source={{ uri: meal.image }} 
                    style={styles.extraMealImage}
                  />
                  <View style={styles.extraMealInfo}>
                    <Text style={styles.extraMealName}>{meal.name}</Text>
                    <Text style={styles.extraMealDescription}>{meal.description}</Text>
                    <Text style={styles.extraMealTime}>{meal.time}</Text>
                    <Text style={styles.extraMealCalories}>{meal.calories} kalori</Text>
                          </View>
                      </View>
              </LinearGradient>
                    </View>
          ))}
        </View>
      </ScrollView>

      {/* Chatbot Bileşeni */}
      <Chatbot onAddMeal={handleAddMealFromChatbot} />

      {/* Yemek Ekleme Modalı */}
      <Modal
        visible={showAddMealModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMealModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Yemek Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="Yemek Adı"
              value={newMealName}
              onChangeText={setNewMealName}
            />
            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              value={newMealDescription}
              onChangeText={setNewMealDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Zaman"
              value={newMealTime}
              onChangeText={setNewMealTime}
            />
            <TextInput
              style={styles.input}
              placeholder="Kalori"
              value={newMealCalories}
              onChangeText={setNewMealCalories}
            />
            <View style={styles.modalButtons}>
                      <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddMealModal(false)}
                      >
                <Text style={styles.modalButtonText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addMeal}
                      >
                <Text style={styles.modalButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
        </View>
      </Modal>

      {/* Tarif Modalı */}
      <Modal
        visible={showRecipeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRecipeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tarif</Text>
            {selectedRecipe && (
              <ScrollView style={styles.recipeContainer}>
                <Text style={styles.recipeSectionTitle}>Malzemeler:</Text>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.recipeItem}>• {ingredient}</Text>
                ))}
                <Text style={styles.recipeSectionTitle}>Hazırlanışı:</Text>
                {selectedRecipe.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.recipeItem}>{index + 1}. {instruction}</Text>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setShowRecipeModal(false)}
            >
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* Alışveriş Listesi Görüntüleme Modalı */}
      <Modal
        visible={showViewListModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowViewListModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF4757', '#FF6B81']}
              style={styles.modalHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Alışveriş Listem</Text>
                <View style={styles.headerActions}>
                        <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => {
                      setShowViewListModal(false);
                      setShowShoppingListModal(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                      <TouchableOpacity 
                    onPress={() => setShowViewListModal(false)}
                    style={styles.headerButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
              </View>
            </LinearGradient>

            <ScrollView style={styles.shoppingListContent}>
              {shoppingItems.length === 0 ? (
                <View style={styles.emptyListContainer}>
                  <Ionicons name="cart-outline" size={48} color="#ddd" />
                  <Text style={styles.emptyListText}>Alışveriş listesi boş</Text>
                  <Text style={styles.emptyListSubtext}>Yeni malzeme eklemek için + butonuna tıklayın</Text>
                </View>
              ) : (
                shoppingItems.map((item, index) => (
                  <View key={index} style={styles.shoppingItemContainer}>
                    <View style={styles.shoppingItemContent}>
                        <TouchableOpacity 
                        style={styles.checkboxContainer}
                        onPress={() => toggleItemChecked(item.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          item.isChecked && styles.checkboxChecked
                        ]}>
                          {item.isChecked && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </View>
                        </TouchableOpacity>
                      <View style={styles.itemInfo}>
                        <Text style={[
                          styles.itemName,
                          item.isChecked && styles.itemCompleted
                        ]}>
                          {item.name}
                        </Text>
                        {item.quantity && (
                          <Text style={styles.itemQuantity}>{item.quantity}</Text>
                        )}
                          </View>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => removeShoppingItem(item.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
                )}
      </ScrollView>

            {/* Malzeme Ekleme Butonu */}
      <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => {
                setShowViewListModal(false);
                setShowShoppingListModal(true);
              }}
      >
        <LinearGradient
                colors={['#FF4757', '#FF6B81']}
                style={styles.addItemButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addItemButtonText}>Malzeme Ekle</Text>
        </LinearGradient>
      </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Malzeme Ekleme Modalı */}
        <Modal
        visible={showShoppingListModal}
          transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShoppingListModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
                <LinearGradient
              colors={['#FF4757', '#FF6B81']}
              style={styles.modalHeaderGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Malzeme Ekle</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowShoppingListModal(false);
                      setSelectedIngredient(null);
                      setIngredientQuantity('');
                    }}
                    style={styles.headerButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                      </View>
            </LinearGradient>

            {/* Seçili Malzeme ve Miktar Girişi */}
            {selectedIngredient && (
              <View style={styles.selectedIngredientContainer}>
                <Text style={styles.selectedIngredientText}>Seçili Malzeme: {selectedIngredient}</Text>
                <View style={styles.quantityInputContainer}>
                    <TextInput
                    style={styles.quantityInput}
                    placeholder="Miktar (örn: 500g, 1 adet)"
                    value={ingredientQuantity}
                    onChangeText={setIngredientQuantity}
                  />
                  <TouchableOpacity
                    style={styles.addQuantityButton}
                    onPress={() => {
                      addIngredientToList(selectedIngredient, ingredientQuantity);
                      setSelectedIngredient(null);
                      setShowShoppingListModal(false);
                      setShowViewListModal(true);
                    }}
                  >
                      <LinearGradient
                      colors={['#FF4757', '#FF6B81']}
                      style={styles.addQuantityButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                      <Text style={styles.addQuantityButtonText}>Ekle</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
            </View>
            )}

            {/* Arama ve Kategori Filtreleme */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Malzeme ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[styles.categoryButton, !selectedCategory && styles.selectedCategory]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryText, !selectedCategory && styles.selectedCategoryText]}>
                    Tümü
              </Text>
                </TouchableOpacity>
                {Object.keys(groupedIngredients).map(category => (
              <TouchableOpacity 
                    key={category}
                    style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
                    onPress={() => setSelectedCategory(category)}
              >
                    <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                      {category}
                    </Text>
              </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Malzeme Listesi */}
            <ScrollView style={styles.ingredientsList}>
              {filteredIngredients.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.ingredientItem}
                  onPress={() => setSelectedIngredient(item.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ingredientName}>{item.name}</Text>
                  <Ionicons name="add-circle" size={24} color="#FF4757" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Manuel Ekleme */}
            <View style={styles.manualAddContainer}>
                <TextInput
                style={styles.manualInput}
                placeholder="Yeni malzeme ekle..."
                value={newItemName}
                onChangeText={setNewItemName}
              />
                  <TextInput
                style={[styles.manualInput, styles.quantityInput]}
                placeholder="Miktar (opsiyonel)"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
              />
              <TouchableOpacity
                style={styles.manualAddButton}
                onPress={() => {
                  if (newItemName.trim()) {
                    addIngredientToList(newItemName.trim(), newItemQuantity.trim());
                    setNewItemName('');
                    setNewItemQuantity('');
                    setShowShoppingListModal(false);
                    setShowViewListModal(true);
                  }
                }}
              >
                <LinearGradient
                  colors={['#FF4757', '#FF6B81']}
                  style={styles.manualAddButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.addButtonText}>Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ek Öğün Ekleme Modalı */}
      <Modal
        visible={showAddExtraMealModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddExtraMealModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF4757', '#FF6B81']}
              style={styles.modalHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ek Öğün Ekle</Text>
              <TouchableOpacity 
                  onPress={() => setShowAddExtraMealModal(false)}
                  style={styles.headerButton}
              >
                  <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            </LinearGradient>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Öğün Türü (örn: Ara Öğün, Atıştırmalık)"
                value={newExtraMealType}
                onChangeText={setNewExtraMealType}
              />
              <TextInput
                style={styles.input}
                placeholder="Yemek Adı"
                value={newExtraMealName}
                onChangeText={setNewExtraMealName}
              />
              <TextInput
                style={styles.input}
                placeholder="Açıklama"
                value={newExtraMealDescription}
                onChangeText={setNewExtraMealDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Zaman"
                value={newExtraMealTime}
                onChangeText={setNewExtraMealTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Kalori"
                value={newExtraMealCalories}
                onChangeText={setNewExtraMealCalories}
              />
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addExtraMeal}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
                    </View>
          </View>
        </View>
      </Modal>
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
  headerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  mealsContainer: {
    padding: 15,
  },
  mealCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mealGradient: {
    padding: 15,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  mealDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  recipeButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recipeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  recipeButtonIcon: {
    marginRight: 8,
  },
  recipeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMeal: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMealText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  closeButton: {
    backgroundColor: '#6C5CE7',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  recipeContainer: {
    maxHeight: 400,
  },
  recipeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  recipeItem: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 24,
  },
  quickActionsContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  quickActionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quickActionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    marginTop: 10,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  quickActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchContainer: {
    margin: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#FF4757',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  ingredientsList: {
    maxHeight: 300,
    marginHorizontal: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
  },
  selectedIngredientContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 15,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedIngredientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  addQuantityButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addQuantityButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addQuantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shoppingListContent: {
    maxHeight: 400,
    padding: 15,
  },
  emptyListContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  shoppingItemContainer: {
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shoppingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF4757',
    borderColor: '#FF4757',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemButton: {
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  addItemButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalHeaderGradient: {
    padding: 20,
  },
  manualAddContainer: {
    margin: 15,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  manualAddButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  manualAddButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  extraMealsContainer: {
    padding: 15,
  },
  extraMealsHeader: {
    alignItems: 'flex-end',
    marginLeft: 20,
  },
  extraMealsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addExtraMealButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addExtraMealButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addExtraMealButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  extraMealCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  extraMealGradient: {
    padding: 15,
  },
  extraMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  extraMealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  removeExtraMealButton: {
    padding: 5,
  },
  extraMealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraMealImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  extraMealInfo: {
    flex: 1,
  },
  extraMealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  extraMealDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  extraMealTime: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
  },
  extraMealCalories: {
    fontSize: 12,
    color: '#fff',
  },
  modalBody: {
    padding: 20,
  },
  extraMealsList: {
    padding: 15,
  },
});

export default HomePage; 