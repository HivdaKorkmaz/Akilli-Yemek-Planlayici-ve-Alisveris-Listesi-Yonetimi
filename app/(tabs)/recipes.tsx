import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

interface Recipe {
  id: number;
  name: string;
  description: string;
  category: string;
  hasMeat: boolean;
  isVegetarian: boolean;
  ingredients: string[];
  instructions: string[];
}

const RecipesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    hasMeat: false,
    isVegetarian: false,
    category: '',
  });

  const categories = [
    { id: 1, name: 'Kahvaltı', icon: 'sunny-outline' as IconName },
    { id: 2, name: 'Ana Yemekler', icon: 'restaurant-outline' as IconName },
    { id: 3, name: 'Çorbalar', icon: 'bowl-outline' as IconName },
    { id: 4, name: 'Salatalar', icon: 'leaf-outline' as IconName },
    { id: 5, name: 'Tatlılar', icon: 'ice-cream-outline' as IconName },
    { id: 6, name: 'İçecekler', icon: 'cafe-outline' as IconName },
  ];

  // Örnek tarifler (gerçek uygulamada API'den gelecek)
  const [recipes] = useState<Recipe[]>([
    {
      id: 1,
      name: 'Mercimek Çorbası',
      description: 'Hazırlık: 30 dk • 4 Kişilik',
      category: 'Çorbalar',
      hasMeat: false,
      isVegetarian: true,
      ingredients: ['Kırmızı mercimek', 'Soğan', 'Havuç', 'Un', 'Tereyağı'],
      instructions: ['Mercimekleri yıkayın', 'Sebzeleri doğrayın', 'Pişirin'],
    },
    {
      id: 2,
      name: 'Köfte',
      description: 'Hazırlık: 45 dk • 4 Kişilik',
      category: 'Ana Yemekler',
      hasMeat: true,
      isVegetarian: false,
      ingredients: ['Kıyma', 'Soğan', 'Ekmek içi', 'Baharatlar'],
      instructions: ['Malzemeleri karıştırın', 'Köfte şekli verin', 'Pişirin'],
    },
    // Daha fazla tarif eklenebilir
  ]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedFilters.category || recipe.category === selectedFilters.category;
    const matchesMeatFilter = !selectedFilters.hasMeat || recipe.hasMeat;
    const matchesVegetarianFilter = !selectedFilters.isVegetarian || recipe.isVegetarian;
    
    return matchesSearch && matchesCategory && matchesMeatFilter && matchesVegetarianFilter;
  });

  const toggleFilter = (filterType: 'hasMeat' | 'isVegetarian') => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const selectCategory = (category: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarifler</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Ionicons name="filter" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tarif ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={[
                styles.categoryCard,
                selectedFilters.category === category.name && styles.selectedCategoryCard
              ]}
              onPress={() => selectCategory(category.name)}
            >
              <Ionicons name={category.icon} size={32} color="#FF0000" />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tarifler</Text>
        <View style={styles.recipesContainer}>
          {filteredRecipes.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeImage} />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeDescription}>{recipe.description}</Text>
                <View style={styles.recipeTags}>
                  {recipe.hasMeat && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Etli</Text>
                    </View>
                  )}
                  {recipe.isVegetarian && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Vejetaryen</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtreler</Text>
            
            <TouchableOpacity
              style={[styles.filterOption, selectedFilters.hasMeat && styles.selectedFilter]}
              onPress={() => toggleFilter('hasMeat')}
            >
              <Text style={styles.filterText}>Etli Yemekler</Text>
              {selectedFilters.hasMeat && (
                <Ionicons name="checkmark" size={24} color="#FF0000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilters.isVegetarian && styles.selectedFilter]}
              onPress={() => toggleFilter('isVegetarian')}
            >
              <Text style={styles.filterText}>Vejetaryen Yemekler</Text>
              {selectedFilters.isVegetarian && (
                <Ionicons name="checkmark" size={24} color="#FF0000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  categoryCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: '2.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryCard: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  categoryName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recipesContainer: {
    paddingHorizontal: 20,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recipeTags: {
    flexDirection: 'row',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedFilter: {
    backgroundColor: '#fff5f5',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipesPage; 