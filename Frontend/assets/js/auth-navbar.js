// Gestión de autenticación y navbar
(function () {
  const TOKEN_KEY = 'indiAR_token';
  const USER_KEY = 'indiAR_user';

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('indiar_token');
    sessionStorage.removeItem('indiar_user');
    window.location.href = '/index.html';
  }

  function renderNavbar() {
    const user = getUser();
    const userBtn = document.getElementById('navbar-user-btn');
    const userInfo = document.getElementById('navbar-user-info');
    const adminLinkDesktop = document.getElementById('nav-admin-desktop');
    const adminLinkMobile = document.getElementById('nav-admin-mobile');
    const logoutBtnDesktop = document.getElementById('nav-logout-desktop');
    const logoutBtnMobile = document.getElementById('nav-logout-mobile');

    if (!user) {
      // No hay sesión: mostrar botón de login
      if (userBtn) userBtn.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
      if (logoutBtnDesktop) logoutBtnDesktop.style.display = 'none';
      if (logoutBtnMobile) logoutBtnMobile.style.display = 'none';
      if (adminLinkDesktop) adminLinkDesktop.style.display = 'none';
      if (adminLinkMobile) adminLinkMobile.style.display = 'none';
      return;
    }

    // Hay sesión: mostrar información del usuario y cerrar sesión
    if (userBtn) userBtn.style.display = 'none';
    if (userInfo) {
      userInfo.style.display = 'block';
      userInfo.textContent = user.nombre || user.email || 'Usuario';
    }
    if (logoutBtnDesktop) logoutBtnDesktop.style.display = 'block';
    if (logoutBtnMobile) logoutBtnMobile.style.display = 'block';

    if (user.es_Admin) {
      if (adminLinkDesktop) adminLinkDesktop.style.display = 'block';
      if (adminLinkMobile) adminLinkMobile.style.display = 'block';
    } else {
      if (adminLinkDesktop) adminLinkDesktop.style.display = 'none';
      if (adminLinkMobile) adminLinkMobile.style.display = 'none';
    }

    // Asignar evento a botones de logout
    [logoutBtnDesktop, logoutBtnMobile].forEach((btn) => {
      if (btn) {
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById(btn.id);
        if (newBtn) newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    });
  }

  // Exponer funciones globalmente
  window.AuthNavbar = {
    getUser,
    isLoggedIn,
    logout,
    renderNavbar,
  };

  // Ejecutar al cargar
  document.addEventListener('DOMContentLoaded', renderNavbar);
})();