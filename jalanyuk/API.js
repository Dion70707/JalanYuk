// src/API.js

import axios from 'axios';


const BASE_URL = 'http://172.20.10.3:8080';


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// trs 
export async function postPemesanan(pemesananData) {
  try {
    const response = await api.post('/trspemesanan', pemesananData);
    return response.data;
  } catch (error) {
    console.error('Error creating pemesanan:', error);
    throw error;
  }
}

export async function getAllReviews() {
  try {
    const response = await api.get('/trsriviews');
    return response.data;  // asumsi backend mengembalikan array ulasan
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}
// Fungsi POST review
export async function postReview(reviewData) {
  try {
    const response = await api.post('/trsriview', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error posting review:', error);
    throw error;
  }
}
// base 
export async function getGaleriByWisataId(idWisata) {
  try {
    const res = await fetch(`${BASE_URL}/galeri/wisata/${idWisata}`);
    if (!res.ok) throw new Error('Gagal mengambil galeri');

    const data = await res.json();

    // Tambahan pengecekan agar tidak error saat .filter()
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      return [data]; // Ubah jadi array 1 elemen
    } else {
      return [];
    }
  } catch (error) {
    console.warn(`❌ Error saat fetch galeri wisata ID ${idWisata}:`, error);
    return []; // Fallback aman
  }
}


export async function getAllWisata() {
  const res = await fetch(`${BASE_URL}/wisatas`);
  if (!res.ok) throw new Error('Failed to fetch wisata');
  return res.json();
}


export async function getWisataById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/wisatas`, {
      params: { id: id }, // pastikan params ini sesuai API
    });
    return response.data;
  } catch (error) {
    console.error('API getWisataById error:', error.response?.status, error.response?.data);
    throw new Error('Failed to fetch wisata by id');
  }
}

export async function addWisata(data) {
  const res = await fetch(`${BASE_URL}/wisata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add wisata');
  return res.json();
}

export async function updateWisata(data) {
  const res = await fetch(`${BASE_URL}/wisata`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update wisata');
  return res.json();
}

export async function deleteWisata(id) {
  const res = await fetch(`${BASE_URL}/wisata?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete wisata');
  return res.json();
}

//galeri
export async function getAllGaleri() {
  const res = await fetch(`${BASE_URL}/galeris`);
  return res.json();
}

export async function getGaleriById(id) {
  const res = await fetch(`${BASE_URL}/galeri?id=${id}`);
  return res.json();
}

export const addGaleri = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/upload-galeri`, {
      method: 'POST',
      body: formData,
      // ✅ Jangan set headers Content-Type!
    });
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};


export const updateGaleri = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/galeri`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};



export async function deleteGaleri(id) {
  const res = await fetch(`${BASE_URL}/galeri?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
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
// kota
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

  
getAllGaleri,
getGaleriById,
addGaleri,
updateGaleri,
deleteGaleri,

getAllWisata,
  getWisataById,
  addWisata,
  updateWisata,
  deleteWisata,

getAllKota,
getKotaById,
addKota,
updateKota,
deleteKota,



};
