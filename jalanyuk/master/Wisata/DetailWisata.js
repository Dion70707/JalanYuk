import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { updateWisata, getAllKota, getAllGaleri } from '../../API'; // pastikan API buat fetch list kota & galeri

const DetailWisata = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const initialData = params?.wisata || {};

  const [form, setForm] = useState({
    id_wisata: initialData.id_wisata || 0,
    id_kota: initialData.id_kota || '',
    id_galeri: initialData.id_galeri || '',
    nama_wisata: initialData.nama_wisata || '',
    kategori: initialData.kategori || '',
    alamat: initialData.alamat || '',
    koordinat_lat: initialData.koordinat_lat ? String(initialData.koordinat_lat) : '',
    koordinat_lng: initialData.koordinat_lng ? String(initialData.koordinat_lng) : '',
    deskripsi: initialData.deskripsi || '',
    no_telp: initialData.no_telp || '',
    jam_buka: initialData.jam_buka || '',
    jam_tutup: initialData.jam_tutup || '',
    harga_tiket: initialData.harga_tiket ? String(initialData.harga_tiket) : '',
    rating_rata: initialData.rating_rata ? String(initialData.rating_rata) : '',
    jumlah_review: initialData.jumlah_review ? String(initialData.jumlah_review) : '',
    status: initialData.status || 'Aktif',
  });

  const [kotaList, setKotaList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch list kota dan galeri untuk dropdown
    const fetchLists = async () => {
      try {
        const kotaRes = await getAllKota();
        const galeriRes = await getAllGaleri();
        setKotaList(kotaRes.data || []);
        setGaleriList(galeriRes.data || []);
      } catch (error) {
        console.error('Error fetching kota/galeri list:', error);
      }
    };
    fetchLists();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    // validasi sederhana
    if (!form.nama_wisata.trim()) {
      Alert.alert('Validasi', 'Nama Wisata harus diisi');
      return;
    }
    if (!form.id_kota) {
      Alert.alert('Validasi', 'Kota harus dipilih');
      return;
    }
    if (!form.id_galeri) {
      Alert.alert('Validasi', 'Galeri harus dipilih');
      return;
    }

    setLoading(true);
    try {
      // konversi tipe data yang perlu jadi number
      const payload = {
        ...form,
        koordinat_lat: parseFloat(form.koordinat_lat),
        koordinat_lng: parseFloat(form.koordinat_lng),
        harga_tiket: parseFloat(form.harga_tiket),
        rating_rata: parseFloat(form.rating_rata),
        jumlah_review: parseInt(form.jumlah_review, 10),
      };

      const response = await updateWisata(payload);
      if (response?.status === 200) {
        Alert.alert('Berhasil', 'Data wisata berhasil diperbarui');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', 'Update gagal');
      }
    } catch (error) {
      console.error('Error updating wisata:', error);
      Alert.alert('Error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Detail / Edit Wisata</Text>

        {/* Picker Kota */}
        <Text style={styles.label}>Pilih Kota</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.id_kota}
            onValueChange={(val) => handleChange('id_kota', val)}
          >
            <Picker.Item label="-- Pilih Kota --" value="" />
            {kotaList.map((kota) => (
              <Picker.Item key={kota.id_kota} label={kota.nama_kota} value={kota.id_kota} />
            ))}
          </Picker>
        </View>

        {/* Picker Galeri */}
        <Text style={styles.label}>Pilih Galeri</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.id_galeri}
            onValueChange={(val) => handleChange('id_galeri', val)}
          >
            <Picker.Item label="-- Pilih Galeri --" value="" />
            {galeriList.map((galeri) => (
              <Picker.Item key={galeri.id_galeri} label={galeri.keterangan} value={galeri.id_galeri} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nama Wisata"
          value={form.nama_wisata}
          onChangeText={(val) => handleChange('nama_wisata', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Kategori"
          value={form.kategori}
          onChangeText={(val) => handleChange('kategori', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Alamat"
          value={form.alamat}
          onChangeText={(val) => handleChange('alamat', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Koordinat Latitude"
          value={form.koordinat_lat}
          onChangeText={(val) => handleChange('koordinat_lat', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Koordinat Longitude"
          value={form.koordinat_lng}
          onChangeText={(val) => handleChange('koordinat_lng', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Deskripsi"
          value={form.deskripsi}
          onChangeText={(val) => handleChange('deskripsi', val)}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="No. Telp"
          value={form.no_telp}
          onChangeText={(val) => handleChange('no_telp', val)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Jam Buka (e.g. 08:00)"
          value={form.jam_buka}
          onChangeText={(val) => handleChange('jam_buka', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Jam Tutup (e.g. 17:00)"
          value={form.jam_tutup}
          onChangeText={(val) => handleChange('jam_tutup', val)}
        />
        <TextInput
          style={styles.input}
          placeholder="Harga Tiket"
          value={form.harga_tiket}
          onChangeText={(val) => handleChange('harga_tiket', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Rating Rata-rata"
          value={form.rating_rata}
          onChangeText={(val) => handleChange('rating_rata', val)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Jumlah Review"
          value={form.jumlah_review}
          onChangeText={(val) => handleChange('jumlah_review', val)}
          keyboardType="numeric"
        />

        {/* Status bisa dropdown jika mau, atau readonly */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.status}
            onValueChange={(val) => handleChange('status', val)}
          >
            <Picker.Item label="Aktif" value="Aktif" />
            <Picker.Item label="Tidak Aktif" value="Tidak Aktif" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#6c757d' }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Menyimpan...' : 'Update'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailWisata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
