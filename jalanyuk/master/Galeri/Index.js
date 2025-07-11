import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAllGaleri, deleteGaleri } from '../../API';

const IMAGE_BASE_URL = 'http://172.20.10.9:8080';

const Index = () => {
  const [galeriList, setGaleriList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchGaleri = async () => {
    setLoading(true);
    try {
      const data = await getAllGaleri();
      setGaleriList(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data galeri');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      return;
    }

    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus galeri ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGaleri(id);
            fetchGaleri();
          } catch (error) {
            console.log('Gagal menghapus galeri:', error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (isFocused) fetchGaleri();
  }, [isFocused]);

  const filteredGaleri = galeriList.filter((item) =>
    (item?.keterangan ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetailGaleri', { id: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.url_foto}` }}
        style={styles.image}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={2} style={styles.keteranganText}>
          {item.keterangan}
        </Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item.id);
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Cari Galeri"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : filteredGaleri.length === 0 ? (
        <Text style={styles.emptyText}>Data galeri tidak ditemukan.</Text>
      ) : (
        <FlatList
          data={filteredGaleri}
          keyExtractor={(item, index) => item?.id?.toString() ?? `key-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddGaleri')}
      >
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    margin: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,

    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  keteranganText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
});
