import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { postPemesanan, getAllWisata } from '../API';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PemesananScreen({ route, navigation }) {
  const { wisata } = route.params;

  const [jumlahTiket, setJumlahTiket] = useState('');
  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaTiket, setHargaTiket] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchHargaTiket = async () => {
      try {
        const allWisata = await getAllWisata();
        const matchedWisata = allWisata.find((w) => w.id === wisata.id);
        if (matchedWisata) {
          setHargaTiket(parseInt(matchedWisata.harga_tiket || matchedWisata.harga || 0));
        } else {
          setHargaTiket(0);
        }
      } catch (err) {
        console.error('Gagal mengambil data wisata:', err);
        setHargaTiket(0);
      }
    };

    fetchHargaTiket();
  }, [wisata]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userId');
        if (userData) {
          const parsedId = parseInt(userData);
          setUser({ id: parsedId });
        } else {
          Alert.alert('Error', 'Pengguna belum login.');
        }
      } catch (err) {
        console.error('Gagal mendapatkan data user', err);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const jumlah = parseInt(jumlahTiket || 0);
    if (!isNaN(jumlah)) {
      setTotalHarga(hargaTiket * jumlah);
    } else {
      setTotalHarga(0);
    }
  }, [jumlahTiket, hargaTiket]);

  const handlePemesanan = async () => {
    const wisataId = wisata?.id;

    if (!jumlahTiket || isNaN(jumlahTiket) || parseInt(jumlahTiket) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah tiket yang valid.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Pengguna belum login.');
      return;
    }

    if (!wisataId) {
      Alert.alert('Error', 'Data wisata tidak tersedia.');
      return;
    }

    const payload = {
      id: 0,
      id_wisata: wisataId,
      id_pengguna: user.id,
      jumlah_tiket: parseInt(jumlahTiket),
      total_harga: totalHarga,
      tanggal_pemesanan: new Date().toISOString().split('T')[0],
    };

    try {
      setLoading(true);
      const result = await postPemesanan(payload);
      console.log('Response Pemesanan:', result);

      if (result?.result === 200) {
        Alert.alert('✅ Sukses', result.message || 'Pemesanan berhasil dibuat.');
        navigation.goBack();
      } else {
        Alert.alert('❌ Gagal', result.message || 'Terjadi kesalahan saat menyimpan.');
      }
    } catch (error) {
      console.error('Gagal melakukan pemesanan:', error);
      Alert.alert('Error', 'Tidak dapat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pemesanan Tiket</Text>

      <Text style={styles.label}>Nama Wisata:</Text>
      <Text style={styles.readonly}>{wisata?.nama_wisata || wisata?.name || '-'}</Text>

      <Text style={styles.label}>Harga per Tiket:</Text>
      <Text style={styles.readonly}>Rp {hargaTiket}</Text>

      <Text style={styles.label}>Jumlah Tiket:</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="Masukkan jumlah tiket"
        value={jumlahTiket}
        onChangeText={setJumlahTiket}
      />

      <Text style={styles.label}>Total Harga:</Text>
      <Text style={styles.total}>Rp {totalHarga}</Text>

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#999' }]}
        onPress={handlePemesanan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pesan Sekarang</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
  },
  readonly: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
