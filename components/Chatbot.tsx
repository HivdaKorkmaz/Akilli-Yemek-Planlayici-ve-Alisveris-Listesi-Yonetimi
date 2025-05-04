import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GEMINI_API_KEY = 'AIzaSyDjxWFFmj-CWd7-jZeijtPjrlG-gTgDhx0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ChatbotProps {
  onAddMeal: (mealType: 'breakfast' | 'lunch' | 'dinner', mealName: string, recipe?: { ingredients: string[]; instructions: string[] }) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onAddMeal }) => {
  const [messages, setMessages] = useState<Array<{text: string; isUser: boolean}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const messagesEndRef = useRef<ScrollView>(null);

  const toggleChatbot = () => {
    if (!isChatbotVisible) {
      setIsChatbotVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsChatbotVisible(false);
      });
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, { text: newMessage, isUser: true }]);
      setNewMessage('');

      try {
        // Yemek ekleme komutu kontrolü
        const addMealPatterns = [
          /(kahvaltı|öğle|akşam) yemeğine (.+) ekle/i,
          /(kahvaltı|öğle|akşam)(ya|ye) (.+) ekle/i,
          /(.+) (kahvaltı|öğle|akşam) yemeğine ekle/i,
          /(.+) (kahvaltı|öğle|akşam)(ya|ye) ekle/i
        ];

        let mealType = null;
        let mealName = null;

        for (const pattern of addMealPatterns) {
          const match = newMessage.toLowerCase().match(pattern);
          if (match) {
            if (pattern === addMealPatterns[0]) {
              mealType = match[1];
              mealName = match[2];
            } else if (pattern === addMealPatterns[1]) {
              mealType = match[1];
              mealName = match[3];
            } else if (pattern === addMealPatterns[2]) {
              mealType = match[2];
              mealName = match[1];
            } else {
              mealType = match[2];
              mealName = match[1];
            }
            break;
          }
        }

        if (mealType && mealName) {
          // Yemek tipini belirle
          let selectedType: 'breakfast' | 'lunch' | 'dinner' | null = null;
          if (mealType === 'kahvaltı') selectedType = 'breakfast';
          else if (mealType === 'öğle') selectedType = 'lunch';
          else if (mealType === 'akşam') selectedType = 'dinner';
          
          if (selectedType) {
            // Yemek tarifini al
            const recipePrompt = `${mealName.trim()} tarifini ver. Şu formatta olmalı:
            MALZEMELER:
            - [Malzeme 1]
            - [Malzeme 2]
            ...
            
            HAZIRLANIŞI:
            [Adım adım tarif]`;

            const recipeResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: recipePrompt }]
                }]
              })
            });

            const recipeData = await recipeResponse.json();
            let recipe: { ingredients: string[]; instructions: string[]; } | undefined = undefined;

            if (recipeData.candidates && recipeData.candidates[0]?.content?.parts[0]?.text) {
              const recipeText = recipeData.candidates[0].content.parts[0].text;
              console.log("Alınan tarif metni:", recipeText); // Debug için
              
              // Farklı formatları destekleyen daha esnek bir regex pattern kullan
              let ingredientsMatch = recipeText.match(/MALZEMELER:([\s\S]+?)(?:HAZIRLANIŞI:|$)/i);
              
              // Eğer ilk format bulunamazsa, alternatif formatları dene
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/\*\*MALZEMELER:\*\*([\s\S]+?)(?:\*\*HAZIRLANIŞI:\*\*|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler:([\s\S]+?)(?:Hazırlanışı:|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Hazırlanışı|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Yapılışı|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Tarifi|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Nasıl Yapılır|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Yapılış|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Hazırlanış|$)/i);
              }
              
              if (!ingredientsMatch) {
                ingredientsMatch = recipeText.match(/Malzemeler([\s\S]+?)(?:Tarif|$)/i);
              }
              
              let ingredients: string[] = [];
              let instructions: string[] = [];
              
              if (ingredientsMatch) {
                const ingredientsText = ingredientsMatch[1];
                console.log("Malzemeler metni:", ingredientsText); // Debug için
                
                // Malzemeleri işle - farklı formatları destekle
                // Yıldız işaretli liste formatı
                if (ingredientsText.includes('*')) {
                  ingredients = ingredientsText
                    .split('\n')
                    .filter((line: string) => line.trim().startsWith('*'))
                    .map((line: string) => line.replace(/^\*\s*/, '').trim());
                } 
                // Tire işaretli liste formatı
                else if (ingredientsText.includes('-')) {
                  ingredients = ingredientsText
                    .split('\n')
                    .filter((line: string) => line.trim().startsWith('-'))
                    .map((line: string) => line.replace('-', '').trim());
                }
                // Diğer formatlar için
                else {
                  // Önce satırlara böl
                  const lines = ingredientsText.split('\n');
                  
                  // Her satırı kontrol et
                  for (const line of lines) {
                    const trimmedLine = line.trim();
                    // Boş satırları atla
                    if (!trimmedLine) continue;
                    
                    // Eğer satır bir malzeme gibi görünüyorsa ekle
                    if (trimmedLine.length < 100 && !trimmedLine.includes('HAZIRLANIŞI') && !trimmedLine.includes('Hazırlanışı')) {
                      ingredients.push(trimmedLine);
                    }
                  }
                }
              } else {
                // Malzemeler kısmı bulunamazsa, tüm metni analiz et
                const lines = recipeText.split('\n');
                let foundIngredients = false;
                
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  
                  // Boş satırları atla
                  if (!trimmedLine) continue;
                  
                  // Malzemeler başlığını ara
                  if (trimmedLine.toLowerCase().includes('malzemeler')) {
                    foundIngredients = true;
                    continue;
                  }
                  
                  // Hazırlanışı başlığını bulduğunda malzemeleri toplamayı bırak
                  if (trimmedLine.toLowerCase().includes('hazırlanışı') || 
                      trimmedLine.toLowerCase().includes('yapılışı') || 
                      trimmedLine.toLowerCase().includes('tarifi') ||
                      trimmedLine.toLowerCase().includes('nasıl yapılır') ||
                      trimmedLine.toLowerCase().includes('yapılış') ||
                      trimmedLine.toLowerCase().includes('hazırlanış') ||
                      trimmedLine.toLowerCase().includes('tarif')) {
                    foundIngredients = false;
                    continue;
                  }
                  
                  // Malzemeler kısmındaysak ve satır bir malzeme gibi görünüyorsa ekle
                  if (foundIngredients && trimmedLine.length < 100) {
                    // Tire veya yıldız işaretlerini temizle
                    const cleanedLine = trimmedLine.replace(/^[-*]\s*/, '').trim();
                    if (cleanedLine) {
                      ingredients.push(cleanedLine);
                    }
                  }
                }
              }
              
              // Hazırlanışı kısmını bul - farklı formatları destekle
              let instructionsMatch = recipeText.match(/HAZIRLANIŞI:([\s\S]+?)(?:\n\n|$)/i);
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/\*\*HAZIRLANIŞI:\*\*([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Hazırlanışı:([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Hazırlanışı([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Yapılışı([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Tarifi([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Nasıl Yapılır([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Yapılış([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Hazırlanış([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (!instructionsMatch) {
                instructionsMatch = recipeText.match(/Tarif([\s\S]+?)(?:\n\n|$)/i);
              }
              
              if (instructionsMatch) {
                const instructionsText = instructionsMatch[1];
                console.log("Hazırlanışı metni:", instructionsText); // Debug için
                
                // Talimatları işle - farklı formatları destekle
                instructions = instructionsText
                  .split('\n')
                  .filter((line: string) => line.trim() && line.trim() !== "**" && line.trim() !== "*")
                  .map((line: string) => {
                    // Sayı ve nokta ile başlayan kısmı temizle
                    return line.replace(/^\d+\.\s*/, '').trim();
                  });
              } else {
                // Hazırlanışı kısmı bulunamazsa, tüm metni analiz et
                const lines = recipeText.split('\n');
                let foundInstructions = false;
                
                for (const line of lines) {
                  const trimmedLine = line.trim();
                  
                  // Boş satırları atla
                  if (!trimmedLine) continue;
                  
                  // Hazırlanışı başlığını ara
                  if (trimmedLine.toLowerCase().includes('hazırlanışı') || 
                      trimmedLine.toLowerCase().includes('yapılışı') || 
                      trimmedLine.toLowerCase().includes('tarifi') ||
                      trimmedLine.toLowerCase().includes('nasıl yapılır') ||
                      trimmedLine.toLowerCase().includes('yapılış') ||
                      trimmedLine.toLowerCase().includes('hazırlanış') ||
                      trimmedLine.toLowerCase().includes('tarif')) {
                    foundInstructions = true;
                    continue;
                  }
                  
                  // Hazırlanışı kısmındaysak ve satır bir talimat gibi görünüyorsa ekle
                  if (foundInstructions && trimmedLine.length > 0 && trimmedLine !== "**" && trimmedLine !== "*") {
                    // Sayı ve nokta ile başlayan kısmı temizle
                    const cleanedLine = trimmedLine.replace(/^\d+\.\s*/, '').trim();
                    if (cleanedLine) {
                      instructions.push(cleanedLine);
                    }
                  }
                }
                
                // Eğer hala talimat bulunamadıysa, malzemeler kısmından sonraki tüm metni kullan
                if (instructions.length === 0) {
                  const remainingText = recipeText
                    .replace(/MALZEMELER:[\s\S]+?HAZIRLANIŞI:/i, '')
                    .replace(/\*\*MALZEMELER:\*\*[\s\S]+?\*\*HAZIRLANIŞI:\*\*/i, '')
                    .replace(/Malzemeler:[\s\S]+?Hazırlanışı:/i, '')
                    .replace(/Malzemeler[\s\S]+?Hazırlanışı/i, '')
                    .replace(/Malzemeler[\s\S]+?Yapılışı/i, '')
                    .replace(/Malzemeler[\s\S]+?Tarifi/i, '')
                    .replace(/Malzemeler[\s\S]+?Nasıl Yapılır/i, '')
                    .replace(/Malzemeler[\s\S]+?Yapılış/i, '')
                    .replace(/Malzemeler[\s\S]+?Hazırlanış/i, '')
                    .replace(/Malzemeler[\s\S]+?Tarif/i, '')
                    .trim();
                  
                  instructions = remainingText
                    .split('\n')
                    .filter((line: string) => line.trim() && line.trim() !== "**" && line.trim() !== "*")
                    .map((line: string) => {
                      // Sayı ve nokta ile başlayan kısmı temizle
                      return line.replace(/^\d+\.\s*/, '').trim();
                    });
                }
              }
              
              // Eğer hala talimat bulunamadıysa, yapay talimatlar oluştur
              if (instructions.length === 0 && ingredients.length > 0) {
                // Yemek adını bul
                const currentMealName = mealName || "Bu yemek";
                
                // Yapay talimatlar oluştur
                instructions = [
                  `${currentMealName} için malzemeleri hazırlayın.`,
                  "Malzemeleri uygun şekilde doğrayın ve hazırlayın.",
                  "Tencerede veya tavada malzemeleri pişirin.",
                  "Gerekirse baharatları ekleyin ve karıştırın.",
                  "Yemeği servis yapın ve afiyet olsun."
                ];
              }
              
              console.log("İşlenmiş malzemeler:", ingredients); // Debug için
              console.log("İşlenmiş talimatlar:", instructions); // Debug için
              
              recipe = {
                ingredients,
                instructions
              };
            } else {
              // Eğer belirli format bulunamazsa, tüm metni talimat olarak kullan
              const allLines = recipeData.candidates[0].content.parts[0].text
                .split('\n')
                .filter((line: string) => line.trim() && line.trim() !== "**" && line.trim() !== "*")
                .map((line: string) => {
                  // Sayı ve nokta ile başlayan kısmı temizle
                  return line.replace(/^\d+\.\s*/, '').trim();
                });
              
              recipe = {
                ingredients: [],
                instructions: allLines
              };
            }
            
            // Yemeği ekle
            onAddMeal(selectedType, mealName.trim(), recipe);
            
            // Onay mesajı gönder
            setMessages(prev => [...prev, { 
              text: `${mealName.trim()} ${mealType} yemeğine eklendi.${recipe ? '\n\nTarif de eklendi!' : ''}`, 
              isUser: false 
            }]);
            return;
          }
        }

        // Yemek tarifi için özel prompt
        const foodPrompt = `Sen bir yemek asistanısın. Kullanıcının sorusu: ${newMessage}
        
        Eğer bu bir yemek tarifi sorusuysa, şu formatta yanıt ver:
        TARIF: [Yemek adı]
        MALZEMELER:
        - [Malzeme 1]
        - [Malzeme 2]
        ...
        
        HAZIRLANIŞI:
        [Adım adım tarif]
        
        Eğer bu bir yemek tarifi sorusu değilse, sadece yemek, tarif, beslenme ve mutfakla ilgili konulara yanıt ver.`;

        // Gemini API'ye istek gönder
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: foodPrompt }]
            }]
          })
        });

        const data = await response.json();
        
        // API yanıtını kontrol et ve mesajı ekle
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const botResponse = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
        } else {
          setMessages(prev => [...prev, { 
            text: "Üzgünüm, şu anda yemekle ilgili yanıt veremiyorum. Lütfen yemek, tarif veya beslenmeyle ilgili bir soru sorun.", 
            isUser: false 
          }]);
        }
      } catch (error) {
        console.error('Gemini API Hatası:', error);
        setMessages(prev => [...prev, { 
          text: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 
          isUser: false 
        }]);
      }
    }
  };

  // Mesajlar değiştiğinde otomatik olarak en alta kaydır
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <>
      {/* Chatbot Butonu */}
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={toggleChatbot}
      >
        <LinearGradient
          colors={['#FF0000', '#FF6B6B']}
          style={styles.chatbotButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Chatbot Modal */}
      {isChatbotVisible && (
        <Modal
          visible={isChatbotVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={toggleChatbot}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatbotModal}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.modalOverlay}>
              <Animated.View 
                style={[
                  styles.chatbotContent,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#FF0000', '#FF6B6B']}
                  style={styles.chatbotGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.chatbotHeader}>
                    <Text style={styles.chatbotTitle}>Yemek Asistanı</Text>
                    <TouchableOpacity onPress={toggleChatbot} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    ref={messagesEndRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {messages.map((message, index) => (
                      <View
                        key={index}
                        style={[
                          styles.messageBubble,
                          message.isUser ? styles.userMessage : styles.botMessage
                        ]}
                      >
                        <Text style={[
                          styles.messageText,
                          message.isUser ? styles.userMessageText : styles.botMessageText
                        ]}>
                          {message.text}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={newMessage}
                      onChangeText={setNewMessage}
                      placeholder="Mesajınızı yazın..."
                      placeholderTextColor="#999"
                      multiline={false}
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                      <LinearGradient
                        colors={['#FF0000', '#FF6B6B']}
                        style={styles.sendButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons name="send" size={20} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chatbotButton: {
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
  chatbotButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotContent: {
    width: '95%',
    height: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatbotGradient: {
    flex: 1,
    padding: 20,
  },
  chatbotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chatbotTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#333',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    color: '#333',
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chatbot; 