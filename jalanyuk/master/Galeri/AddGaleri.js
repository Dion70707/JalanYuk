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
import { addGaleri } from '../../API';

const AddGaleri = () => {
  const [imageUri, setImageUri] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin dibutuhkan', 'Aplikasi perlu akses ke galeri.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gagal membuka galeri:', error);
      Alert.alert('Error', 'Gagal membuka galeri.');
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !keterangan) {
      Alert.alert('Validasi', 'Gambar dan keterangan wajib diisi.');
      return;
    }
  
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : `image`;
  
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: fileType,
    });
    formData.append('keterangan', keterangan);
  
    setLoading(true);
    try {
      const response = await addGaleri(formData);
  
      // ✅ Tambahkan logging DI SINI
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      console.log('Response headers:', response.headers);
  
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Sukses', 'Galeri berhasil ditambahkan.');
        navigation.goBack();
      } else {
        let errorMsg = 'Terjadi kesalahan saat upload.';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch (_) {}
        Alert.alert('Gagal', errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
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
