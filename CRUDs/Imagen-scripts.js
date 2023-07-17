const { createApp } = Vue
createApp({
    data() {
        return {
            imagenes: [], imagenSeleccionada: null, formCrear: null, imagenNueva: { url: '', juego_ID: '' }
        };
    },
    mounted() {
        this.obtenerListado();
    },
    methods: {
        cargarEditarImagen(imagen) {
            this.imagenSeleccionada = { ...imagen }; // Copia los datos del imagen seleccionado
        },
        cancelarEdicion() {
            this.imagenSeleccionada = null
        },
        mostrarFormCrear() {
            this.formCrear = true
        },
        ocultarFormCrear() {
            this.formCrear = null
        },
        obtenerListado() {
            fetch('https://lucianodavezac.pythonanywhere.com/api/imagenes')
                .then(response => response.json())
                .then(data => {
                    this.imagenes = data; // Asigna los datos obtenidos a la propiedad imagenes
                })
                .catch(error => {
                    console.error(error);
                });
        },
        crearImagen() {
            {
                fetch('https://lucianodavezac.pythonanywhere.com/api/imagenes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: this.imagenNueva.url,
                        juego_ID: this.imagenNueva.juego_ID
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        // Lógica después de guardar los cambios exitosamente
                        alert(data.mensaje);
                        this.imagenNueva = { url: '', juego_ID: '' };
                        this.formCrear = null;
                        this.obtenerListado();
                    })
                    .catch(error => {
                        // Lógica en caso de error al guardar los cambios
                        alert('Error al guardar los cambios:', error);
                    });
            }
        },
        actualizarImagen() {
            fetch('https://lucianodavezac.pythonanywhere.com/api/imagenes/' + this.imagenSeleccionada.ID, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: this.imagenSeleccionada.url,
                    juego_ID: this.imagenSeleccionada.juego_ID
                }),
            })
                .then(response => response.json())
                .then(data => {
                    // Lógica después de guardar los cambios exitosamente
                    alert(data.mensaje);
                    this.imagenSeleccionada = null; // Reinicia el usuario seleccionado después de guardar los cambios
                    this.obtenerListado();
                })
                .catch(error => {
                    // Lógica en caso de error al guardar los cambios
                    alert('Error al guardar los cambios:', error);
                });
        },
        eliminarImagen(imagen) {
            if (confirm('¿Estás seguro de qué deseas eliminar esta imagen?')) {
                fetch(`https://lucianodavezac.pythonanywhere.com/api/imagenes/` + imagen.ID, {
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