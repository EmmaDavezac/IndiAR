
//CRUD de Usuarios

//Función para cargar la lista de usuarios desde la API
function cargarUsuarios() {
    fetch("https://lucianodavezac.pythonanywhere.com/api/usuarios")
        .then((response) => response.json())
        .then((data) => {
            tbody = document.getElementById("tbody");
            tbody.innerHTML = "";
            data.forEach((usuario) => {
                let fila = document.createElement("tr");
                fila.innerHTML =
                    "<td>" +
                    usuario[0] +
                    "</td> <td>" +
                    usuario[1] +
                    "</td> <td>" +
                    usuario[2] +
                    "</td> <td>" +
                    usuario[3] +
                    "</td> <td>" +
                    usuario[4] +
                    "</td>";
                const filaAcciones = document.createElement("td");
                fila.appendChild(filaAcciones);
                const editarBtn = document.createElement("button");
                editarBtn.innerText = "Editar";
                editarBtn.classList.add("btn");
                editarBtn.classList.add("btn-primary");
                editarBtn.classList.add("me-2");
                editarBtn.addEventListener("click", () => {
                    document.getElementById("id").value = usuario[0];
                    document.getElementById("nombre2").value = usuario[1];
                    document.getElementById("correo2").value = usuario[2];
                    document.getElementById("password2").value = usuario[3];
                    document.getElementById("admin2").value = usuario[4];
                });
                filaAcciones.appendChild(editarBtn);
                const eliminarBtn = document.createElement("button");
                eliminarBtn.innerText = "Eliminar";
                eliminarBtn.classList.add("btn");
                eliminarBtn.classList.add("btn-danger");
                eliminarBtn.addEventListener("click", () =>
                    eliminarUsuario(usuario[0])
                );
                filaAcciones.appendChild(eliminarBtn);
                tbody = document.getElementById("tbody");
                tbody.appendChild(fila);
            });
        });
}

//Función para crear un nuevo usuario
let crearUsuario = document.getElementById("crear-form-usuario");
if (crearUsuario) {
    crearUsuario.addEventListener("submit", e => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const psw = document.getElementById("password").value;
        let admin = "0";
        if (document.getElementById("admin").checked) {
            admin = "1";
        }
        fetch("https://lucianodavezac.pythonanywhere.com/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Nombre: nombre,
                Email: correo,
                Password: psw,
                es_Admin: admin,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarUsuarios();
                document.getElementById("nombre").value = "";
                document.getElementById("correo").value = "";
                document.getElementById("password").value = "";
                document.getElementById("admin").value = "";
            });
    })
}


//Función para eliminar un usuario
function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch(`https://lucianodavezac.pythonanywhere.com/api/usuarios/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarUsuarios();
            });
    }
}

//Función para editar un usuario
let editarUsuario = document.getElementById('editar-form-usuario');
if (editarUsuario) {
    editarUsuario.addEventListener("submit", e => {
        e.preventDefault();
        const nombre = document.getElementById("nombre2").value;
        const correo = document.getElementById("correo2").value;
        const psw = document.getElementById("password2").value;
        const id = document.getElementById("id").value;
        let admin = "0";
        if (document.getElementById("admin2").checked) {
            admin = "1";
        }
        fetch("https://lucianodavezac.pythonanywhere.com/api/usuarios/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Nombre: nombre,
                Email: correo,
                Password: psw,
                es_Admin: admin,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarUsuarios();
                document.getElementById("id").value = "";
                document.getElementById("nombre2").value = "";
                document.getElementById("correo2").value = "";
                document.getElementById("password2").value = "";
                document.getElementById("admin2").value = "";
            })

    })
}

//CRUD de Juegos
//Función para cargar la lista de juegos desde la API
function cargarJuegos() {
    fetch("https://lucianodavezac.pythonanywhere.com/api/juegos")
        .then((response) => response.json())
        .then((data) => {
            tbody = document.getElementById("tbody");
            tbody.innerHTML = "";
            data.forEach((juego) => {
                let fila = document.createElement("tr");
                fila.innerHTML =
                    "<td>" +
                    juego[0] +
                    "</td> <td>" +
                    juego[1] +
                    "</td> <td>" +
                    juego[2] +
                    "</td> <td>" +
                    juego[3] +
                    "</td>" +
                    "</td> <td>" +
                    juego[4] +
                    "</td> <td>" +
                    juego[5] +
                    "</td>" +
                    "<td>" +
                    juego[6] +
                    "</td> <td>" +
                    juego[7] +
                    "</td> <td>" +
                    juego[8] +
                    "</td> ";
                const filaAcciones = document.createElement("td");
                fila.appendChild(filaAcciones);
                const editarBtn = document.createElement("button");
                editarBtn.innerText = "Editar";
                editarBtn.classList.add("btn");
                editarBtn.classList.add("btn-primary");
                editarBtn.classList.add("col-md-12");
                editarBtn.classList.add("my-1");
                editarBtn.addEventListener("click", () => {
                    document.getElementById("ID").value = juego[0];
                    document.getElementById("titulo2").value = juego[1];
                    document.getElementById("distribuidor2").value = juego[2];
                    document.getElementById("desarrollador2").value = juego[3];
                    document.getElementById("lanzamiento2").value = juego[4];
                    document.getElementById("descripcion2").value = juego[5];
                    document.getElementById("precio2").value = juego[6];
                    document.getElementById("requisitosID2").value = juego[7];
                    document.getElementById("img_principal2").value = juego[8];
                });
                filaAcciones.appendChild(editarBtn);
                const eliminarBtn = document.createElement("button");
                eliminarBtn.innerText = "Eliminar";
                eliminarBtn.classList.add("btn");
                eliminarBtn.classList.add("btn-danger");
                eliminarBtn.classList.add("col-md-12");
                eliminarBtn.classList.add("my-1");
                eliminarBtn.addEventListener("click", () => eliminarjuego(juego[0]));
                filaAcciones.appendChild(eliminarBtn);
                tbody = document.getElementById("tbody");
                tbody.appendChild(fila);
            });
        });
}


// Función para crear un nuevo juego
let crearJuego = document.getElementById('crear-form-juego');
if (crearJuego) {
    crearJuego.addEventListener("submit", e => {
        e.preventDefault();
        const titulo = document.getElementById("titulo").value;
        const distribuidor = document.getElementById("distribuidor").value;
        const desarrollador = document.getElementById("desarrollador").value;
        const lanzamiento = document.getElementById("lanzamiento").value;
        const descripcion = document.getElementById("descripcion").value;
        const precio = document.getElementById("precio").value;
        const requisitosID = document.getElementById("requisitosID").value;
        const img_principal = document.getElementById("img_principal").value;
        fetch("https://lucianodavezac.pythonanywhere.com/api/juegos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: titulo,
                distribuidor: distribuidor,
                desarrollador: desarrollador,
                lanzamiento: lanzamiento,
                descripcion: descripcion,
                precio: precio,
                requisitosID: requisitosID,
                img_principal: img_principal,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarJuegos();
                document.getElementById("titulo").value = "";
                document.getElementById("distribuidor").value = "";
                document.getElementById("desarrollador").value = "";
                document.getElementById("lanzamiento").value = "";
                document.getElementById("descripcion").value = "";
                document.getElementById("precio").value = "";
                document.getElementById("requisitosID").value = "";
                document.getElementById("img_principal").value = "";
            })
    })
}

// Función para eliminar un juego
function eliminarjuego(id) {
    if (confirm("¿Estás seguro de que deseas eliminar estejuego?")) {
        fetch(`https://lucianodavezac.pythonanywhere.com/api/juegos/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarJuegos();
            });
    }
}

// Función para editar un juego
let editarJuego = document.getElementById('editar-form-juego');
if (editarJuego) {
    editarJuego.addEventListener("submit", e => {
        e.preventDefault();

        const titulo = document.getElementById("titulo2").value;
        const distribuidor = document.getElementById("distribuidor2").value;
        const desarrollador = document.getElementById("desarrollador2").value;
        const lanzamiento = document.getElementById("lanzamiento2").value;
        const descripcion = document.getElementById("descripcion2").value;
        const precio = document.getElementById("precio2").value;
        const requisitosID = document.getElementById("requisitosID2").value;
        const img_principal = document.getElementById("img_principal2").value;
        const id = document.getElementById("ID").value;
        fetch("https://lucianodavezac.pythonanywhere.com/api/juegos/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: titulo,
                distribuidor: distribuidor,
                desarrollador: desarrollador,
                lanzamiento: lanzamiento,
                descripcion: descripcion,
                precio: precio,
                requisitosID: requisitosID,
                img_principal: img_principal,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarJuegos();
                document.getElementById("ID").value = "";
                document.getElementById("titulo2").value = "";
                document.getElementById("distribuidor2").value = "";
                document.getElementById("desarrollador2").value = "";
                document.getElementById("lanzamiento2").value = "";
                document.getElementById("descripcion2").value = "";
                document.getElementById("precio2").value = "";
                document.getElementById("requisitosID2").value = "";
                document.getElementById("img_principal2").value = "";
            })
    })
}

//CRUD de Requisitos

//Función para cargar la lista de requisitos desde la API
function cargarRequisitos() {
    fetch("https://lucianodavezac.pythonanywhere.com/api/requisitos")
        .then((response) => response.json())
        .then((data) => {
            tbody = document.getElementById("tbody");
            tbody.innerHTML = "";
            data.forEach((requisito) => {
                let fila = document.createElement("tr");
                fila.innerHTML =
                    "<td>" +
                    requisito[0] +
                    "</td> <td>" +
                    requisito[1] +
                    "</td> <td>" +
                    requisito[2] +
                    "</td> <td>" +
                    requisito[3] +
                    "</td>" +
                    "</td> <td>" +
                    requisito[4] +
                    "</td> <td>" +
                    requisito[5] +
                    "</td>" +
                    "<td>" +
                    requisito[6] +
                    "</td> <td>" +
                    requisito[7] +
                    "</td> <td>" +
                    requisito[8] +
                    "</td> <td>" +
                    requisito[9] +
                    "</td>" +
                    "</td> <td>" +
                    requisito[10] +
                    "</td>";
                const filaAcciones = document.createElement("td");
                fila.appendChild(filaAcciones);
                const editarBtn = document.createElement("button");
                editarBtn.innerText = "Editar";
                editarBtn.classList.add("btn");
                editarBtn.classList.add("btn-primary");
                editarBtn.classList.add("col-md-12");
                editarBtn.classList.add("my-1");
                editarBtn.addEventListener("click", () => {
                    document.getElementById("id").value = requisito[0];
                    document.getElementById("so_min2").value = requisito[1];
                    document.getElementById("procesador_min2").value = requisito[2];
                    document.getElementById("ram_min2").value = requisito[3];
                    document.getElementById("gpu_min2").value = requisito[4];
                    document.getElementById("directx_min2").value = requisito[5];
                    document.getElementById("so_rec2").value = requisito[6];
                    document.getElementById("procesador_rec2").value = requisito[7];
                    document.getElementById("ram_rec2").value = requisito[8];
                    document.getElementById("gpu_rec2").value = requisito[9];
                    document.getElementById("directx_rec2").value = requisito[10];
                });
                filaAcciones.appendChild(editarBtn);
                const eliminarBtn = document.createElement("button");
                eliminarBtn.innerText = "Eliminar";
                eliminarBtn.classList.add("btn");
                eliminarBtn.classList.add("btn-danger");
                eliminarBtn.classList.add("col-md-12");
                eliminarBtn.classList.add("my-1");
                eliminarBtn.addEventListener("click", () =>
                    eliminarrequisito(requisito[0])
                );
                filaAcciones.appendChild(eliminarBtn);
                tbody = document.getElementById("tbody");
                tbody.appendChild(fila);
            });
        });
}

//Función para crear un nuevo requisito
let craerRequisito = document.getElementById("crear-form-requisito");
if (craerRequisito) {
    craerRequisito.addEventListener("submit", e => {
        e.preventDefault();
        const so_min = document.getElementById("so_min").value;
        const procesador_min = document.getElementById("procesador_min").value;
        const ram_min = document.getElementById("ram_min").value;
        const GPU_min = document.getElementById("gpu_min").value;
        const directx_min = document.getElementById("directx_min").value;
        const so_rec = document.getElementById("so_rec").value;
        const procesador_rec = document.getElementById("procesador_rec").value;
        const ram_rec = document.getElementById("ram_rec").value;
        const GPU_rec = document.getElementById("gpu_rec").value;
        const directx_rec = document.getElementById("directx_rec").value;
        fetch("https://lucianodavezac.pythonanywhere.com/api/requisitos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                so_min: so_min,
                procesador_min: procesador_min,
                ram_min: ram_min,
                GPU_min: GPU_min,
                directx_min: directx_min,
                so_rec: so_rec,
                procesador_rec: procesador_rec,
                ram_rec: ram_rec,
                GPU_rec: GPU_rec,
                directx_rec: directx_rec,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarRequisitos();
                document.getElementById("procesador_min").value = "";
                document.getElementById("ram_min").value = "";
                document.getElementById("gpu_min").value = "";
                document.getElementById("directx_min").value = "";
                document.getElementById("so_rec").value = "";
                document.getElementById("procesador_rec").value = "";
                document.getElementById("ram_rec").value = "";
                document.getElementById("gpu_rec").value = "";
                document.getElementById("directx_rec").value = "";
            })
    })
}

//Función para eliminar un requisito
function eliminarrequisito(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este requisito?")) {
        fetch(`https://lucianodavezac.pythonanywhere.com/api/requisitos/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data, mensaje);
                cargarRequisitos();
            });
    }
}

//Función para editar un requisito
let editarRequisito = document.getElementById('editar-form-requisito');
if (editarRequisito) {
    editarRequisito.addEventListener("submit", e => {
        e.preventDefault();
        const so_min = document.getElementById("so_min2").value;
        const procesador_min = document.getElementById("procesador_min2").value;
        const ram_min = document.getElementById("ram_min2").value;
        const GPU_min = document.getElementById("gpu_min2").value;
        const directx_min = document.getElementById("directx_min2").value;
        const so_rec = document.getElementById("so_rec2").value;
        const procesador_rec = document.getElementById("procesador_rec2").value;
        const ram_rec = document.getElementById("ram_rec2").value;
        const GPU_rec = document.getElementById("gpu_rec2").value;
        const directx_rec = document.getElementById("directx_rec2").value;
        const id = document.getElementById("id").value;
        fetch("https://lucianodavezac.pythonanywhere.com/api/requisitos/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                so_min: so_min,
                procesador_min: procesador_min,
                ram_min: ram_min,
                GPU_min: GPU_min,
                directx_min: directx_min,
                so_rec: so_rec,
                procesador_rec: procesador_rec,
                ram_rec: ram_rec,
                GPU_rec: GPU_rec,
                directx_rec: directx_rec,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.mensaje);
                cargarRequisitos();
                document.getElementById("id").value = "";
                document.getElementById("procesador_min").value = "";
                document.getElementById("ram_min").value = "";
                document.getElementById("gpu_min").value = "";
                document.getElementById("directx_min").value = "";
                document.getElementById("so_rec").value = "";
                document.getElementById("procesador_rec").value = "";
                document.getElementById("ram_rec").value = "";
                document.getElementById("gpu_rec").value = "";
                document.getElementById("directx_rec").value = "";
            })
    })
}


//CRUD de Imagenes
//Función para cargar la lista de imagenes desde la API
function cargarImagenes() {
    fetch("https://lucianodavezac.pythonanywhere.com/api/imagenes")
        .then(response => response.json())
        .then(data => {
            tbody = document.getElementById("tbody");
            tbody.innerHTML = "";
            data.forEach(imagen => {
                let fila = document.createElement('tr');
                fila.innerHTML = '<td>' + imagen[0] + '</td> <td>' + imagen[1] + '</td> <td>' + imagen[2] + '</td> <td>';
                const filaAcciones = document.createElement('td');
                fila.appendChild(filaAcciones);
                const editarBtn = document.createElement('button');
                editarBtn.innerText = 'Editar';
                editarBtn.classList.add("btn");
                editarBtn.classList.add("btn-primary");
                editarBtn.classList.add("me-2");
                editarBtn.addEventListener('click', () => { document.getElementById('id').value = imagen[0]; document.getElementById('url2').value = imagen[1]; document.getElementById('juego2').value = imagen[2]; });
                filaAcciones.appendChild(editarBtn);
                const eliminarBtn = document.createElement('button');
                eliminarBtn.innerText = 'Eliminar';
                eliminarBtn.classList.add("btn");
                eliminarBtn.classList.add("btn-danger");
                eliminarBtn.addEventListener('click', () => eliminarImagen(imagen[0]));
                filaAcciones.appendChild(eliminarBtn);
                tbody = document.getElementById("tbody");
                tbody.appendChild(fila);
            });
        });
}

//Función para crear una nueva imagen
let crearImagen = document.getElementById('crear-form-imagen');
if (crearImagen) {
    crearImagen.addEventListener("submit", e => {
        e.preventDefault();
        const url = document.getElementById('url').value;
        const juego = document.getElementById('juego').value;
        fetch("https://lucianodavezac.pythonanywhere.com/api/imagenes", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "url": url,
                "juego_ID": juego
            })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.mensaje);
                cargarImagenes();
                document.getElementById('url').value = '';
                document.getElementById('juego').value = '';
            })
    })
}

//Función para eliminar una imagen
function eliminarImagen(id) {
    if (confirm('¿Estás seguro de qué deseas eliminar esta imagen?')) {
        fetch(`https://lucianodavezac.pythonanywhere.com/api/imagenes/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                alert(data.mensaje);
                cargarImagenes();
            });
    }
}

//Función para editar una imagen
let editarImagen = document.getElementById('editar-form-usuario');
if (editarUsuario) {
    editarUsuario.addEventListener("submit", e => {
        e.preventDefault();
        const url = document.getElementById('url2').value;
        const juego = document.getElementById('juego2').value;
        const id = document.getElementById('id').value;
        fetch('https://lucianodavezac.pythonanywhere.com/api/imagenes/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "url": url, "juego_ID": juego })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.mensaje);
                cargarImagenes();
                document.getElementById('id').value = '';
                document.getElementById('url2').value = '';
                document.getElementById('juego2').value = '';
            })
    })
}