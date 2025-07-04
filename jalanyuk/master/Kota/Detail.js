import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateKota } from '../../API'; // Sesuaikan dengan API-mu
import Notifikasi from '../../components/Notifikasi';

const DetailKota = () => {
  const route = useRoute();
  const { kota } = route.params;

  const [namaKota, setNamaKota] = useState(kota.nama_kota);
  const [provinsi, setProvinsi] = useState(kota.provinsi);
  const [status, setStatus] = useState(kota.status);

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const navigation = useNavigation();

  const handleUpdate = async () => {
    if (!namaKota || !provinsi || !status) {
      Alert.alert('Validasi', 'Semua field harus diisi');
      return;
    }

    try {
      await updateKota(kota.id_kota, {
        nama_kota: namaKota,
        provinsi,
        status,
      });

      setNotifMessage('Data kota berhasil diperbarui');
      setNotifType('success');
      setNotifVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.log('Error updating kota:', error);
      setNotifMessage('Gagal memperbarui data');
      setNotifType('error');
      setNotifVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Notifikasi
        visible={notifVisible}
        message={notifMessage}
        type={notifType}
        onClose={() => setNotifVisible(false)}
      />

      <Text style={styles.label}>Nama Kota</Text>
      <TextInput
        style={styles.input}
        value={namaKota}
        onChangeText={setNamaKota}
      />

      <Text style={styles.label}>Provinsi</Text>
      <TextInput
        style={styles.input}
        value={provinsi}
        onChangeText={setProvinsi}
      />

      <Text style={styles.label}>Status</Text>
      <TextInput
        style={styles.input}
        value={status}
        onChangeText={setStatus}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DetailKota;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
