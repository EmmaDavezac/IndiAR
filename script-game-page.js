//cargamos toda la info del juego desde la api
let TituloDelJuego = location.href.split('/').pop().split('.')[0].split('-').join(' ');
console.log(TituloDelJuego);

// Realizar una solicitud a la API para obtener información de un juego
window.addEventListener("load", (e) => {
  e.preventDefault();
  fetch('https://lucianodavezac.pythonanywhere.com/api/juegos/titulo/'+TituloDelJuego)
    .then((response) => response.json())
    .then((data) => {
      let juego_ID = data.ID;
      let gameTitle = document.getElementById("game-title");
      gameTitle.textContent = data.titulo;
      let gamePublisher = document.getElementById("game-publisher");
      gamePublisher.textContent = data.distribuidor;
      let gameDeveloper = document.getElementById("game-developer");
      gameDeveloper.textContent = data.desarrollador;
      let releaseDate = document.getElementById("release-date");
      releaseDate.textContent = data.lanzamiento;
      let gameDescription = document.getElementById("game-description");
      gameDescription.textContent = data.descripcion;
      let gamePrice = document.getElementById("game-price");
      gamePrice.textContent = "$" + data.precio;
      let buyCardThumb = document.getElementById("buy-card-thumb");
      buyCardThumb.src = data.img_principal;
      //cargarImagenes(juego_ID);

    })
    .catch((error) => {
      // Manejar errores de la solicitud
      console.log("Error:", error);
    });
});

// Realizar una solicitud a la API para obtener imagenes del juego


function cargarImagenes(juego_ID) {
  fetch(
    "https://lucianodavezac.pythonanywhere.com/api/imagenes/juego/" + juego_ID
  )
    .then((response) => response.json())
    .then((data) => {
      container = document.getElementById('img-thumbs-container');
      let i = 1;
      data.forEach((imagen) => {
        let thumb = document.createElement("img");
        thumb.src = imagen.url;
        thumb.id = ('img-thumb-' + i);
        thumb.classList.add("game-thumb");
        thumb.addEventListener('click', () => {
          eliminarBordes();
          thumb.style.borderColor = colorBorde;
          videoChange.style.display = "none";
          imgChange.style.display = "block";
          imgChange.src = thumb.src;
        });
        container.appendChild(thumb);
        if (i == 1) {
          eliminarBordes();
          thumb.style.borderColor = colorBorde;
          videoChange.style.display = "none";
          imgChange.style.display = "block";
          imgChange.src = thumb.src;
        }
        i = i + 1;


      });
      //imgChange.src = container.
    })
    .catch((error) => {
      // Manejar errores de la solicitud
      console.log("Error:", error);
    });
}

//Interacciones para cambiar de imagen

let gameThumb6 = document.getElementById("game-thumb-6");
let imgChange = document.getElementById("main-game-img");
let videoChange = document.getElementById("main-game-video");
let playButton = document.getElementById("movie-play-button");
let colorBorde = "#ff4e00";

function eliminarBordes() {
  let elementos = document.getElementsByClassName("game-thumb");
  for (var i = 0; i < elementos.length; i++) {
    elementos[i].style.borderColor = "white";
  }
}

/*
playButton.onclick = function () {
  eliminarBordes();
  gameThumb6.style.borderColor = colorBorde;
  imgChange.style.display = "none";
  videoChange.style.display = "block";
};
*/

//Eliminamos el resaltado de todas las imagenes y resaltamos la primera imagen

