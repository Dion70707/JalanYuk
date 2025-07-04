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
import { getAllKota, deleteKota } from '../../API'; // sesuaikan API-mu
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
  const [kotas, setKotas] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const navigation = useNavigation();
  const route = useRoute();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const fetchKotas = async () => {
    try {
      const data = await getAllKota();
      const kotaArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setKotas(kotaArray);
    } catch (error) {
      console.log('Error fetching kota:', error);
      setKotas([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchKotas();
    }, [route.params])
  );

  const filteredKotas = kotas.filter((kota) =>
    (kota?.nama_kota ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid ID');
      return;
    }

    Alert.alert('Delete Confirmation', 'Are you sure you want to delete this kota?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteKota(id);
            fetchKotas();
            setNotifMessage('Kota berhasil dihapus');
            setNotifType('error');
            setNotifVisible(true);
          } catch (error) {
            console.log('Error deleting kota with id', id, error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DetailKota', { kota: item })}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.nameText}>{item.nama_kota}</Text>
        <Text style={styles.emailText}>{item.provinsi}</Text>
        <Text style={styles.roleText}>Status: {item.status}</Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item.id_kota);
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
        placeholder="Search Kota"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {filteredKotas.length === 0 ? (
        <Text style={styles.emptyText}>Tidak ada data kota.</Text>
      ) : (
        <FlatList
          data={filteredKotas}
          keyExtractor={(item, index) =>
            item?.id_kota ? item.id_kota.toString() : `key-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddKota')}
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
