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

const AddPengguna = ({ route }) => {
  const navigation = useNavigation();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRole, setIdRole] = useState('');
  const [roles, setRoles] = useState([]);

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
      navigation.navigate('PenggunaIndex', { showSuccessMessage: true });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Gagal menambahkan pengguna.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tambah Pengguna</Text>
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

              <Text style={styles.label}>ID Role</Text>
              <TextInput
                style={styles.input}
                value={idRole}
                onChangeText={setIdRole}
                placeholder="Contoh: 1 =  Admin , 2 = Pengunjung"
                keyboardType="numeric"
              />

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
