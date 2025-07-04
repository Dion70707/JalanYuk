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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveWisata, getAllKota, getAllGaleri } from '../../API'; // pastikan API sudah ada

const AddWisata = () => {
  const navigation = useNavigation();

  const [kotaList, setKotaList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);

  const [form, setForm] = useState({
    id_kota: '',
    id_galeri: '',
    nama_wisata: '',
    kategori: '',
    alamat: '',
    koordinat_lat: '',
    koordinat_lng: '',
    deskripsi: '',
    no_telp: '',
    jam_buka: '',
    jam_tutup: '',
    harga_tiket: '',
    rating_rata: '',
    jumlah_review: '',
  });

  const [showJamBukaPicker, setShowJamBukaPicker] = useState(false);
  const [showJamTutupPicker, setShowJamTutupPicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kotaData = await getAllKota();
        setKotaList(kotaData || []);
  
        const galeriData = await getAllGaleri();
        setGaleriList(galeriData || []);
      } catch (error) {
        console.error('Error fetching kota/galeri list:', error);
        Alert.alert('Error', 'Gagal memuat data kota atau galeri');
      }
    };
  
    fetchData();
  }, []);
  
  

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const onChangeJamBuka = (event, selectedDate) => {
    setShowJamBukaPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const waktu = `${hours}:${minutes}`;
      handleChange('jam_buka', waktu);
    }
  };

  const onChangeJamTutup = (event, selectedDate) => {
    setShowJamTutupPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const waktu = `${hours}:${minutes}`;
      handleChange('jam_tutup', waktu);
    }
  };

  const handleSubmit = async () => {
    if (form.id_kota === '' || form.id_galeri === '' || !form.nama_wisata.trim()) {
      Alert.alert('Validasi', 'Harap isi semua field yang wajib.');
      console.log('form.id_kota:', form.id_kota);
console.log('form.id_galeri:', form.id_galeri);
console.log('form.nama_wisata:', form.nama_wisata);

      return;
    }
    
    try {
      const payload = {
        ...form,
        status: 'Aktif',
        created_by: 'admin',
      };
      const response = await saveWisata(payload);
      if (response?.status === 200) {
        Alert.alert('Sukses', 'Wisata berhasil ditambahkan');
        navigation.goBack();
      } else {
        Alert.alert('Gagal', 'Wisata gagal disimpan');
      }
    } catch (error) {
      console.error('Error saving wisata:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tambah Wisata</Text>

        <Text style={styles.label}>Pilih Kota</Text>
        <Picker
          selectedValue={form.id_kota}
          onValueChange={(val) => handleChange('id_kota', val)}
          style={styles.picker}
        >
          <Picker.Item label="-- Pilih Kota --" value="" />
          {kotaList.map((kota) => (
            <Picker.Item key={kota.id_kota} label={kota.nama_kota} value={kota.id_kota} />
          ))}
        </Picker>

        <Text style={styles.label}>Pilih Galeri</Text>
        <Picker
          selectedValue={form.id_galeri}
          onValueChange={(val) => handleChange('id_galeri', val)}
          style={styles.picker}
        >
          <Picker.Item label="-- Pilih Galeri --" value="" />
          {galeriList.map((galeri) => (
            <Picker.Item key={galeri.id_galeri} label={galeri.keterangan} value={galeri.id_galeri} />
          ))}
        </Picker>

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
          placeholder="No Telp"
          value={form.no_telp}
          onChangeText={(val) => handleChange('no_telp', val)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Jam Buka</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowJamBukaPicker(true)}
        >
          <Text>{form.jam_buka || 'Pilih Jam Buka'}</Text>
        </TouchableOpacity>
        {showJamBukaPicker && (
          <DateTimePicker
            value={
              form.jam_buka
                ? new Date(`1970-01-01T${form.jam_buka}:00`)
                : new Date()
            }
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeJamBuka}
          />
        )}

        <Text style={styles.label}>Jam Tutup</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowJamTutupPicker(true)}
        >
          <Text>{form.jam_tutup || 'Pilih Jam Tutup'}</Text>
        </TouchableOpacity>
        {showJamTutupPicker && (
          <DateTimePicker
            value={
              form.jam_tutup
                ? new Date(`1970-01-01T${form.jam_tutup}:00`)
                : new Date()
            }
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeJamTutup}
          />
        )}

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

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Simpan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddWisata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center', // buat text di TouchableOpacity center vertikal
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
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
