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
import {
  getAllPenggunas,
  deletePengguna,
  getAllRoles,
  togglePenggunaStatus,
} from '../../API';
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
  const [penggunas, setPenggunas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Aktif');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const navigation = useNavigation();
  const route = useRoute();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const fetchPenggunas = async () => {
    try {
      const data = await getAllPenggunas(statusFilter);
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
    }, [statusFilter, route.params])
  );

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    Alert.alert(
      'Konfirmasi',
      `Ubah status "${item.nama_lengkap}" menjadi ${newStatus}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          style: 'default',
          onPress: async () => {
            try {
              await togglePenggunaStatus(item.id, newStatus);
              fetchPenggunas();
              setNotifMessage(`Status diubah menjadi ${newStatus}`);
              setNotifType(newStatus === 'Aktif' ? 'success' : 'error');
              setNotifVisible(true);
            } catch (error) {
              console.log('Error toggling status:', error);
              setNotifMessage('Gagal mengubah status');
              setNotifType('error');
              setNotifVisible(true);
            }
          },
        },
      ]
    );
  };

  const filteredPenggunas = penggunas.filter((pengguna) =>
    (pengguna?.nama_lengkap ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const roleName =
      roles.find((r) => r.id === item.id_role)?.nama_role || 'Role tidak ditemukan';

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('DetailPengguna', { pengguna: item, roleName })}
          activeOpacity={0.7}
        >
          <Text style={styles.nameText}>{item.nama_lengkap}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
          <Text
            style={[
              styles.statusText,
              item.status === 'Aktif' ? styles.active : styles.inactive,
            ]}
          >
            {item.status}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditPengguna', { pengguna: item })}
            style={styles.iconButton}
          >
            <Ionicons name="create-outline" size={26} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleStatus(item)} style={styles.iconButton}>
            <Ionicons
              name={item.status === 'Aktif' ? 'toggle' : 'toggle-outline'}
              size={30}
              color={item.status === 'Aktif' ? '#007bff' : '#aaa'}
            />
          </TouchableOpacity>
        </View>
      </View>
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

      <View style={styles.filterRow}>
        <TextInput
          placeholder="Search Pengguna"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDropdown((prev) => !prev)}
          >
            <Ionicons name="filter" size={24} color="#333" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownOverlay}>
              {['Aktif', 'Tidak Aktif'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    statusFilter === status && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setStatusFilter(status);
                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      statusFilter === status && styles.dropdownTextSelected,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    zIndex: 100,
    elevation: 5,
    width: 140,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#e6f0ff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
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
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  active: {
    color: '#4CAF50',
  },
  inactive: {
    color: '#F44336',
  },
  iconButton: {
    marginLeft: 12,
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
