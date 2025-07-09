// src/API.js

import axios from 'axios';

const BASE_URL = 'http://192.168.211.187:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ====== ROLE API ======
export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};


export const getRoleById = async (id) => {
  try {
    const response = await api.get('/role', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};

export const createRole = async (role) => {
  try {
    const response = await api.post('/role', role);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (role) => {
  try {
    const response = await api.put('/role', role);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete('/role', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
};



export const getAllPenggunas = async () => {
  try {
    const response = await api.get('/penggunas');
    return response.data;
  } catch (error) {
    console.error('Error fetching penggunas:', error);
    throw error;
  }
};

export const getPenggunaById = async (id) => {
  try {
    const response = await api.get('/pengguna', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pengguna with id ${id}:`, error);
    throw error;
  }
};

export const createPengguna = async (pengguna) => {
  try {
    const response = await api.post('/pengguna', pengguna);
    return response.data;
  } catch (error) {
    console.error('Error creating pengguna:', error);
    throw error;
  }
};

export const updatePengguna = async (pengguna) => {
  try {
    const response = await api.put('/pengguna', pengguna);
    return response.data;
  } catch (error) {
    console.error('Error updating pengguna:', error);
    throw error;
  }
};

export const deletePengguna = async (id) => {
  try {
    const response = await api.delete('/pengguna', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting pengguna with id ${id}:`, error);
    throw error;
  }
};


export const getAllKota = async () => {
  try {
    const response = await api.get('/kotas');
    return response.data;
  } catch (error) {
    console.error('Error fetching kota:', error);
    throw error;
  }
};

export const getKotaById = async (id) => {
  try {
    const response = await api.get('/kota', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching kota with id ${id}:`, error);
    throw error;
  }
};

export const addKota = async (kota) => {
  try {
    const response = await api.post('/kota', kota);
    return response.data;
  } catch (error) {
    console.error('Error adding kota:', error);
    throw error;
  }
};

export const updateKota = async (id, kota) => {
  try {
    const response = await api.put('/kota', { id, ...kota });
    return response.data;
  } catch (error) {
    console.error('Error updating kota:', error);
    throw error;
  }
};

export const deleteKota = async (id) => {
  try {
    const response = await api.delete('/kota', {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting kota with id ${id}:`, error);
    throw error;
  }
};


export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPenggunas,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
  getAllKota,
  getKotaById,
  addKota,
  updateKota,
  deleteKota,
};
