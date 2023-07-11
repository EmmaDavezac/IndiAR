const { createApp } = Vue
            createApp({
                data() {
                    return {
                        usuarios: [], usuarioSeleccionado: null, formCrear: null, usuarioNuevo: { nombre:'',Email:'',es_Admin:false, Password:'' }, checkedEditar:false, checkedCrear:false
                    };
                },
                mounted() {
                    this.obtenerListado();
                },
                methods: {
                   

                    cargarEditarUsuario(usuario) {
                        this.usuarioSeleccionado = {...usuario}; // Copia los datos del usuario seleccionado
                        if (this.usuarioSeleccionado.es_Admin==1)
                       { this.checkedEditar=true} else  this.checkedEditar = false;
                    },
                    cancelarEdicion() {
                        this.usuarioSeleccionado = null;
                    },
                    mostrarFormCrear() {
                        this.formCrear = true;
                    },
                    ocultarFormCrear() {
                        this.formCrear = null;
                    },
                    obtenerListado() {
                        fetch('https://lucianodavezac.pythonanywhere.com/api/usuarios')
                            .then(response => response.json())
                            .then(data => {
                                this.usuarios = data; // Asigna los datos obtenidos a la propiedad usuarios
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    },
                    crearUsuario() {
                        {   if(this.checkedCrear){this.usuarioNuevo.es_Admin=1;}else {this.usuarioNuevo.es_Admin=0;}
                            fetch("https://lucianodavezac.pythonanywhere.com/api/usuarios", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    Nombre: this.usuarioNuevo.nombre,
                                    Email: this.usuarioNuevo.Email,
                                    Password: this.usuarioNuevo.Password,
                                    es_Admin:this.usuarioNuevo.es_Admin
                                }),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    // Lógica después de guardar los cambios exitosamente
                                    alert(data.mensaje);
                
                                    this.usuarioNuevo = {  nombre: '', Email: '', es_Admin: false, Password: '' }; // Reinicia el usuario seleccionado después de guardar los cambios
                                    this.formCrear = null;
                                    this.checkedCrear=false;
                                    this.obtenerListado();
                                })
                                .catch(error => {
                                    // Lógica en caso de error al guardar los cambios
                                    alert('Error al guardar los cambios:', error);
                                });
                        }
                    },
                    actualizarUsuario() {
                       if (this.checkedEditar) { this.usuarioSeleccionado.es_Admin = '1'; } else { this.usuarioSeleccionado.es_Admin = '0'; }

                        fetch('https://lucianodavezac.pythonanywhere.com/api/usuarios/' + this.usuarioSeleccionado.ID, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                Nombre: this.usuarioSeleccionado.nombre,
                                Email: this.usuarioSeleccionado.Email,
                                Password: this.usuarioSeleccionado.Password,
                                es_Admin:this.usuarioSeleccionado.es_Admin

                            }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                // Lógica después de guardar los cambios exitosamente
                                alert(data.mensaje);
                                this.usuarioSeleccionado = null; // Reinicia el usuario seleccionado después de guardar los cambios
                                this.obtenerListado();
                            })
                            .catch(error => {
                                // Lógica en caso de error al guardar los cambios
                                alert('Error al guardar los cambios:', error);
                            });
                    },
                     eliminarUsuario(usuario) {
                        if (confirm('¿Estás seguro de qué deseas eliminar este usuario?')) {
                            fetch(`https://lucianodavezac.pythonanywhere.com/api/usuarios/` + usuario.ID, {
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