(function() {
  const { createApp } = window.Vue;
  const { createRouter, createWebHistory } = window.VueRouter;

  const API_BASE = 'http://localhost:5000/api';

  async function request(endpoint, options = {}) {
    const token = localStorage.getItem('indiAR_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch(API_BASE + endpoint, { ...options, headers, credentials: 'include' });
    return response;
  }