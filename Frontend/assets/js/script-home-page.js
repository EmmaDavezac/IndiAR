//Metodos para el carrusel
const slider = document.getElementById('slider');
let sliderSection = document.querySelectorAll(".slider-section");
let sliderSectionLast = sliderSection[sliderSection.length - 1];
const btnLeft = document.querySelector("#btn-left");
const btnRight = document.querySelector("#btn-right");
slider.insertAdjacentElement('afterbegin', sliderSectionLast);

function Next() {
  let sliderSectionFirst = document.querySelectorAll(".slider-section")[0];
  slider.style.marginLeft = "-200%";
  slider.style.transition = "all 0.5s";
  setTimeout(function () {
    slider.insertAdjacentElement('beforeend', sliderSectionFirst);
    slider.style.marginLeft = "-100%";
  }, 500);
}
btnRight.addEventListener('click', function () {
  Next();
});

function Prev() {
  let sliderSection = document.querySelectorAll(".slider-section");
  let sliderSectionLast = sliderSection[sliderSection.length - 1];
  slider.style.marginLeft = "0";
  slider.style.transition = "all 0.5s";
  setTimeout(function () {
    slider.insertAdjacentElement('afterbegin', sliderSectionLast);
    slider.style.marginLeft = "-100%";
  }, 500);
}
btnLeft.addEventListener('click', function () {
  Prev();
});

setInterval(function () { Next(); }, 5000);

function actualizarEnlacesJuego(contenedor, idJuego) {
  const enlaces = contenedor.querySelectorAll('a');
  enlaces.forEach(a => {
    a.href = './Juegos/juego.html?id=' + idJuego;
  });
}

function AsignarImagenAElemento(idImg, tituloDelJuego) {
  tituloDelJuego = tituloDelJuego.split('-').join(' ');
  let juego = document.getElementById(idImg);
  fetch('http://localhost:5000/api/juegos/titulo/' + encodeURIComponent(tituloDelJuego), {
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => {
      let gameTitle = juego.getElementsByClassName("title");
      // Título por defecto si no viene de la API
      gameTitle[0].textContent = data.titulo || 'Sin título';
      let gamePrice = juego.getElementsByClassName("game-price");
      // Precio por defecto si no viene de la API
      gamePrice[0].textContent = "$" + (data.precio || 0);
      let gameImg = juego.getElementsByClassName('game-img');
      // Usar imagen placeholder si no hay imagen en la base de datos
      gameImg[0].src = data.img_principal || './assets/img/placeholder-game.svg';
      if (data.ID) {
        actualizarEnlacesJuego(juego, data.ID);
      }
    })
    .catch(error => {
      console.log('Error:', error);
      // En caso de error, mostrar imagen placeholder y valores por defecto
      let gameImg = juego.getElementsByClassName('game-img');
      gameImg[0].src = './assets/img/placeholder-game.svg';
      let gameTitle = juego.getElementsByClassName("title");
      gameTitle[0].textContent = 'Sin título';
      let gamePrice = juego.getElementsByClassName("game-price");
      gamePrice[0].textContent = "$0";
    });
}

function AsignarImagenACarrusel(idImg, tituloDelJuego) {
  tituloDelJuego = tituloDelJuego.split('-').join(' ');
  let juego = document.getElementById(idImg);
  fetch('http://localhost:5000/api/juegos/titulo/' + encodeURIComponent(tituloDelJuego), {
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => {
      let sliderTitle = juego.getElementsByClassName("title");
      // Título por defecto si no viene de la API
      sliderTitle[0].textContent = data.titulo || 'Sin título';
      let sliderImg = juego.getElementsByClassName("slider-img");
      // Usar imagen placeholder si no hay imagen en la base de datos
      sliderImg[0].src = data.img_principal || './assets/img/placeholder-game.svg';
      if (data.ID) {
        actualizarEnlacesJuego(juego, data.ID);
      }
    })
    .catch(error => {
      console.log('Error:', error);
      // En caso de error, mostrar imagen placeholder y valores por defecto
      let sliderImg = juego.getElementsByClassName('slider-img');
      sliderImg[0].src = './assets/img/placeholder-game.svg';
      let sliderTitle = juego.getElementsByClassName("title");
      sliderTitle[0].textContent = 'Sin título';
    });
}

AsignarImagenACarrusel("slider-img1", "Elden-Ring");
AsignarImagenACarrusel("slider-img2", "Assassin's-Creed-Mirage");
AsignarImagenACarrusel("slider-img3", "Hogwarts-Legacy");
AsignarImagenAElemento("game-img1", "Resident-Evil-4-2023");
AsignarImagenAElemento("game-img2", "Don't-Starve-Together");
AsignarImagenAElemento("game-img3", "Assassin's-Creed-Mirage");
AsignarImagenAElemento("game-img4", "Hogwarts-Legacy");
AsignarImagenAElemento("game-img5", "Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img6", "Elden-Ring");
AsignarImagenAElemento("game-img7", "Sherlock-Holmes-The-Awakened");
AsignarImagenAElemento("game-img8", "Hollow-Knight-Silksong");
AsignarImagenAElemento("game-img9", "Resident-Evil-4-2023");
AsignarImagenAElemento("game-img10", "Don't-Starve-Together");
AsignarImagenAElemento("game-img11", "Assassin's-Creed-Mirage");
AsignarImagenAElemento("game-img12", "Hogwarts-Legacy");
AsignarImagenAElemento("game-img13", "Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img14", "Elden-Ring");
AsignarImagenAElemento("game-img15", "Sherlock-Holmes-The-Awakened");
AsignarImagenAElemento("game-img16", "Hollow-Knight-Silksong");
AsignarImagenAElemento("game-img17", "Resident-Evil-4-2023");
AsignarImagenAElemento("game-img18", "Don't-Starve-Together");
AsignarImagenAElemento("game-img19", "Assassin's-Creed-Mirage");
AsignarImagenAElemento("game-img20", "Hogwarts-Legacy");
AsignarImagenAElemento("game-img21", "Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img22", "Elden-Ring");
AsignarImagenAElemento("game-img23", "Sherlock-Holmes-The-Awakened");
AsignarImagenAElemento("game-img24", "Hollow-Knight-Silksong");