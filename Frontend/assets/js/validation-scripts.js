const expresiones = {
  usuario: /^[a-zA-Z0-9_-]{4,16}$/, // Letras, números, guion y guion bajo.
  password: /^.{8,40}$/, // 8 a 40 caracteres.
};

function validateUsername(input) {
  const nameRegex = /^[a-zA-Z0-9_-]{4,16}$/;
  return nameRegex.test(input);
}

function validatePassword(input) {
  const passwordRegex = /^.{8,40}$/;
  return passwordRegex.test(input);
}

// Valida si un Nombre/Apellido sigue el formato correcto.
function validateName(input) {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,40}$/;
  return nameRegex.test(input) && input.length <= 40;
}

// Valida si un Email sigue el formato correcto.
function validateEmail(input) {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(input) && input.length <= 40;
}

// Valida si un Teléfono sigue el formato correcto.
function validatePhone(input) {
  const phoneRegex = /\(?\b[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b/;
  return phoneRegex.test(input);
}

// Valida el formulario de contacto.
function validateContactForm(e) {
  if (e) e.preventDefault(); // Recibe el evento de forma explícita

  let hasErrors = false;
  let warning = "";

  const fname = document.getElementById("fname").value.trim();
  const lname = document.getElementById("lname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();
  const warningSection = document.getElementById("warningSection");

  warningSection.innerHTML = "";
  warningSection.style.color = "red";

  // Verificación de campos vacíos
  if (!fname || !lname || !email || !phone || !message) {
    warning += `Todos los campos son obligatorios <br>`;
    hasErrors = true;
  }

  // Validaciones individuales
  if (!validateName(fname)) {
    warning += `El "Nombre" ingresado no es válido <br>`;
    hasErrors = true;
  }
  if (!validateName(lname)) {
    warning += `El "Apellido" ingresado no es válido <br>`;
    hasErrors = true;
  }
  if (!validateEmail(email)) {
    warning += `La "Dirección Email" ingresada no es válida <br>`;
    hasErrors = true;
  }
  if (!validatePhone(phone)) {
    warning += `El "Teléfono" ingresado no es válido <br>`;
    hasErrors = true;
  }

  // Mostrar resultado
  if (hasErrors) {
    warningSection.innerHTML = warning;
    return false;
  } else {
    warningSection.style.color = "green";
    warningSection.innerHTML = "Enviado con éxito";
    return true;
  }
}

// Event Listeners de Login
const UserLogin = document.getElementById("form-login-user");
if (UserLogin) {
  UserLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await response.json();

      const warningSection = document.getElementById("warningSection");
      if (warningSection) {
        warningSection.innerHTML = "";
        warningSection.style.color = "red";
      }

      // Si la petición fue exitosa y la API devolvió un token, habrá iniciado sesión.
      if (response.ok && data.token) {
        document.getElementById("password").value = "";
        if (warningSection) {
          warningSection.style.color = "green";
          warningSection.innerHTML = data.mensaje || "Inicio de sesión exitoso";
        }
        // Guardar el token y los datos del usuario
        if (data.token) {
          sessionStorage.setItem("indiar_token", data.token);
          localStorage.setItem("indiAR_token", data.token);
        }
        if (data.usuario) {
          sessionStorage.setItem("indiar_user", JSON.stringify(data.usuario));
          localStorage.setItem("indiAR_user", JSON.stringify(data.usuario));
        }
        // Redirigir según rol: administrador a admin, usuario normal a index
        if (data.usuario && data.usuario.es_Admin) {
          window.location.href = "/partials/admin.html";
        } else {
          window.location.href = "/index.html";
        }
      } else {
        if (warningSection) {
          warningSection.style.color = "red";
          warningSection.innerHTML = data.mensaje || "Credenciales inválidas";
        }
        console.warn("Login fallido:", data);
      }
    } catch (error) {
      const warningSection = document.getElementById("warningSection");
      if (warningSection) {
        warningSection.innerHTML = "No se pudo conectar con el servidor.";
        warningSection.style.color = "red";
      }
      console.error("Error en autenticación de usuario:", error);
    }
  });
}

