//cargamos toda la info del juego desde la api de RAWG
let apiKey="fb0a1f24f60743148908dba199441e4d";
let TituloDelJuego=window.location.pathname.split('/').pop().split('.')[0];

// Realizar una solicitud a la API para obtener información de un juego
fetch("https://api.rawg.io/api/games/"+TituloDelJuego+"?key="+apiKey)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    let gamePublisher=document.getElementById("game-publisher");
    gamePublisher.textContent= data.publishers[0].name;
    let gameDeveloper=document.getElementById("game-developer");
    gameDeveloper.textContent= data.developers[0].name;
    let releaseDate=document.getElementById("release-date");
    releaseDate.textContent=data.released;

    let gameTitle=document.getElementById("game-title");
    gameTitle.textContent=data.name;
    let gameDescription=document.getElementById("game-description");
    gameDescription.textContent=data.description_raw;
    let buyCardThumb=document.getElementById("buy-card-thumb");
    buyCardThumb.src=data.background_image;
  })
  .catch(error => {
    // Manejar errores de la solicitud
    console.log('Error:', error);
  });
// Realizar una solicitud a la API para obtener screenshots del juego
fetch("https://api.rawg.io/api/games/"+TituloDelJuego+"/screenshots?key="+apiKey)
  .then(response => response.json())
  .then(data => {
    // Manejar los datos de respuesta
    console.log("imagenes");
    console.log(data);
    gameThumb1.src=data.results[0].image;
    gameThumb2.src=data.results[1].image;
    gameThumb3.src=data.results[2].image;
    gameThumb4.src=data.results[3].image;
    gameThumb5.src=data.results[4].image;
    imgChange.src=gameThumb1.src;
  })
  .catch(error => {
    // Manejar errores de la solicitud
    console.log('Error:', error);
  });

//Interacciones para cambiar de imagen
let gameThumb1=document.getElementById("game-thumb-1");
let gameThumb2=document.getElementById("game-thumb-2");
let gameThumb3=document.getElementById("game-thumb-3");
let gameThumb4=document.getElementById("game-thumb-4");
let gameThumb5=document.getElementById("game-thumb-5");
let imgChange=document.getElementById("main-game-img");
let colorBorde="#ff4e00"

function eliminarBordes()
{
let elementos=document.getElementsByClassName("game-thumb");
    for (var i = 0; i < elementos.length; i++) {
    elementos[i].style.borderColor = 'white';
    }
}

gameThumb1.onclick=function(){
eliminarBordes();
gameThumb1.style.borderColor=colorBorde;
imgChange.src=gameThumb1.src;
}

gameThumb2.onclick=function(){
eliminarBordes();
gameThumb2.style.borderColor=colorBorde;
imgChange.src=gameThumb2.src;
}

gameThumb3.onclick=function(){
eliminarBordes();
gameThumb3.style.borderColor=colorBorde;
imgChange.src=gameThumb3.src;
}

gameThumb4.onclick=function(){
eliminarBordes();
gameThumb4.style.borderColor=colorBorde;
imgChange.src=gameThumb4.src;
}

gameThumb5.onclick=function(){
eliminarBordes();
gameThumb5.style.borderColor=colorBorde;
imgChange.src=gameThumb5.src;
}
//eliminamos el de resaltado de todas las imagenes y resaltamos la primera imagen
eliminarBordes();
gameThumb1.style.borderColor=colorBorde;



  
  




