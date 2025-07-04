import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addKota } from '../../API';

const AddKota = () => {
  const navigation = useNavigation();

  const [namaKota, setNamaKota] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const status = 'Aktif'; // status default

  const handleSave = async () => {
    if (!namaKota || !provinsi) {
      Alert.alert('Validasi', 'Nama kota dan provinsi wajib diisi.');
      return;
    }

    const newKota = {
      nama_kota: namaKota,
      provinsi,
      status,
    };

    try {
      await addKota(newKota);
      navigation.navigate('KotaIndex', { showSuccessMessage: true });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Gagal menambahkan kota.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tambah Kota</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.label}>Nama Kota</Text>
              <TextInput
                style={styles.input}
                value={namaKota}
                onChangeText={setNamaKota}
                placeholder="Isi nama kota"
              />

              <Text style={styles.label}>Provinsi</Text>
              <TextInput
                style={styles.input}
                value={provinsi}
                onChangeText={setProvinsi}
                placeholder="Isi provinsi"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddKota;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: '#007bff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
