import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../src/config/firebase';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShoppingLists, setShowShoppingLists] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  // Örnek favori tarifler verisi (daha sonra Firebase'den çekilecek)
  const favoriteRecipes = [
    {
      id: 1,
      name: 'Karnıyarık',
      description: 'Geleneksel Türk mutfağından patlıcan yemeği',
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 2,
      name: 'Mantı',
      description: 'El açması mantı, yoğurt ile servis edilir',
      image: 'https://via.placeholder.com/100'
    },
    // Daha fazla tarif eklenebilir
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/HomePage');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      // Önce kullanıcıyı yeniden doğrula
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Şifreyi güncelle
      await updatePassword(user, newPassword);
      
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setShowPasswordUpdate(false);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Hata', 'Mevcut şifreniz yanlış.');
      } else {
        Alert.alert('Hata', 'Şifre güncellenirken bir hata oluştu.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Kullanıcı Bilgileri Sekmesi */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setShowUserInfo(!showUserInfo)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#FF0000" />
            <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
            <Ionicons 
              name={showUserInfo ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {/* Kullanıcı Bilgileri Detayları */}
        {showUserInfo && (
          <View style={styles.userInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-posta:</Text>
              <Text style={styles.infoValue}>{auth.currentUser?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kullanıcı ID:</Text>
              <Text style={styles.infoValue}>{auth.currentUser?.uid}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hesap Oluşturma:</Text>
              <Text style={styles.infoValue}>
                {auth.currentUser?.metadata.creationTime ? 
                  new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('tr-TR') 
                  : 'Bilgi yok'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Son Giriş:</Text>
              <Text style={styles.infoValue}>
                {auth.currentUser?.metadata.lastSignInTime ? 
                  new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString('tr-TR') 
                  : 'Bilgi yok'}
              </Text>
            </View>
          </View>
        )}

        {/* Favori Tariflerim Sekmesi */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={24} color="#FF0000" />
            <Text style={styles.sectionTitle}>Favori Tariflerim</Text>
            <Ionicons 
              name={showFavorites ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {/* Favori Tarifler Listesi */}
        {showFavorites && (
          <View style={styles.favoritesContainer}>
            {favoriteRecipes.map(recipe => (
              <TouchableOpacity key={recipe.id} style={styles.recipeCard}>
                <Image 
                  source={{ uri: recipe.image }} 
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeDescription}>{recipe.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Alışveriş Listelerim Sekmesi */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setShowShoppingLists(!showShoppingLists)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="cart-outline" size={24} color="#FF0000" />
            <Text style={styles.sectionTitle}>Alışveriş Listelerim</Text>
            <Ionicons 
              name={showShoppingLists ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {/* Alışveriş Listeleri İçeriği */}
        {showShoppingLists && (
          <View style={styles.shoppingListContainer}>
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>Henüz alışveriş listeniz bulunmuyor</Text>
              <TouchableOpacity style={styles.createListButton}>
                <Text style={styles.createListButtonText}>Yeni Liste Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Şifre Güncelleme Sekmesi */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setShowPasswordUpdate(!showPasswordUpdate)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={24} color="#FF0000" />
            <Text style={styles.sectionTitle}>Şifre Güncelleme</Text>
            <Ionicons 
              name={showPasswordUpdate ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {/* Şifre Güncelleme Formu */}
        {showPasswordUpdate && (
          <View style={styles.passwordContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mevcut Şifre"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Yeni Şifre"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Yeni Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Çıkış Yap Butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  userInfoContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoritesContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
  },
  shoppingListContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  createListButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createListButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  updateButton: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ffcccc',
  },
}); 