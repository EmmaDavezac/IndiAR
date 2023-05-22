const expresiones = {
    usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, numeros, guion y guion_bajo
    password: /^.{8,40}$/, // 8 a 40 digitos.     
}

function validarNombre(input){
    let nombre = /^[a-zA-ZÀ-ÿ\s]{1,40}$/; // Letras y espacios, pueden llevar acentos.
    if (nombre.test(input)===false || input.lenght > 40) {
        return false;
    }
}
function validarApellido(input){
    let apellido = /^[a-zA-ZÀ-ÿ\s]{1,40}$/; // Letras y espacios, pueden llevar acentos.
    if (apellido.test(input)===false || input.lenght > 40) {
        return false;
    }
}
function validarEmail(input){
    let correo = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Letras, números, símbolos especiales
    if (correo.test(input)===false || input.lenght > 40) {
        return false;
    }
}

function validarTelefono(input){
    if (isNaN(input)===false || input.lenght < 7 || input.lenght > 40) {
        return false;
    }
}

function validarFormulario() {
    let aceptado = false;
    let alertas = "";
    let fname, lname, email, phone, message;
    fname = document.getElementById("fname").value;
    lname = document.getElementById("lname").value;
    email = document.getElementById("email").value;
    phone = document.getElementById("phone").value;
    message = document.getElementById("message").value;
    warnings = document.getElementById("wanings");

    if (fname === "" || lname === "" || email === "" || phone === "" || message === "") {
        alertas += `Todos los campos son obligatorios`;
        aceptado = true;
    }
    else if (validarNombre(fname) === false) {
        alertas += "El 'Nombre' ingresado no es valido"; 
        aceptado = true;
    }
    else if (validarApellido(lname === false)) {
        alertas += "El 'Apellido' ingresado no es valido";
        aceptado = true;
    }
    if (aceptado) { 
        warnings. = warnings;
    }

}
