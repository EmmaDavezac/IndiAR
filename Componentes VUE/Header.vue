<template>
    <header class="main-header">
      <div class="container-flex">
        <div class="main-header-container">
          <span class="icon-menu" id="btn-menu"
            ><i class="fas fa-bars"></i
          ></span>
          <a class="main-header-title" href="#"
            ><span class="word1">Indi</span><span class="word2">AR</span></a
          >
          <nav class="main-nav" id="main-nav">
            <ul class="nav">
              <li class="nav-item">
                <a href="#" class="nav-link nav-link-active">TIENDA</a>
              </li>
              <li class="nav-item">
                <a href="../contacto.html" class="nav-link">CONTACTO</a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="main-header-container">
          <a href="../login.html" class="main-header-btn"
            ><i class="fas fa-user icon-header"></i
          ></a>
          <a href="../Error.html" class="main-header-btn"
            ><i class="fa-solid fa-cart-shopping icon-header"></i
          ></a>
          <input
            type="search"
            class="main-header-input"
            placeholder="Buscar juegos"
            id=""
          />
          <a href="../Error.html" class="main-header-btn"
            ><i class="fas fa-search icon-search"></i
          ></a>
        </div>
      </div>
      <div id="menu-container" class="menu-oculto">
        <ul class="menu">
          <li class="menu-item">
            <a href="" class="menu-link menu-link-active">TIENDA</a>
          </li>
          <li class="menu-item">
            <a href="../contacto.html" class="menu-link">CONTACTO</a>
          </li>
        </ul>
      </div>
    </header>
</template>

<script>
export default {
  name: 'Header',
  // Lógica y datos del componente
};
</script>