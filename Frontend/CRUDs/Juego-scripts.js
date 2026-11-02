const { createApp, ref } = Vue;

createApp({
    setup() {
        const token = localStorage.getItem('indiAR_token');
        const user = JSON.parse(localStorage.getItem('indiAR_user') || '{}');

        // Verificar autenticación y rol admin
        if (!token || !user.es_Admin) {
            window.location.href = '../partials/login.html';
            return {};
        }

        const getHeaders = () => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });

        const handleResponse = async (response) => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('indiAR_token');
                localStorage.removeItem('indiAR_user');
                window.location.href = '../partials/login.html';
                throw new Error('Sesión expirada o acceso denegado');
            }
            return response.json();
        };

        return {
            juegos: ref([]),
            juegoSeleccionado: ref(null),
            formCrear: ref(null),
            juegoNuevo: ref({ titulo: '', distribuidor: '', desarrollador: '', lanzamiento: '', descripcion: '', precio: '', requisitosID: '', img_principal: '' }),

            cargarEditarJuego(juego) {
                this.juegoSeleccionado.value = { ...juego };
            },
            cancelarEdicion() {
                this.juegoSeleccionado.value = null;
            },
            mostrarFormCrear() {
                this.formCrear.value = true;
            },
            ocultarFormCrear() {
                this.formCrear.value = null;
            },
            async obtenerListado() {
                try {
                    const response = await fetch('http://localhost:5000/api/juegos', {
                      credentials: "include",
                      headers: getHeaders()
                    });
                    const data = await handleResponse(response);
                    this.juegos.value = data;
                } catch (error) {
                    console.error(error);
                }
            },
            async crearJuego() {
                try {
                    const response = await fetch('http://localhost:5000/api/juegos', {
                        method: 'POST',
                        headers: getHeaders(),
                        credentials: "include",
                        credentials: "include",
                        body: JSON.stringify({
                            titulo: this.juegoNuevo.value.titulo,
                            distribuidor: this.juegoNuevo.value.distribuidor,
                            desarrollador: this.juegoNuevo.value.desarrollador,
                            lanzamiento: this.juegoNuevo.value.lanzamiento,
                            descripcion: this.juegoNuevo.value.descripcion,
                            precio: this.juegoNuevo.value.precio,
                            requisitosID: this.juegoNuevo.value.requisitosID,
                            img_principal: this.juegoNuevo.value.img_principal
                        }),
                    });
                    const data = await handleResponse(response);
                    alert(data.mensaje);
                    this.juegoNuevo.value = { titulo: '', distribuidor: '', desarrollador: '', lanzamiento: '', descripcion: '', precio: '', requisitosID: '', img_principal: '' };
                    this.formCrear.value = null;
                    this.obtenerListado();
                } catch (error) {
                    alert('Error al guardar los cambios: ' + error.message);
                }
            },
            async actualizarJuego() {
                try {
                    const response = await fetch('http://localhost:5000/api/juegos/' + this.juegoSeleccionado.value.ID, {
                        method: 'PUT',
                        headers: getHeaders(),
                        credentials: "include",
                        credentials: "include",
                        body: JSON.stringify({
                            titulo: this.juegoSeleccionado.value.titulo,
                            distribuidor: this.juegoSeleccionado.value.distribuidor,
                            desarrollador: this.juegoSeleccionado.value.desarrollador,
                            lanzamiento: this.juegoSeleccionado.value.lanzamiento,
                            descripcion: this.juegoSeleccionado.value.descripcion,
                            precio: this.juegoSeleccionado.value.precio,
                            requisitosID: this.juegoSeleccionado.value.requisitosID,
                            img_principal: this.juegoSeleccionado.value.img_principal
                        }),
                    });
                    const data = await handleResponse(response);
                    alert(data.mensaje);
                    this.juegoSeleccionado.value = null;
                    this.obtenerListado();
                } catch (error) {
                    alert('Error al guardar los cambios: ' + error.message);
                }
            },
            async eliminarJuego(juego) {
                if (confirm('¿Estás seguro de qué deseas eliminar este juego?')) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/juegos/${juego.ID}`, {
                            method: 'DELETE',
                            credentials: "include",
                            headers: getHeaders()
                        });
                        const data = await handleResponse(response);
                        alert(data.mensaje);
                        this.obtenerListado();
                    } catch (error) {
                        alert('Error al eliminar: ' + error.message);
                    }
                }
            }
        };
    }
}).mount('#main-container');