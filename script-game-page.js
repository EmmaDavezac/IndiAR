//cargamos toda la info del juego desde la api
let TituloDelJuego = window.location.pathname
  .split("/")
  .pop()
  .split(".")[0]
  .split("-")
  .join(" ");

// Realizar una solicitud a la API para obtener información de un juego
window.addEventListener("load", (e) => {
  fetch(
    "https://lucianodavezac.pythonanywhere.com/api/juegos/" + TituloDelJuego
  )
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
      cargarImagenes(juego_ID);
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
      // Manejar los datos de respuesta
      gameThumb1.src = data[0].url;
      gameThumb2.src = data[1].url;
      gameThumb3.src = data[2].url;
      gameThumb4.src = data[3].url;
      gameThumb5.src = data[4].url;
      imgChange.src = gameThumb1.src;
    })
    .catch((error) => {
      // Manejar errores de la solicitud
      console.log("Error:", error);
    });
}

//Interacciones para cambiar de imagen
let gameThumb1 = document.getElementById("game-thumb-1");
let gameThumb2 = document.getElementById("game-thumb-2");
let gameThumb3 = document.getElementById("game-thumb-3");
let gameThumb4 = document.getElementById("game-thumb-4");
let gameThumb5 = document.getElementById("game-thumb-5");
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

gameThumb1.onclick = function () {
  eliminarBordes();
  gameThumb1.style.borderColor = colorBorde;
  videoChange.style.display = "none";
  imgChange.style.display = "block";
  imgChange.src = gameThumb1.src;
};

gameThumb2.onclick = function () {
  eliminarBordes();
  gameThumb2.style.borderColor = colorBorde;
  videoChange.style.display = "none";
  imgChange.style.display = "block";
  imgChange.src = gameThumb2.src;
};

gameThumb3.onclick = function () {
  eliminarBordes();
  gameThumb3.style.borderColor = colorBorde;
  videoChange.style.display = "none";
  imgChange.style.display = "block";
  imgChange.src = gameThumb3.src;
};

gameThumb4.onclick = function () {
  eliminarBordes();
  gameThumb4.style.borderColor = colorBorde;
  videoChange.style.display = "none";
  imgChange.style.display = "block";
  imgChange.src = gameThumb4.src;
};

gameThumb5.onclick = function () {
  eliminarBordes();
  gameThumb5.style.borderColor = colorBorde;
  videoChange.style.display = "none";
  imgChange.style.display = "block";
  imgChange.src = gameThumb5.src;
};

gameThumb6.onclick = function () {
  eliminarBordes();
  gameThumb6.style.borderColor = colorBorde;
  imgChange.style.display = "none";
  videoChange.style.display = "block";
};

playButton.onclick = function () {
  eliminarBordes();
  gameThumb6.style.borderColor = colorBorde;
  imgChange.style.display = "none";
  videoChange.style.display = "block";
};

//Eliminamos el resaltado de todas las imagenes y resaltamos la primera imagen
eliminarBordes();
gameThumb1.style.borderColor = colorBorde;
