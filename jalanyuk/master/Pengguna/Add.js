import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllRoles, createPengguna } from '../../API';
import { Picker } from '@react-native-picker/picker';
import Notifikasi from '../../components/Notifikasi';

const AddPengguna = ({ route }) => {
  const navigation = useNavigation();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRole, setIdRole] = useState('');
  const [roles, setRoles] = useState([]);

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const user = route.params?.user;
  const createdBy = user?.nama_lengkap || 'unknown';
  const createdDate = new Date().toISOString().split('T')[0];

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      const roleArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setRoles(roleArray.filter((r) => r.status === 'Aktif'));
    } catch (error) {
      console.log('Error fetching roles:', error);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSave = async () => {
    if (!namaLengkap || !email || !password || !idRole) {
      Alert.alert('Validasi', 'Semua field wajib diisi.');
      return;
    }

    const newPengguna = {
      nama_lengkap: namaLengkap,
      email,
      password,
      id_role: parseInt(idRole),
      created_by: createdBy,
      created_date: createdDate,
    };

    try {
      await createPengguna(newPengguna);
      setNotifMessage('Data berhasil ditambahkan');
      setNotifType('success');
      setNotifVisible(true);
      setTimeout(() => {
        navigation.navigate('PenggunaIndex', { showSuccessMessage: true });
      }, 1200);
    } catch (error) {
      console.log(error);
      setNotifMessage('Gagal menambahkan pengguna');
      setNotifType('error');
      setNotifVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Notifikasi
        visible={notifVisible}
        message={notifMessage}
        type={notifType}
        onClose={() => setNotifVisible(false)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Add User</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                value={namaLengkap}
                onChangeText={setNamaLengkap}
                placeholder="Masukkan nama lengkap"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Masukkan email"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                secureTextEntry
              />

              <Text style={styles.label}>Pilih Role</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={idRole}
                  onValueChange={(itemValue) => setIdRole(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Pilih Role --" value="" />
                  {roles.map((role) => (
                    <Picker.Item
                      key={role.id}
                      label={role.nama_role}
                      value={role.id.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPengguna;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: -100,
  },
  cardHeader: {
    backgroundColor: '#007bff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
