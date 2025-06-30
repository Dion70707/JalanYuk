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
import { getAllPenggunas, deletePengguna, getAllRoles } from '../../API';
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
  const [penggunas, setPenggunas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const navigation = useNavigation();
  const route = useRoute();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const fetchPenggunas = async () => {
    try {
      const data = await getAllPenggunas();
      const penggunaArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setPenggunas(penggunaArray);
    } catch (error) {
      console.log('Error fetching penggunas:', error);
      setPenggunas([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      const roleArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setRoles(roleArray);
    } catch (error) {
      console.log('Error fetching roles:', error);
      setRoles([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPenggunas();
      fetchRoles();
    }, [route.params])
  );

  const filteredPenggunas = penggunas.filter((pengguna) =>
    (pengguna?.nama_lengkap ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid ID');
      return;
    }

    Alert.alert('Delete Confirmation', 'Are you sure you want to delete this pengguna?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePengguna(id);
            fetchPenggunas();
            setNotifMessage('Data berhasil dihapus');
            setNotifType('error');
            setNotifVisible(true);
          } catch (error) {
            console.log('Error deleting pengguna with id', id, error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const roleName =
      roles.find((r) => r.id === item.id_role)?.nama_role || 'Role tidak ditemukan';


    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetailPengguna', { pengguna: item, roleName })}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.nameText}>{item.nama_lengkap}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
          <Text style={styles.roleText}>{roleName}</Text>
        </View>

        

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // supaya tombol delete gak memicu navigasi card
            handleDelete(item.id);
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Notifikasi
        visible={notifVisible}
        message={notifMessage}
        type={notifType}
        onClose={() => setNotifVisible(false)}
      />

      <TextInput
        placeholder="Search Pengguna"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {filteredPenggunas.length === 0 ? (
        <Text style={styles.emptyText}>No data found.</Text>
      ) : (
        <FlatList
          data={filteredPenggunas}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : `key-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPengguna')}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
