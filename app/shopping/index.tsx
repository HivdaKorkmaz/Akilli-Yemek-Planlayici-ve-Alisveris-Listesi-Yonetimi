import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  isCompleted: boolean;
}

const categories = [
  { id: 'all', name: 'Tümü', icon: 'grid-outline' },
  { id: 'fruits', name: 'Meyveler', icon: 'nutrition-outline' },
  { id: 'vegetables', name: 'Sebzeler', icon: 'leaf-outline' },
  { id: 'meat', name: 'Et & Tavuk', icon: 'restaurant-outline' },
  { id: 'dairy', name: 'Süt Ürünleri', icon: 'water-outline' },
  { id: 'bakery', name: 'Fırın', icon: 'bread-outline' },
  { id: 'other', name: 'Diğer', icon: 'apps-outline' },
];

const commonItems = {
  fruits: [
    { name: 'Elma', unit: 'kg' },
    { name: 'Muz', unit: 'kg' },
    { name: 'Portakal', unit: 'kg' },
    { name: 'Mandalina', unit: 'kg' },
    { name: 'Çilek', unit: 'kg' },
    { name: 'Üzüm', unit: 'kg' },
    { name: 'Kiraz', unit: 'kg' },
    { name: 'Armut', unit: 'kg' },
    { name: 'Kivi', unit: 'adet' },
    { name: 'Nar', unit: 'adet' },
  ],
  vegetables: [
    { name: 'Domates', unit: 'kg' },
    { name: 'Salatalık', unit: 'kg' },
    { name: 'Biber', unit: 'kg' },
    { name: 'Patlıcan', unit: 'kg' },
    { name: 'Patates', unit: 'kg' },
    { name: 'Soğan', unit: 'kg' },
    { name: 'Sarımsak', unit: 'kg' },
    { name: 'Havuç', unit: 'kg' },
    { name: 'Ispanak', unit: 'demet' },
    { name: 'Marul', unit: 'adet' },
  ],
  meat: [
    { name: 'Kıyma', unit: 'kg' },
    { name: 'Tavuk Göğsü', unit: 'kg' },
    { name: 'Pirzola', unit: 'kg' },
    { name: 'Balık', unit: 'kg' },
    { name: 'Sucuk', unit: 'kg' },
    { name: 'Sosis', unit: 'paket' },
    { name: 'Pastırma', unit: 'gr' },
  ],
  dairy: [
    { name: 'Süt', unit: 'lt' },
    { name: 'Yoğurt', unit: 'kg' },
    { name: 'Peynir', unit: 'kg' },
    { name: 'Yumurta', unit: 'adet' },
    { name: 'Tereyağı', unit: 'gr' },
    { name: 'Kaşar Peyniri', unit: 'gr' },
    { name: 'Beyaz Peynir', unit: 'gr' },
  ],
  bakery: [
    { name: 'Ekmek', unit: 'adet' },
    { name: 'Simit', unit: 'adet' },
    { name: 'Poğaça', unit: 'adet' },
    { name: 'Börek', unit: 'adet' },
    { name: 'Galeta Unu', unit: 'gr' },
  ],
  other: [
    { name: 'Pirinç', unit: 'kg' },
    { name: 'Makarna', unit: 'paket' },
    { name: 'Zeytinyağı', unit: 'lt' },
    { name: 'Ayçiçek Yağı', unit: 'lt' },
    { name: 'Tuz', unit: 'gr' },
    { name: 'Karabiber', unit: 'gr' },
    { name: 'Pul Biber', unit: 'gr' },
    { name: 'Şeker', unit: 'kg' },
    { name: 'Un', unit: 'kg' },
    { name: 'Maya', unit: 'paket' },
  ],
};

const units = ['adet', 'kg', 'gr', 'lt', 'ml', 'paket', 'demet'];

const ShoppingListPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('adet');
  const [quantity, setQuantity] = useState('1');
  const [showCommonItems, setShowCommonItems] = useState(false);
  const [selectedCommonItem, setSelectedCommonItem] = useState<{name: string, unit: string} | null>(null);
  const [commonItemQuantity, setCommonItemQuantity] = useState('1');

  const addItem = () => {
    if (newItem.trim()) {
      const newShoppingItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem.trim(),
        quantity: quantity,
        unit: selectedUnit,
        category: selectedCategory,
        isCompleted: false,
      };
      setItems([...items, newShoppingItem]);
      setNewItem('');
      setQuantity('1');
      setSelectedUnit('adet');
      setShowAddItem(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü listeden silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => setItems(items.filter(item => item.id !== id))
        }
      ]
    );
  };

  const addCommonItem = (name: string, unit: string) => {
    setSelectedCommonItem({ name, unit });
    setCommonItemQuantity('1');
  };

  const confirmAddCommonItem = () => {
    if (selectedCommonItem) {
      const newShoppingItem: ShoppingItem = {
        id: Date.now().toString(),
        name: selectedCommonItem.name,
        quantity: commonItemQuantity,
        unit: selectedCommonItem.unit,
        category: selectedCategory,
        isCompleted: false,
      };
      setItems([...items, newShoppingItem]);
      setSelectedCommonItem(null);
      setCommonItemQuantity('1');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF0000', '#FF6B6B']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alışveriş Listesi</Text>
          <TouchableOpacity onPress={() => setShowAddItem(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                setShowCommonItems(true);
              }}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={selectedCategory === category.id ? '#FF0000' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showCommonItems && selectedCategory !== 'all' && (
        <View style={styles.commonItemsContainer}>
          <Text style={styles.commonItemsTitle}>Sık Kullanılan Malzemeler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {commonItems[selectedCategory as keyof typeof commonItems]?.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.commonItemButton,
                  selectedCommonItem?.name === item.name && styles.selectedCommonItem
                ]}
                onPress={() => addCommonItem(item.name, item.unit)}
              >
                <Text style={styles.commonItemText}>{item.name}</Text>
                <Text style={styles.commonItemUnit}>{item.unit}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedCommonItem && (
            <View style={styles.commonItemQuantityContainer}>
              <Text style={styles.commonItemQuantityTitle}>
                {selectedCommonItem.name} miktarı:
              </Text>
              <View style={styles.commonItemQuantityInputContainer}>
                <TextInput
                  style={styles.commonItemQuantityInput}
                  value={commonItemQuantity}
                  onChangeText={setCommonItemQuantity}
                  keyboardType="numeric"
                  placeholder="Miktar"
                  placeholderTextColor="#999"
                />
                <Text style={styles.commonItemQuantityUnit}>
                  {selectedCommonItem.unit}
                </Text>
              </View>
              <View style={styles.commonItemQuantityButtons}>
                <TouchableOpacity
                  style={[styles.commonItemQuantityButton, styles.cancelButton]}
                  onPress={() => {
                    setSelectedCommonItem(null);
                    setCommonItemQuantity('1');
                  }}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.commonItemQuantityButton, styles.saveButton]}
                  onPress={confirmAddCommonItem}
                >
                  <Text style={styles.saveButtonText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => toggleItem(item.id)}
          >
            <LinearGradient
              colors={['#fff', '#f9f9f9']}
              style={styles.itemGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <View style={[
                    styles.checkbox,
                    item.isCompleted && styles.checkedBox
                  ]}>
                    {item.isCompleted && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View>
                    <Text style={[
                      styles.itemName,
                      item.isCompleted && styles.completedItem
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteItem(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF0000" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showAddItem ? (
        <View style={styles.addItemContainer}>
          <LinearGradient
            colors={['#fff', '#f9f9f9']}
            style={styles.addItemGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TextInput
              style={styles.input}
              placeholder="Ürün adı"
              value={newItem}
              onChangeText={setNewItem}
            />
            <View style={styles.quantityContainer}>
              <TextInput
                style={styles.quantityInput}
                placeholder="Miktar"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <View style={styles.unitContainer}>
                {units.map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      selectedUnit === unit && styles.selectedUnit
                    ]}
                    onPress={() => setSelectedUnit(unit)}
                  >
                    <Text style={[
                      styles.unitText,
                      selectedUnit === unit && styles.selectedUnitText
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.addItemButtons}>
              <TouchableOpacity
                style={[styles.addItemButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddItem(false);
                  setNewItem('');
                  setQuantity('1');
                  setSelectedUnit('adet');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addItemButton, styles.saveButton]}
                onPress={addItem}
              >
                <Text style={styles.saveButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddItem(true)}
        >
          <LinearGradient
            colors={['#FF0000', '#FF6B6B']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryContainer: {
    maxHeight: 100,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#FFE5E5',
  },
  categoryText: {
    marginLeft: 5,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  itemCard: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemGradient: {
    padding: 15,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF0000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#FF0000',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
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
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addItemGradient: {
    padding: 15,
    borderRadius: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  quantityContainer: {
    marginBottom: 15,
  },
  quantityInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  unitButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedUnit: {
    backgroundColor: '#FFE5E5',
  },
  unitText: {
    color: '#666',
  },
  selectedUnitText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  addItemButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  addItemButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#FF0000',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commonItemsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commonItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  commonItemButton: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commonItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  commonItemUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedCommonItem: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF0000',
  },
  commonItemQuantityContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  commonItemQuantityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  commonItemQuantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  commonItemQuantityInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  commonItemQuantityUnit: {
    fontSize: 16,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  commonItemQuantityButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  commonItemQuantityButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});

export default ShoppingListPage; 