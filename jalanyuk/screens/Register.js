import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPengguna } from '../API';
import Notifikasi from '../components/Notifikasi';
import i18n from '../components/i18n';

const RegisterScreen = ({ navigation }) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const idRole = 2;

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem('appLanguage');
      if (storedLang) {
        i18n.locale = storedLang;
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!nama || !email || !password) {
      setNotifMessage(i18n.t('errorEmpty'));
      setNotifVisible(true);
      return;
    }

    const newPengguna = {
      nama_lengkap: nama,
      email,
      password,
      id_role: idRole,
      created_by: 'unknown',
      created_date: new Date().toISOString().split('T')[0],
    };

    try {
      setLoading(true);
      await createPengguna(newPengguna);
      setLoading(false);

      Alert.alert(i18n.t('successRegister'), i18n.t('signIn'), [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error) {
      setLoading(false);
      console.log(error);

      if (error?.response?.status === 409) {
        Alert.alert('Email Sudah Terdaftar', i18n.t('emailExistTitle'));
      } else {
        Alert.alert('Error', i18n.t('errorGeneral'));
      }
    }
  };

  return (
    <LinearGradient colors={['#007bff', '#0056b3']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{i18n.t('signUp')}</Text>

             <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={nama}
              onChangeText={setNama}
              placeholder={i18n.t('enterFullName')}
            />

            <Text style={styles.label}>{i18n.t('email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={i18n.t('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{i18n.t('password')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                value={password}
                onChangeText={setPassword}
                placeholder={i18n.t('password')}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

           

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{i18n.t('signUp')}</Text>
            </TouchableOpacity>

            <View style={styles.bottomText}>
              <Text style={styles.registerText}>{i18n.t('haveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>{i18n.t('signIn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{i18n.t('loading')}</Text>
        </View>
      </Modal>

      <Notifikasi
        visible={notifVisible}
        message={notifMessage}
        onClose={() => setNotifVisible(false)}
        type={notifMessage.includes('berhasil') ? 'success' : 'error'}
      />
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    height: 50,
    marginBottom: 15,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#555',
  },
  registerLink: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});
