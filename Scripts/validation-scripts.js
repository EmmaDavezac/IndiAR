const expresiones = {
  usuario: /^[a-zA-Z0-9\_\-]{4,16}$/, // Letras, números, guion y guion-bajo.
  password: /^.{8,40}$/, // 8 a 40 digitos.
};

function validateUsername(input) {
  let nameRegex = /^[a-zA-Z0-9\_\-]{4,16}$/; // Letras, números, guion y guion-bajo.
  if (nameRegex.test(input) === false) {
    return false;
  }
}

function validatePassword(input) {
  let nameRegex = (password = /^.{8,40}$/); // 8 a 40 digitos.
  if (nameRegex.test(input) === false) {
    return false;
  }
}

//Valida si un Nombre sigue el formato correcto.
function validateName(input) {
  let nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,40}$/; // Expresión regular: Letras y espacios, pueden llevar acentos.
  if (nameRegex.test(input) === false || input.lenght > 40) {
    return false;
  }
}

//Valida si un Email sigue el formato correcto.
function validateEmail(input) {
  let emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Expresión regular: Letras, números, símbolos especiales.
  if (emailRegex.test(input) === false || input.lenght > 40) {
    return false;
  }
}
//Valida si un Teléfono sigue el formato correcto.
function validatePhone(input) {
  let phoneRegex = /\(?\b[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b/; //Expresión regular: Números, símbolos.
  if (!phoneRegex.test(input)) {
    return false;
  }
}
//Valida si el Formulario es correcto.
function validateContactForm() {
  event.preventDefault();
  let accepted = false;
  let warning = "";
  let fname, lname, email, phone, message;
  fname = document.getElementById("fname").value;
  lname = document.getElementById("lname").value;
  email = document.getElementById("email").value;
  phone = document.getElementById("phone").value;
  message = document.getElementById("message").value;
  warningSection = document.getElementById("warningSection");
  warningSection.innerHTML = "";
  //A partir de aquí se comprueba si cada campo es correcto
  if (
    fname === "" ||
    lname === "" ||
    email === "" ||
    phone === "" ||
    message === ""
  ) {
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
    warningSection.innerHTML = warning; //Devuelve todos los mensajes en un solo parrafo.
    return false;
  }
  //Si accepted tiene valor false, se envía el formulario.
  else {
    warningSection.style.color = "green";
    warningSection.innerHTML = "Enviado";
  }
}

let UserLogin = document.getElementById("form-login-user");
if (UserLogin) {
  UserLogin.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const psw = document.getElementById("password").value;
    fetch("https://lucianodavezac.pythonanywhere.com/api/user-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Email": email,
        "Password": psw,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.mensaje);
        document.getElementById("password").value = "";
        if (data.mensaje == "Acceso exitoso") {
          window.location.href = "index.html";
        }
      })
  })
}

let AdminLogin = document.getElementById("form-login-admin");
if (AdminLogin) {
  AdminLogin.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const psw = document.getElementById("password").value;
    fetch("https://lucianodavezac.pythonanywhere.com/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Email": email,
        "Password": psw
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.mensaje == "Acceso exitoso") {
          alert(data.mensaje);
          window.location.href = "./CRUDs/index.html";
        }
        else { alert(data.mensaje); }
      })
  })
}