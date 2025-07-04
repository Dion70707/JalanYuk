import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { addGaleri } from '../../API'; // pastikan path benar

const AddGaleri = () => {
  const [imageUri, setImageUri] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Fallback handling untuk mediaTypes, supaya tidak muncul warning deprecated
  const mediaTypes = ImagePicker.MediaType
    ? [ImagePicker.MediaType.IMAGE]    // Versi baru (disarankan)
    : ImagePicker.MediaTypeOptions.Images;  // Versi lama (fallback)

    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin dibutuhkan', 'Aplikasi perlu akses ke galeri.');
        return;
      }
    
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          // langsung tulis 'Images' sebagai string
          mediaTypes: 'Images', 
          allowsEditing: true,
          quality: 1,
        });
    
        if (!result.canceled && result.assets?.length > 0) {
          setImageUri(result.assets[0].uri);
        } else {
          console.log('Pemilihan gambar dibatalkan atau kosong.');
        }
      } catch (error) {
        console.error('Gagal membuka galeri:', error);
        Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat memilih gambar.');
      }
    };
    

  const handleSubmit = async () => {
    if (!imageUri || !keterangan) {
      Alert.alert('Validasi', 'Gambar dan keterangan wajib diisi.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'gambar.jpg',
      type: 'image/jpeg',
    });
    formData.append('keterangan', keterangan);

    setLoading(true);
    try {
      const response = await addGaleri(formData);
      if (response.status === 200) {
        Alert.alert('Sukses', 'Galeri berhasil ditambahkan.');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat upload.');
      }
    } catch (error) {
      console.error('Upload error:', error.message);
      Alert.alert('Error', 'Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Pilih Gambar</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imageText}>Ketuk untuk pilih gambar</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Keterangan</Text>
      <TextInput
        style={styles.input}
        value={keterangan}
        onChangeText={setKeterangan}
        placeholder="Deskripsi foto"
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#888' }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Menyimpan...' : 'Simpan Galeri'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddGaleri;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageText: {
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
