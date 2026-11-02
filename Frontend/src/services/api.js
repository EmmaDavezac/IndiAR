const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('indiAR_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = 'Bearer ' + token;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}

async function login(email, password) {
  const response = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return { response, data };
}

async function register(nombre, email, password) {
  const response = await request('/registrar', {
    method: 'POST',
    body: JSON.stringify({ Nombre: nombre, Email: email, Password: password }),
  });
  const data = await response.json();
  return { response, data };
}

async function getJuegos() {
  const response = await request('/juegos');
  return response.json();
}

async function saveJuego(payload, id = null) {
  const response = await request(id ? `/juegos/${id}` : '/juegos', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
  return { response, data: await response.json() };
}

async function uploadJuegoImagen(id, file) {
  const token = localStorage.getItem('indiAR_token');
  const formData = new FormData();
  formData.append('imagen', file);
  const response = await fetch(`${API_BASE}/juegos/${id}/imagenes`, {
    method: 'POST',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    body: formData,
  });
  const data = await response.json();
  return { response, data };
}

async function setJuegoEstado(id, activo) {
  const response = await request(`/juegos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
  return { response, data: await response.json() };
}

async function getJuegoImagenes(id) {
  const response = await request(`/juegos/${id}/imagenes`);
  return { response, data: await response.json() };
}

async function getCategorias() {
  const response = await request('/categorias');
  return response.json();
}

async function getColecciones() {
  const response = await request('/colecciones');
  return response.json();
}

async function saveTaxonomy(endpoint, payload, id = null) {
  const response = await request(id ? `${endpoint}/${id}` : endpoint, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
  return { response, data: await response.json() };
}

async function deleteResource(endpoint, id) {
  const response = await request(`${endpoint}/${id}`, { method: 'DELETE' });
  return { response, data: await response.json() };
}

async function getLandingConfig() {
  const response = await request('/landing-config');
  return response.ok ? response.json() : null;
}

async function saveLandingConfig(config) {
  const response = await request('/landing-config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
  return { response, data: await response.json() };
}

export { request, login, register, getJuegos, saveJuego, uploadJuegoImagen, getJuegoImagenes, setJuegoEstado, getCategorias, getColecciones, saveTaxonomy, deleteResource, getLandingConfig, saveLandingConfig, API_BASE };
