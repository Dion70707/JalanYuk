import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getGaleriById, updateGaleri } from '../../API';
import { launchImageLibrary } from 'react-native-image-picker';

// Ganti sesuai IP lokal server kamu
const IMAGE_BASE_URL = '172.20.10.9:8080';

const DetailGaleri = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [galeri, setGaleri] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchGaleri();
  }, []);

  const fetchGaleri = async () => {
    setLoading(true);
    try {
      const data = await getGaleriById(id);
      setGaleri(data);
      setKeterangan(data.keterangan || '');
    } catch (error) {
      Alert.alert('Error', 'Gagal load data galeri');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeKeterangan = (text) => {
    console.log('Keterangan changed:', text);
    setKeterangan(text);
    setGaleri((prev) => ({ ...prev, keterangan: text }));
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Izin Akses Galeri',
            message: 'Aplikasi membutuhkan akses galeri untuk memilih gambar',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Izin Akses Penyimpanan',
            message: 'Aplikasi perlu akses penyimpanan untuk memilih gambar',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Izin ditolak', 'Tidak bisa mengakses galeri.');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'mixed',
        quality: 0.8,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Gagal memilih gambar: ' + response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setNewImage(asset);
          setGaleri((prev) => ({ ...prev, url_foto: asset.uri }));
        }
      }
    );
  };

  const handleUpdate = async () => {
    if (!keterangan.trim()) {
      return Alert.alert('Validasi', 'Keterangan wajib diisi.');
    }
  
    const formData = new FormData();
    formData.append('id', galeri.id.toString());
    formData.append('keterangan', keterangan); // Ambil langsung dari input
  
    if (newImage) {
      formData.append('file', {
        uri: newImage.uri,
        name: newImage.fileName || 'update.jpg',
        type: newImage.type || 'image/jpeg',
      });
    }
  
    try {
      const res = await fetch(`${IMAGE_BASE_URL}/galeri`, {
        method: 'PUT',
        body: formData, // Agar multi-part diproses benar
        // Jangan set Content-Type manual
      });
  
      const result = await res.json();
      console.log('Update response:', res.status, result);
  
      if (res.ok && result.result === 200) {
        Alert.alert('Sukses', 'Data berhasil diperbarui');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', result.message || 'Update gagal');
      }
    } catch (err) {
      console.error('Error update:', err);
      Alert.alert('Error', 'Tidak dapat menghubungi server');
    }
  };
  

  const handleToggleStatus = async () => {
    const newStatus = galeri.status === 'aktif' ? 'tidak aktif' : 'aktif';
    try {
      const res = await updateGaleri({ ...galeri, status: newStatus });
      if (res.status === 200) {
        Alert.alert('Sukses', `Status berhasil diubah menjadi ${newStatus}`);
        setGaleri((prev) => ({ ...prev, status: newStatus }));
      } else {
        Alert.alert('Gagal', res.message || 'Gagal ubah status');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menghubungi server');
    }
  };

  if (loading || !galeri) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Pilih Gambar</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {galeri?.url_foto ? (
            <Image
              source={{
                uri: galeri.url_foto.startsWith('http')
                  ? galeri.url_foto
                  : IMAGE_BASE_URL + galeri.url_foto,
              }}
              style={styles.imagePreview}
            />
          ) : (
            <Text style={styles.imageText}>Ketuk untuk pilih gambar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Keterangan</Text>
        <TextInput
          style={styles.input}
          value={keterangan}
          onChangeText={handleChangeKeterangan}
          multiline
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{galeri.status || 'Tidak ada status'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, updating && { backgroundColor: '#888' }]}
          onPress={handleUpdate}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? 'Menyimpan...' : 'Update Galeri'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleToggleStatus}>
          <Text style={styles.deleteButtonText}>
            {galeri.status === 'aktif' ? 'Nonaktifkan Galeri' : 'Aktifkan Galeri'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailGaleri;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imagePicker: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imageText: {
    color: '#888',
    fontSize: 16,
  },

  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  statusContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
