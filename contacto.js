const expresiones = {
    usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, números, guion y guion-bajo.
    password: /^.{8,40}$/, // 8 a 40 digitos.     
}
 //Valida si un Nombre sigue el formato correcto.
function validateName(input){
    let nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,40}$/; // Expresión regular: Letras y espacios, pueden llevar acentos.
    if (nameRegex.test(input)===false || input.lenght > 40) {
        return false;
    }
}

//Valida si un Email sigue el formato correcto.
function validateEmail(input){
    let emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Expresión regular: Letras, números, símbolos especiales.
    if (emailRegex.test(input)===false || input.lenght > 40) {
        return false;
    }
}
//Valida si un Teléfono sigue el formato correcto.
function validatePhone(input){
    let phoneRegex = /\(?\b[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b/; //Expresión regular: Números, símbolos.
    if (!phoneRegex.test(input)) {
        return false;
    }
}
//Valida si el Formulario es correcto.
function validateForm() {
    event.preventDefault();
    let accepted = false;
    let warning = "";
    let fname, lname, email, phone, message;
    fname = document.getElementById("fname").value;
    lname = document.getElementById("lname").value;
    email = document.getElementById("email").value;
    phone = document.getElementById("phone").value;
    message = document.getElementById("message").value;
    warningParagraph = document.getElementById("warningParagraph");
    warningParagraph.innerHTML = ""; 
    //A partir de aquí se comprueba si cada campo es correcto
    if (fname === "" || lname === "" || email === "" || phone === "" || message === "") {
        warning += `Todos los campos son obligatorios <br>`;
        accepted = true;
    }
    if (validateName(fname) === false) {
        warning += `El "Nombre" ingresado no es valido <br>`; 
        accepted = true;
    }
    if (validateName(lname) === false) {
        warning += `El "Apellido" ingresado no es valido <br>`;
        accepted = true;
    }
    if (validateEmail(email) === false) {
        warning += `La "Dirección Email" ingresada no es valida <br>`;
        accepted = true;
    }
    if (validatePhone(phone) === false) {
        warning += `El "Teléfono" ingresado no es valido <br>`;
        accepted = true;
    }
    //Si accepted tiene valor true, se devuelven los errores y no se envía el formulario.
    if (accepted) { 
        warningParagraph.innerHTML = warning; //Devuelve todos los mensajes en un solo parrafo.
        return false;
    }
    //Si accepted tiene valor false, se envía el formulario.
    else {
        warningParagraph.style.color = "green";
        warningParagraph.innerHTML = "Enviado";
    }

}
