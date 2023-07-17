const { createApp } = Vue
createApp({
    data() {
        return {
            juegos: [], juegoSeleccionado: null, formCrear: null, juegoNuevo: { titulo: '', distribuidor: '', desarrollador: '', lanzamiento: '', descripcion: '', precio: '', requisitosID: '', img_principal: '' }
        };
    },
    mounted() {
        this.obtenerListado();
    },
    methods: {
        cargarEditarJuego(juego) {
            this.juegoSeleccionado = { ...juego }; // Copia los datos del juego seleccionado
        },
        cancelarEdicion() {
            this.juegoSeleccionado = null
        },
        mostrarFormCrear() {
            this.formCrear = true
        },
        ocultarFormCrear() {
            this.formCrear = null
        },
        obtenerListado() {
            fetch('https://lucianodavezac.pythonanywhere.com/api/juegos')
                .then(response => response.json())
                .then(data => {
                    this.juegos = data; // Asigna los datos obtenidos a la propiedad juegos
                })
                .catch(error => {
                    console.error(error);
                });
        },
        crearJuego() {
            {
                fetch('https://lucianodavezac.pythonanywhere.com/api/juegos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo: this.juegoNuevo.titulo,
                        distribuidor: this.juegoNuevo.distribuidor,
                        desarrollador: this.juegoNuevo.desarrollador,
                        lanzamiento: this.juegoNuevo.lanzamiento,
                        descripcion: this.juegoNuevo.descripcion,
                        precio: this.juegoNuevo.precio,
                        requisitosID: this.juegoNuevo.requisitosID,
                        img_principal: this.juegoNuevo.img_principal
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        // Lógica después de guardar los cambios exitosamente
                        alert('Juego guardado', data);
                        this.juegoNuevo = { titulo: '', distribuidor: '', desarrollador: '', lanzamiento: '', descripcion: '', precio: '', requisitosID: '', img_principal: '' }; // Reinicia el usuario seleccionado después de guardar los cambios
                        this.formCrear = null;
                        this.obtenerListado();
                    })
                    .catch(error => {
                        // Lógica en caso de error al guardar los cambios
                        alert('Error al guardar los cambios:', error);
                    });
            }
        },
        actualizarJuego() {
            fetch('https://lucianodavezac.pythonanywhere.com/api/juegos/' + this.juegoSeleccionado.ID, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titulo: this.juegoSeleccionado.titulo,
                    distribuidor: this.juegoSeleccionado.distribuidor,
                    desarrollador: this.juegoSeleccionado.desarrollador,
                    lanzamiento: this.juegoSeleccionado.lanzamiento,
                    descripcion: this.juegoSeleccionado.descripcion,
                    precio: this.juegoSeleccionado.precio,
                    requisitosID: this.juegoSeleccionado.requisitosID,
                    img_principal: this.juegoSeleccionado.img_principal
                }),
            })
                .then(response => response.json())
                .then(data => {
                    // Lógica después de guardar los cambios exitosamente
                    alert('Cambio guardado', data);
                    this.juegoSeleccionado = null; // Reinicia el usuario seleccionado después de guardar los cambios
                    this.obtenerListado();
                })
                .catch(error => {
                    // Lógica en caso de error al guardar los cambios
                    alert('Error al guardar los cambios:', error);
                });
        },
        eliminarJuego(juego) {
            if (confirm('¿Estás seguro de qué deseas eliminar este juego?')) {
                fetch(`https://lucianodavezac.pythonanywhere.com/api/juegos/` + juego.ID, {
                    method: 'DELETE'
                })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.mensaje);
                        this.obtenerListado();
                    });
            }
        },
    }
}).mount('#main-container');