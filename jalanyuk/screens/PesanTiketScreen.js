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
import { postPemesanan } from '../API'; // pastikan path ini sesuai dengan lokasi file API.js

export default function PemesananScreen({ route, navigation }) {
  // Ambil wisata dari params, jika tidak ada beri default kosong
  const { wisata } = route.params || {};

  const [jumlahTiket, setJumlahTiket] = useState('');
  const [totalHarga, setTotalHarga] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Dummy user login
    setUser({ id: 123 });
  }, []);

  useEffect(() => {
    if (jumlahTiket && !isNaN(jumlahTiket) && wisata) {
      const hargaTotal = parseInt(jumlahTiket) * parseInt(wisata.harga);
      setTotalHarga(hargaTotal);
    } else {
      setTotalHarga(0);
    }
  }, [jumlahTiket, wisata]);

  const handlePemesanan = async () => {
    if (!jumlahTiket || isNaN(jumlahTiket) || parseInt(jumlahTiket) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah tiket yang valid.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Pengguna belum login.');
      return;
    }

    if (!wisata) {
      Alert.alert('Error', 'Data wisata tidak tersedia.');
      return;
    }

    const payload = {
      id: 0,
      id_wisata: wisata.id,
      id_pengguna: user.id,
      jumlah_tiket: parseInt(jumlahTiket),
      total_harga: totalHarga,
      tanggal_pemesanan: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    };

    try {
      setLoading(true);
      const result = await postPemesanan(payload);

      if (result.code === 200) {
        Alert.alert('Sukses', 'Pemesanan berhasil dibuat.');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', result.message || 'Terjadi kesalahan saat menyimpan.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Tidak dapat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  if (!wisata) {
    return (
      <View style={styles.centered}>
        <Text>Data wisata tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pemesanan Tiket</Text>

      <Text style={styles.label}>Nama Wisata:</Text>
      <Text style={styles.readonly}>{wisata.name}</Text>

      <Text style={styles.label}>Harga per Tiket:</Text>
      <Text style={styles.readonly}>Rp {wisata.harga}</Text>

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
