const { createApp } = Vue
        createApp({
            data() {
                return {
                    requisitos: [], requisitoSeleccionado: null, formCrear: null, requisitoNuevo: { so_min:'',procesador_min:'',ram_min:'',gpu_min:'',directx_min:'', so_rec: '', procesador_rec: '', ram_rec: '', gpu_rec: '', directx_rec: '' }
                };
            },
            mounted() {
                this.obtenerListado();
            },
            methods: {

                cargarEditarRequisito(requisito) {
                    this.requisitoSeleccionado = { ...requisito }; // Copia los datos del imagen seleccionado
                },
                cancelarEdicion() {
                    this.requisitoSeleccionado = null
                },
                mostrarFormCrear() {
                    this.formCrear = true
                },
                ocultarFormCrear() {
                    this.formCrear = null
                },
                obtenerListado() {
                    fetch('https://lucianodavezac.pythonanywhere.com/api/requisitos')
                        .then(response => response.json())
                        .then(data => {
                            this.requisitos = data; // Asigna los datos obtenidos a la propiedad requisitos
                        })
                        .catch(error => {
                            console.error(error);
                        });
                },
                crearRequisito() {
                    {
                        fetch('https://lucianodavezac.pythonanywhere.com/api/requisitos', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                so_min: this.requisitoNuevo.so_min,
                                procesador_min: this.requisitoNuevo.procesador_min,
                                ram_min: this.requisitoNuevo.ram_min,
                                gpu_min: this.requisitoNuevo.gpu_min,
                                directx_min: this.requisitoNuevo.directx_min,
                                so_rec: this.requisitoNuevo.so_rec,
                                procesador_rec: this.requisitoNuevo.procesador_rec,
                                ram_rec: this.requisitoNuevo.ram_rec,
                                gpu_rec: this.requisitoNuevo.gpu_rec,
                                directx_rec: this.requisitoNuevo.directx_rec,
                            }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                // Lógica después de guardar los cambios exitosamente
                                alert(data.mensaje);
                                this.requisitoNuevo = {  so_min: '', procesador_min: '', ram_min: '', gpu_min: '', directx_min: '', so_rec: '', procesador_rec: '', ram_rec: '', gpu_rec: '', directx_rec: '' };
                                this.formCrear = null;
                                this.obtenerListado();


                            })
                            .catch(error => {
                                // Lógica en caso de error al guardar los cambios
                                alert('Error al guardar los cambios:', error);
                            });
                    }
                },
                actualizarRequisito() {
                    fetch('https://lucianodavezac.pythonanywhere.com/api/requisitos/' + this.requisitoSeleccionado.ID, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            so_min: this.requisitoSeleccionado.so_min,
                            procesador_min: this.requisitoSeleccionado.procesador_min,
                            ram_min: this.requisitoSeleccionado.ram_min,
                            gpu_min: this.requisitoSeleccionado.gpu_min,
                            directx_min: this.requisitoSeleccionado.directx_min,
                            so_rec: this.requisitoSeleccionado.so_rec,
                            procesador_rec: this.requisitoSeleccionado.procesador_rec,
                            ram_rec: this.requisitoSeleccionado.ram_rec,
                            gpu_rec: this.requisitoSeleccionado.gpu_rec,
                            directx_rec: this.requisitoSeleccionado.directx_rec
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            // Lógica después de guardar los cambios exitosamente
                            alert(data.mensaje);
                            this.requisitoSeleccionado = null; // Reinicia el usuario seleccionado después de guardar los cambios
                            this.obtenerListado();



                        })
                        .catch(error => {
                            // Lógica en caso de error al guardar los cambios
                            alert('Error al guardar los cambios:', error);
                        });
                },
                 eliminarRequisito(requisito) {
                    if (confirm('¿Estás seguro de qué deseas eliminar este requisito')) {
                        fetch(`https://lucianodavezac.pythonanywhere.com/api/requisitos/` + requisito.ID, {
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