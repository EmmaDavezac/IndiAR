//Funcionalidades para el boton del menu
let btnMenu = document.getElementById("btn-menu");
let menuContainer = document.getElementById("menu-container");
btnMenu.addEventListener("click", function () {
  menuContainer.classList.toggle("menu-oculto");
});
