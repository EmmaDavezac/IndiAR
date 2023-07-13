function mostrarAlerta(tipo, titulo, mensaje) {
    var alerta = document.createElement('div');
    alerta.classList.add('alert', 'alert-' + tipo);
    alerta.innerHTML = '<strong>' + titulo + '</strong> ' + mensaje;
    var contenedor = document.getElementById('main'); // Cambia esto según el contenedor deseado para las alertas
    contenedor.appendChild(alerta);

    setTimeout(function () {
        alerta.remove();
    }, 3000); // Tiempo en milisegundos para que la alerta se muestre antes de desaparecer
}