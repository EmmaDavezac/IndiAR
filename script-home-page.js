//Metodos para el carrusel
const slider = document.getElementById('slider');
let sliderSection = document.querySelectorAll(".slider-section");
let sliderSectionLast = sliderSection[sliderSection.length -1];
const btnLeft= document.querySelector("#btn-left");
const btnRight = document.querySelector("#btn-right");
slider.insertAdjacentElement('afterbegin', sliderSectionLast);

function Next(){
    let sliderSectionFirst = document.querySelectorAll(".slider-section")[0];
    slider.style.marginLeft= "-200%";
    slider.style.transition= "all 0.5s";
    setTimeout(function () {
         slider.style.transition = "none";
     slider.insertAdjacentElement('beforeend',sliderSectionFirst);
    slider.style.marginLeft= "-100%";
 },500);
}
btnRight.addEventListener('click', function()
{Next();
});

function Prev() {
    let sliderSection = document.querySelectorAll(".slider-section");
    let sliderSectionLast = sliderSection[sliderSection.length - 1];
    slider.style.marginLeft = "0";
    slider.style.transition = "all 0.5s";
    setTimeout(function () {
        slider.style.transition = "none";
        slider.insertAdjacentElement('afterbegin', sliderSectionLast);
        slider.style.marginLeft = "-100%";
    }, 500);
}
btnLeft.addEventListener('click', function () {
    Prev();
});

setInterval(function(){Next();},5000);

//Funcionalidades para el boton del menu
let btnMenu=document.getElementById('btn-menu');
let menuContainer=document.getElementById('menu-container');
btnMenu.addEventListener('click',function(){
menuContainer.classList.toggle('menu-oculto');});

//Funcionalidades para cargar todas las imagenes desde la API


function AsignarImagenAElemento(idImg,tituloDelJuego){
let apiKey="fb0a1f24f60743148908dba199441e4d";
let element=document.getElementById(idImg);
fetch("https://api.rawg.io/api/games/"+tituloDelJuego+"?key="+apiKey)
  .then(response => response.json())
  .then(data => {
console.log(data);
element.src= data.background_image;
  })
  .catch(error => {
    // Manejar errores de la solicitud
    console.log('Error:', error);
  });
}

AsignarImagenAElemento("slider-img1","Elden-Ring");
AsignarImagenAElemento("slider-img2","Assassins-Creed-Mirage");
AsignarImagenAElemento("slider-img3","Hogwarts-Legacy");
AsignarImagenAElemento("game-img1","Resident-Evil-4-2023");
AsignarImagenAElemento("game-img2","Dont-Starve-Together");
AsignarImagenAElemento("game-img3","Assassins-Creed-Mirage");
AsignarImagenAElemento("game-img4","Hogwarts-Legacy");
AsignarImagenAElemento("game-img5","Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img6","Elden-Ring");
AsignarImagenAElemento("game-img7","Sherlock-Holmes-The-Awakened-2");
AsignarImagenAElemento("game-img8","Hollow-Knight-Silksong");
AsignarImagenAElemento("game-img9","Resident-Evil-4-2023");
AsignarImagenAElemento("game-img10","Dont-Starve-Together");
AsignarImagenAElemento("game-img11","Assassins-Creed-Mirage");
AsignarImagenAElemento("game-img12","Hogwarts-Legacy");
AsignarImagenAElemento("game-img13","Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img14","Elden-Ring");
AsignarImagenAElemento("game-img15","Sherlock-Holmes-The-Awakened-2");
AsignarImagenAElemento("game-img16","Hollow-Knight-Silksong");
AsignarImagenAElemento("game-img17","Resident-Evil-4-2023");
AsignarImagenAElemento("game-img18","Dont-Starve-Together");
AsignarImagenAElemento("game-img19","Assassins-Creed-Mirage");
AsignarImagenAElemento("game-img20","Hogwarts-Legacy");
AsignarImagenAElemento("game-img21","Star-Wars-Jedi-Survivor");
AsignarImagenAElemento("game-img22","Elden-Ring");
AsignarImagenAElemento("game-img23","Sherlock-Holmes-The-Awakened-2");
AsignarImagenAElemento("game-img24","Hollow-Knight-Silksong");



