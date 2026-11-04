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
            usuarios: ref([]),
            usuarioSeleccionado: ref(null),
            formCrear: ref(null),
            usuarioNuevo: ref({ nombre: '', Email: '', es_Admin: false, Password: '' }),
            checkedEditar: ref(false),
            checkedCrear: ref(false),

            cargarEditarUsuario(usuario) {
                this.usuarioSeleccionado.value = { ...usuario };
                this.checkedEditar.value = (usuario.es_Admin == 1 || usuario.es_Admin === true);
            },
            cancelarEdicion() {
                this.usuarioSeleccionado.value = null;
            },
            mostrarFormCrear() {
                this.formCrear.value = true;
            },
            ocultarFormCrear() {
                this.formCrear.value = null;
            },
            async obtenerListado() {
                try {
                    const response = await fetch('http://localhost:5000/api/usuarios', {
                      credentials: "include",
                      headers: getHeaders()
                    });
                    const data = await handleResponse(response);
                    this.usuarios.value = data;
                } catch (error) {
                    console.error(error);
                }
            },
            async crearUsuario() {
                if (this.checkedCrear) { this.usuarioNuevo.value.es_Admin = 1; } else { this.usuarioNuevo.value.es_Admin = 0; }
                try {
                    const response = await fetch("http://localhost:5000/api/usuarios", {
                        method: "POST",
                        headers: getHeaders(),
                        credentials: "include",
                        body: JSON.stringify({
                            Nombre: this.usuarioNuevo.value.nombre,
                            Email: this.usuarioNuevo.value.Email,
                            Password: this.usuarioNuevo.value.Password,
                            es_Admin: this.usuarioNuevo.value.es_Admin
                        }),
                    });
                    const data = await handleResponse(response);
                    alert(data.mensaje);
                    this.usuarioNuevo.value = { nombre: '', Email: '', es_Admin: false, Password: '' };
                    this.formCrear.value = null;
                    this.checkedCrear.value = false;
                    this.obtenerListado();
                } catch (error) {
                    alert('Error al guardar los cambios: ' + error.message);
                }
            },
            async actualizarUsuario() {
                if (this.checkedEditar.value) { this.usuarioSeleccionado.value.es_Admin = 1; } else { this.usuarioSeleccionado.value.es_Admin = 0; }
                try {
                    const response = await fetch('http://localhost:5000/api/usuarios/' + this.usuarioSeleccionado.value.ID, {
                        method: 'PUT',
                        headers: getHeaders(),
                        credentials: "include",
                        body: JSON.stringify({
                            Nombre: this.usuarioSeleccionado.value.nombre,
                            Email: this.usuarioSeleccionado.value.Email,
                            Password: this.usuarioSeleccionado.value.Password,
                            es_Admin: this.usuarioSeleccionado.value.es_Admin
                        }),
                    });
                    const data = await handleResponse(response);
                    alert(data.mensaje);
                    this.usuarioSeleccionado.value = null;
                    this.obtenerListado();
                } catch (error) {
                    alert('Error al guardar los cambios: ' + error.message);
                }
            },
            async eliminarUsuario(usuario) {
                if (confirm('¿Estás seguro de qué deseas eliminar este usuario?')) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.ID}`, {
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