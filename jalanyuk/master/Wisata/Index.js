import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getAllWisata, deleteWisata } from '../../API'; 
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
  const [wisataList, setWisataList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const navigation = useNavigation();
  const route = useRoute();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const fetchWisata = async () => {
    try {
      const data = await getAllWisata();
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setWisataList(result);
    } catch (error) {
      console.log('Error fetching wisata:', error);
      setWisataList([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWisata();
    }, [route.params])
  );

  const filteredWisata = wisataList.filter((item) =>
    (item?.nama_wisata ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid ID');
      return;
    }

    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus data wisata ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWisata(id);
            fetchWisata();
            setNotifMessage('Data berhasil dihapus');
            setNotifType('error');
            setNotifVisible(true);
          } catch (error) {
            console.log('Error deleting wisata with id', id, error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetailWisata', { wisata: item })}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.nameText}>{item.nama_wisata}</Text>
        <Text style={styles.emailText}>{item.kategori}</Text>
        <Text style={styles.roleText}>{item.alamat}</Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // agar tidak trigger navigasi
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
      <Notifikasi
        visible={notifVisible}
        message={notifMessage}
        type={notifType}
        onClose={() => setNotifVisible(false)}
      />

      <TextInput
        placeholder="Cari Wisata"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {filteredWisata.length === 0 ? (
        <Text style={styles.emptyText}>Data wisata tidak ditemukan.</Text>
      ) : (
        <FlatList
          data={filteredWisata}
          keyExtractor={(item, index) => item?.id?.toString() ?? `key-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddWisata')}
      >
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>

      <Tab selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
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
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  roleText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
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