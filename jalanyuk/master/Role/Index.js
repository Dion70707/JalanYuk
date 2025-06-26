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
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { getAllRoles, deleteRole } from '../../API';
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const navigation = useNavigation();
  const route = useRoute();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoles();

      if (route.params?.showSuccessMessage) {
        setNotifMessage('Data berhasil ditambahkan');
        setNotifType('success');
        setNotifVisible(true);
        navigation.setParams({ showSuccessMessage: false });
      }
    }, [route.params])
  );

  const filteredRoles = roles.filter((role) =>
    (role?.nama_role ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid ID');
      return;
    }

    Alert.alert('Delete Confirmation', 'Are you sure you want to delete this role?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRole(id);
            fetchRoles();
            setNotifMessage('Data berhasil dihapus');
            setNotifType('error');
            setNotifVisible(true);
          } catch (error) {
            console.log('Error deleting role with id', id, error);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.nama_role}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
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
        placeholder="Search Role"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {filteredRoles.length === 0 ? (
        <Text style={styles.emptyText}>No data found.</Text>
      ) : (
        <FlatList
          data={filteredRoles}
          keyExtractor={(item, index) =>
            item?.id_role ? item.id_role.toString() : `key-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddRole')}
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
  itemContainer: {
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
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
