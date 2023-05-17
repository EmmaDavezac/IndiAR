const expresiones = {
        usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
        nombre: /^[a-zA-ZÀ-ÿ\s]{1,40}$/; // Letras y espacios, pueden llevar acentos.
        password: /^.{8,40}$/, // 8 a 40 digitos.
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        telefono: /^\d{7,14}$/ // 7 a 14 numeros.
}
function validarNombre(input){
    if (input.test(nombre)===false || input.lenght > 40) {
        return false;
    }
}

function validarFormulario() {
    var fname, lname, email, phone, message;
    fname = document.getElementById("fname").value;
    lname = document.getElementById("lname").value;
    email = document.getElementById("email").value;
    phone = document.getElementById("phone").value;
    message = document.getElementById("message").value;
    if (nombre === "" || apellido === "" || correo === "" || telefono === "" || mensaje === "") {
        alert("Todos los campos son obligatorios");
        return false;
    }
    else if (validarNombre(nombre) === false) {
        alert("El Nombre ingresado no es valido");
        return false;
    }
}

