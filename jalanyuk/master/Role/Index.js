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
import {
  getAllRoles,
  deleteRole,
  toggleRoleStatus,
} from '../../API';
import { Ionicons } from '@expo/vector-icons';
import Tab from '../../components/Tab';
import Notifikasi from '../../components/Notifikasi';

const Index = () => {
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

  const fetchRolesWithStatus = async (status) => {
    try {
      const data = await getAllRoles(status);
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

  const fetchRoles = () => fetchRolesWithStatus(statusFilter);

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

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    Alert.alert(
      'Konfirmasi',
      `Ubah status "${item.nama_role}" menjadi ${newStatus}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          style: 'default',
          onPress: async () => {
            try {
              if (newStatus === 'Tidak Aktif') {
                await deleteRole(item.id);
              } else {
                await toggleRoleStatus(item.id, newStatus);
              }

              fetchRolesWithStatus(statusFilter);
              setNotifMessage(`Status diubah menjadi ${newStatus}`);
              setNotifType(newStatus === 'Aktif' ? 'success' : 'error');
              setNotifVisible(true);
            } catch (err) {
              console.log('Gagal ubah status:', err);
              setNotifMessage('Gagal mengubah status');
              setNotifType('error');
              setNotifVisible(true);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.value}>{item.nama_role}</Text>
          <Text
            style={[
              styles.value,
              item.status === 'Aktif' ? styles.active : styles.inactive,
            ]}
          >
            {item.status}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditRole', { role: item })}
            style={styles.iconButton}
          >
            <Ionicons name="create-outline" size={26} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleStatus(item)} style={styles.iconButton}>
            <Ionicons
              name={item.status === 'Aktif' ? 'toggle' : 'toggle-outline'}
              size={36}
              color={item.status === 'Aktif' ? '#007bff' : '#aaa'}
            />
          </TouchableOpacity>
        </View>
      </View>
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

      <View style={styles.filterRow}>
        <TextInput
          placeholder="Search Role"
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
              {['Aktif', 'Tidak Aktif'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    statusFilter === item && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setStatusFilter(item);
                    setShowDropdown(false);
                    fetchRolesWithStatus(item);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      statusFilter === item && styles.dropdownTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {roles.length === 0 ? (
        <Text style={styles.emptyText}>No data found.</Text>
      ) : (
        <FlatList
          data={roles.filter((role) =>
            (role?.nama_role ?? '').toLowerCase().includes(search.toLowerCase())
          )}
          keyExtractor={(item, index) =>
            item?.id_role ? item.id_role.toString() : `key-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
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
    backgroundColor: '#f0f4f8',
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
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  active: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactive: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
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
