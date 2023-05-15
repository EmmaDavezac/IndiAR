let gameThumb1=document.getElementById("game-thumb-1");
let gameThumb2=document.getElementById("game-thumb-2");
let gameThumb3=document.getElementById("game-thumb-3");
let gameThumb4=document.getElementById("game-thumb-4");
let gameThumb5=document.getElementById("game-thumb-5");
let videoChange=document.getElementById("main-game-video");
let videoSrc=videoChange.src;
let imgChange=document.getElementById("main-game-img");
let activeThumb=1;
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
videoChange.src=videoSrc;
imgChange.style.display="none";
videoChange.style.display="block"
activeThumb=1;
}
gameThumb2.onclick=function(){
eliminarBordes();
gameThumb2.style.borderColor=colorBorde;

imgChange.src=gameThumb2.src;
imgChange.style.display="block";
videoChange.style.display="none"

    video=document.getElementById('main-game-video');
    video.pause();

}
gameThumb3.onclick=function(){
eliminarBordes();
gameThumb3.style.borderColor=colorBorde;
imgChange.src=gameThumb3.src;
imgChange.style.display="block";
videoChange.style.display="none"
}
gameThumb4.onclick=function(){
eliminarBordes();
gameThumb4.style.borderColor=colorBorde;

imgChange.src=gameThumb4.src;
imgChange.style.display="block";
videoChange.style.display="none"
}
gameThumb5.onclick=function(){
eliminarBordes();
gameThumb5.style.borderColor=colorBorde;
imgChange.src=gameThumb5.src;
imgChange.style.display="block";
videoChange.style.display="none"
}

eliminarBordes();
gameThumb1.style.borderColor=colorBorde;
