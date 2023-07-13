import mysql.connector
from mysql.connector import Error
from flask import Flask, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

#Función para crear la conexión con la DB
def create_connection():
    try:
        return mysql.connector.connect(
            host='lucianodavezac.mysql.pythonanywhere-services.com',
            database='lucianodavezac$IndiARDB',
            user='lucianodavezac',
            password='root1234',
            port='3306')

    except Error as e:
        print(f'Error al conectarse a la base de datos {e}')

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# CRUD EN DB para usuarios

#Función para obtener una lista de todos los Usuarios en la DB
def get_usuarios_en_db():
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Usuarios"
            cursor.execute(sql_query)
            usuarios = cursor.fetchall()
            cursor.close()
            connection.close()
            return usuarios
    except Error as e:
        print(f'Error al obtener lista de usuarios de la base de datos {e}')

#Función para obtener un Usuario en la DB mediante su ID
def get_usuario_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Usuarios WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            usuario = cursor.fetchone()
            cursor.close()
            connection.close()
            return usuario
    except Error as e:
        print(f'Error al obtener usuario de la base de datos {e}')

#Función para obtener un Usuario en la DB mediante su Email
def get_usuario_en_db_por_email(email):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "SELECT * FROM Usuarios WHERE Email = %s"
            cursor.execute(sql_query, (email,))
            usuario = cursor.fetchone()
            cursor.close()
            connection.close()
            return usuario
    except Error as e:
        print(f'Error al obtener usuario de la base de datos {e}')

#Función para crear un Nuevo Usuario en la DB
def crear_usuario_en_db(Nombre, Email, Password, es_Admin):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "INSERT INTO Usuarios (Nombre, Email, Password, es_Admin) VALUES (%s, %s, %s, %s)"
            values = (Nombre, Email, Password, es_Admin)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()

            return True
    except Error as e:
        print(f'Error al crear el usuario en la base de datos: {e}')

#Función para actualizar un Usuario en la DB
def actualizar_usuario_en_db(ID, Nombre, Email, Password, es_Admin):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "UPDATE Usuarios SET Nombre = %s, Email=%s, Password= %s, es_Admin=%s WHERE ID = %s"
            values = (Nombre, Email, Password, es_Admin, ID)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al actualizar el usuario en la base de datos: {e}')

#Función para borrar un Usuario en la DB mediante su ID
def delete_usuario_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "DELETE FROM Usuarios WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al eliminar usuario de la base de datos {e}')

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# CRUD EN DB para requisitos

#Función para obtener una lista de todos los Requisitos en la DB
def get_requisitos_en_db():
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Requisitos"
            cursor.execute(sql_query)
            requisitos = cursor.fetchall()
            cursor.close()
            connection.close()
            return requisitos
    except Error as e:
        print(f'Error al obtener lista de requisitos de la base de datos {e}')

#Función para obtener un Requisito en la DB en base a su ID
def get_requisito_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Requisitos WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            requisito = cursor.fetchone()
            cursor.close()
            connection.close()
            return requisito
    except Error as e:
        print(f'Error al obtener el requisito de la base de datos {e}')

#Función para crear un Nuevo Requisito en la DB
def crear_requisito_en_db(so_min, procesador_min, ram_min, GPU_min, directx_min, so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec):
    try:
        connection = create_connection()
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "INSERT INTO Requisitos (so_min, procesador_min, ram_min, GPU_min, directx_min, so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            values = (so_min, procesador_min, ram_min, GPU_min, directx_min,
                      so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al crear el requisito en la base de datos: {e}')

#Función para actualizar un Requisito en la DB
def actualizar_requisito_en_db(ID, so_min, procesador_min, ram_min, GPU_min, directx_min, so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "UPDATE Requisitos SET so_min = %s, procesador_min = %s, ram_min = %s, GPU_min = %s, directx_min = %s, so_rec = %s, procesador_rec = %s, ram_rec = %s, GPU_rec = %s, directx_rec = %s WHERE ID = %s"
            values = (so_min, procesador_min, ram_min, GPU_min, directx_min,
                      so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec, ID)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al actualizar el requisito en la base de datos: {e}')

#Función para borrar un Requisito en la DB mediante su ID
def delete_requisito_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "DELETE FROM Requisitos WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al eliminar requisito de la base de datos {e}')
        
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#        
# CRUD EN DB para imagenes

#Función para obtener una lista de todas las Imagenes en la DB
def get_imagenes_en_db():
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Imagenes"
            cursor.execute(sql_query)
            imagenes = cursor.fetchall()
            cursor.close()
            connection.close()
            return imagenes
    except Error as e:
        print(f'Error al obtener lista de imagenes de la base de datos {e}')

#Función para obtener una Imagen en la DB en base a su ID
def get_imagen_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Imagenes WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            imagen = cursor.fetchone()
            cursor.close()
            connection.close()
            return imagen
    except Error as e:
        print(f'Error al obtener imagen de la base de datos {e}')

#Función para obtener una Imagen en la DB en base al ID del Juego
def get_imagenes_en_db_por_juego(juego_ID):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT url FROM Imagenes WHERE juego_ID = %s"
            cursor.execute(sql_query, (juego_ID,))
            imagenes = cursor.fetchall()
            cursor.close()
            connection.close()
            return imagenes
    except Error as e:
        print(f'Error al obtener lista de imagenes de la base de datos {e}')

#Función para crear una Nueva Imagen en la DB        
def crear_imagen_en_db(url, juego_ID):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "INSERT INTO Imagenes (url, juego_ID) VALUES ( %s, %s)"
            values = (url, juego_ID)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al crear la imagen en la base de datos: {e}')

#Función para actualizar una Imagen en la DB
def actualizar_imagen_en_db(ID, url, juego_ID):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "UPDATE Imagenes SET url = %s, juego_ID=%s WHERE ID = %s"
            values = (url, juego_ID, ID)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al actualizar la imagen en la base de datos: {e}')

#Función para borrar una Imagen en la DB mediante su ID
def delete_imagen_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "DELETE FROM Imagenes WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al eliminar imagen de la base de datos {e}')

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# CRUD EN DB para requisitos

#Función para obtener una lista de todos los Juegos en la DB
def get_juegos_en_db():
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Juegos"
            cursor.execute(sql_query)
            juegos = cursor.fetchall()
            cursor.close()
            connection.close()
            return juegos
    except Error as e:
        print(f'Error al obtener lista de juegos de la base de datos {e}')

#Función para obtener un Juego en la DB mediante su ID
def get_juego_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Juegos WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            juegos = cursor.fetchone()
            cursor.close()
            connection.close()
            return juegos
    except Error as e:
        print(f'Error al obtener el juegos de la base de datos {e}')

#Función para obtener un Juego en la DB mediante su Titulo
def get_juego_en_db_por_titulo(titulo):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            sql_query = "SELECT * FROM Juegos WHERE titulo = %s"
            cursor.execute(sql_query, (titulo,))
            juego = cursor.fetchone()
            cursor.close()
            connection.close()
            return juego
    except Error as e:
        print(f'Error al obtener el juegos de la base de datos {e}')

#Función para crear un Nuevo Juego en la DB
def crear_juego_en_db(titulo, distribuidor, desarrollador, lanzamiento, descripcion, requisitosID, precio, img_principal):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "INSERT INTO Juegos ( titulo, distribuidor, desarrollador, lanzamiento, descripcion, requisitosID, precio, img_principal) VALUES (%s, %s, %s, %s, %s, %s, %s,%s)"
            values = (titulo, distribuidor, desarrollador,
                      lanzamiento, descripcion, requisitosID, precio, img_principal)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al crear el juego en la base de datos: {e}')

#Función para actualizar un Juego en la DB
def actualizar_juego_en_db(id, titulo, distribuidor, desarrollador, lanzamiento, descripcion, requisitosID, precio, img_principal):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "UPDATE Juegos SET titulo = %s, distribuidor = %s, desarrollador = %s, lanzamiento = %s, descripcion = %s, requisitosID = %s, precio = %s, img_principal = %s WHERE ID = %s"
            values = (titulo, distribuidor, desarrollador,
                      lanzamiento, descripcion, requisitosID, precio, img_principal, id)
            cursor.execute(sql_query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al actualizar el juego en la base de datos: {e}')
        
#Función para borrar un Juego en la DB mediante su ID
def delete_juego_en_db(id):
    try:
        connection = create_connection()
        if connection.is_connected():
            cursor = connection.cursor()
            sql_query = "DELETE FROM Juegos WHERE ID = %s"
            cursor.execute(sql_query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return True
    except Error as e:
        print(f'Error al eliminar juego de la base de datos {e}')

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# API-REST USUARIO

#Función para obtener un Usuario mediante la función get_usuario_en_db
@app.route('/api/usuarios/<int:id>', methods=['GET'])
def get_usuario(id):
    usuario = get_usuario_en_db(id)
    if usuario:
        return jsonify(usuario)
    else:
        return jsonify({'mensaje': 'No se encontro usuario'})

#Función para obtener una lista con todos Usuarios mediante la función get_usuarios_en_db
@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    usuarios = get_usuarios_en_db()
    if usuarios:
        return jsonify(usuarios)
    else:
        return jsonify({'mensaje': 'No se encontraron usuarios'})

#Función para crear un Usuario mediante la función crear_usuario_en_db
@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    nuevo_usuario = request.json
    nombre = nuevo_usuario.get('Nombre')
    email = nuevo_usuario.get('Email')
    password = nuevo_usuario.get('Password')
    es_Admin = nuevo_usuario.get('es_Admin')
    if nombre and email and password and es_Admin:
        exito = crear_usuario_en_db(nombre, email, password, es_Admin)
        if exito:
            return jsonify({'mensaje': 'Usuario creado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al crear el usuario en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de usuario incompletos'})

#Función para actualizar un Usuario mediante la función actualizar_usuario_en_db
@app.route('/api/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    nuevo_usuario = request.json
    nombre = nuevo_usuario.get('Nombre')
    email = nuevo_usuario.get('Email')
    password = nuevo_usuario.get('Password')
    es_Admin = nuevo_usuario.get('es_Admin')
    if nombre and email and password:
        exito = actualizar_usuario_en_db(id, nombre, email, password, es_Admin)
        if exito:
            return jsonify({'mensaje': 'Usuario actualizado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al actualizar el usuario en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de usuario incompletos'})

#Función para borrar un Usuario mediante la función delete_usuario_en_db
@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    exito = delete_usuario_en_db(id)
    if exito:
        return jsonify({'mensaje': 'Usuario eliminado exitosamente'})
    else:
        return jsonify({'mensaje': 'Error al eliminar usuario'})

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# API-REST REQUISITO

#Función para obtener un Requisito mediante la función get_requisito_en_db
@app.route('/api/requisitos/<int:id>', methods=['GET'])
def get_requisito(id):
    requisito = get_requisito_en_db(id)
    if requisito:
        return jsonify(requisito)
    else:
        return jsonify({'mensaje': 'No se encontro el requisito'})

#Función para obtener una lista con todos los Requisitos mediante la función get_requisitos_en_db
@app.route('/api/requisitos', methods=['GET'])
def get_requisitos():
    requisitos = get_requisitos_en_db()
    if requisitos:
        return jsonify(requisitos)
    else:
        return jsonify({'mensaje': 'No se encontraron requisitos'})

#Función para crear un Requisito mediante la función crear_requisito_en_db
@app.route('/api/requisitos', methods=['POST'])
def crear_requisito():
    nuevo_requisito = request.json
    so_min = nuevo_requisito.get('so_min')
    procesador_min = nuevo_requisito.get('procesador_min')
    ram_min = nuevo_requisito.get('ram_min')
    GPU_min = nuevo_requisito.get('GPU_min')
    directx_min = nuevo_requisito.get('directx_min')
    so_rec = nuevo_requisito.get('so_rec')
    procesador_rec = nuevo_requisito.get('procesador_rec')
    ram_rec = nuevo_requisito.get('ram_rec')
    GPU_rec = nuevo_requisito.get('GPU_rec')
    directx_rec = nuevo_requisito.get('directx_rec')
    if so_min and procesador_min and ram_min and GPU_min and directx_min and so_rec and procesador_rec and ram_rec and GPU_rec and directx_rec:
        exito = crear_requisito_en_db(so_min, procesador_min, ram_min, GPU_min,
                                      directx_min, so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec)
        if exito:
            return jsonify({'mensaje': 'Requisito creado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al crear el requisito en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de requisito incompletos'})

#Función para actualizar un Requisito mediante la función actualizar_requisito_en_db
@app.route('/api/requisitos/<int:id>', methods=['PUT'])
def actualizar_requisito(id):
    nuevo_requisito = request.json
    so_min = nuevo_requisito.get('so_min')
    procesador_min = nuevo_requisito.get('procesador_min')
    ram_min = nuevo_requisito.get('ram_min')
    GPU_min = nuevo_requisito.get('GPU_min')
    directx_min = nuevo_requisito.get('directx_min')
    so_rec = nuevo_requisito.get('so_rec')
    procesador_rec = nuevo_requisito.get('procesador_rec')
    ram_rec = nuevo_requisito.get('ram_rec')
    GPU_rec = nuevo_requisito.get('GPU_rec')
    directx_rec = nuevo_requisito.get('directx_rec')
    if so_min and procesador_min and ram_min and GPU_min and directx_min and so_rec and procesador_rec and ram_rec and GPU_rec and directx_rec:
        exito = actualizar_requisito_en_db(id, so_min, procesador_min, ram_min, GPU_min,
                                           directx_min, so_rec, procesador_rec, ram_rec, GPU_rec, directx_rec)
        if exito:
            return jsonify({'mensaje': 'Requisito actualizado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al actualizar el requisito en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de requisito incompletos'})

#Función para borrar un Requisito mediante la función delete_requisito_en_db
@app.route('/api/requisitos/<int:id>', methods=['DELETE'])
def delete_requisito(id):
    exito = delete_requisito_en_db(id)
    if exito:
        return jsonify({'mensaje': 'Requisito eliminado exitosamente'})
    else:
        return jsonify({'mensaje': 'Error al eliminar requisito'})
    
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# API-REST IMAGEN

#Función para obtener una Imagen mediante la función get_imagen_en_db
@app.route('/api/imagenes/<int:id>', methods=['GET'])
def get_imagen(id):
    imagen = get_imagen_en_db(id)
    if imagen:
        return jsonify(imagen)
    else:
        return jsonify({'mensaje': 'No se encontro imagen'})

#Función para obtener una lista con todas las Imagenes mediante la función get_imagenes_en_db
@app.route('/api/imagenes', methods=['GET'])
def get_imagenes():
    imagenes = get_imagenes_en_db()
    if imagenes:
        return jsonify(imagenes)
    else:
        return jsonify({'mensaje': 'No se encontraron imagenes'})

#Función para obtener una Imagen mediante por el ID de un Juego mediante la función get_imagenes_en_db_por_juego
@app.route('/api/imagenes/juego/<juego_ID>', methods=['GET'])
def get_imagenes_por_juego(juego_ID):
    imagenes = get_imagenes_en_db_por_juego(juego_ID)
    if imagenes:
        return jsonify(imagenes)
    else:
        return jsonify({'mensaje': 'No se encontraron imagenes'})

#Función para crear una Imagen mediante la función crear_imagen_en_db
@app.route('/api/imagenes', methods=['POST'])
def crear_imagen():
    nueva_imagen = request.json
    url = nueva_imagen.get('url')
    juego_ID = nueva_imagen.get('juego_ID')
    if url and juego_ID:
        exito = crear_imagen_en_db(url, juego_ID)
        if exito:
            return jsonify({'mensaje': 'Imagen creada exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al crear la imagen en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de la imagen incompletos'})

#Función para actualizar una Imagen mediante la función actualizar_imagen_en_db
@app.route('/api/imagenes/<int:id>', methods=['PUT'])
def actualizar_imagen(id):
    nueva_imagen = request.json
    url = nueva_imagen.get('url')
    juego_ID = nueva_imagen.get('juego_ID')
    if url and juego_ID:
        exito = actualizar_imagen_en_db(id, url, juego_ID)
        if exito:
            return jsonify({'mensaje': 'Imagen actualizada exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al actualizar la imagen en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de usuario incompletos'})

#Función para borrar una Imagen mediante la función delete_imagen_en_db
@app.route('/api/imagenes/<int:id>', methods=['DELETE'])
def delete_imagen(id):
    delete_imagen_en_db(id)
    return jsonify({'mensaje': 'Imagen eliminada exitosamente'})

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# API-REST REQUISITO

#Función para obtener un Juego mediante la función get_juego_en_db
@app.route('/api/juegos/<int:id>', methods=['GET'])
def get_juego(id):
    juego = get_juego_en_db(id)
    if juego:
        return jsonify(juego)
    else:
        return jsonify({'mensaje': 'No se encontro el juego'})

#Función para obtener una lista con todos los Juegos mediante la función get_juegos_en_db
@app.route('/api/juegos', methods=['GET'])
def get_juegos():
    juegos = get_juegos_en_db()
    if juegos:
        return jsonify(juegos)
    else:
        return jsonify({'mensaje': 'No se encontraron juegos'})

#Función para obtener un Juego por su Titulo mediante la función get_juego_en_db_por_titulo
@app.route('/api/juegos/titulo/<titulo_de_juego>', methods=['GET'])
def get_juego_por_titulo(titulo_de_juego):
    titulo_de_juego.replace('-', ' ')
    juego = get_juego_en_db_por_titulo(titulo_de_juego)
    if juego:
        return jsonify(juego)
    else:
        return jsonify({'mensaje': 'No se encuentra el juego'})

#Función para crear un Juego mediante la función crear_juego_en_db
@app.route('/api/juegos', methods=['POST'])
def crear_juego():
    nuevo_juego = request.json
    titulo = nuevo_juego.get('titulo')
    distribuidor = nuevo_juego.get('distribuidor')
    desarrollador = nuevo_juego.get('desarrollador')
    lanzamiento = nuevo_juego.get('lanzamiento')
    descripcion = nuevo_juego.get('descripcion')
    requisitosID = nuevo_juego.get('requisitosID')
    img_principal = nuevo_juego.get('img_principal')
    precio = nuevo_juego.get('precio')
    if titulo and distribuidor and desarrollador and lanzamiento and descripcion and requisitosID and precio and img_principal:
        exito = crear_juego_en_db(
            titulo, distribuidor, desarrollador, lanzamiento, descripcion, requisitosID, precio, img_principal)
        if exito:
            return jsonify({'mensaje': 'Juego creado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al crear el juego en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de juego incompletos'})

#Función para actualzar un Juego mediante la función actualizar_juego_en_db
@app.route('/api/juegos/<int:id>', methods=['PUT'])
def actualizar_juego(id):
    nuevo_juego = request.json
    titulo = nuevo_juego.get('titulo')
    distribuidor = nuevo_juego.get('distribuidor')
    desarrollador = nuevo_juego.get('desarrollador')
    lanzamiento = nuevo_juego.get('lanzamiento')
    descripcion = nuevo_juego.get('descripcion')
    requisitosID = nuevo_juego.get('requisitosID')
    img_principal = nuevo_juego.get('img_principal')
    precio = nuevo_juego.get('precio')
    if titulo and distribuidor and desarrollador and lanzamiento and descripcion and requisitosID and precio and img_principal:
        exito = actualizar_juego_en_db(
            id, titulo, distribuidor, desarrollador, lanzamiento, descripcion, requisitosID, precio, img_principal)
        if exito:
            return jsonify({'mensaje': 'Juego actualizado exitosamente'})
        else:
            return jsonify({'mensaje': 'Error al actualizar el juego en la base de datos'})
    else:
        return jsonify({'mensaje': 'Datos de juego incompletos'})

#Función para borrar un Juego mediante la función delete_juego_en_db
@app.route('/api/juegos/<int:id>', methods=['DELETE'])
def delete_juego(id):
    exito = delete_juego_en_db(id)
    if exito:
        return jsonify({'mensaje': 'Juego eliminado exitosamente'})
    else:
        return jsonify({'mensaje': 'Error al eliminar juego'})

#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------#
# API-REST AUTENTICACIÓN

#Función para iniciar la sesión de un Usuario mediante su Email y Password 
@app.route('/api/user-auth', methods=['POST'])
def login_user():
    credenciales = request.json
    email = credenciales.get('Email')
    password = credenciales.get('Password')
    if email and password:
        usuario = get_usuario_en_db_por_email(email)
        if (usuario):
            if (usuario[3] == password and usuario[4] == False):
                return jsonify({'mensaje': 'Acceso exitoso', })
            else:
                return jsonify({'mensaje': 'Contraseña incorrecta'})
        else:
            return jsonify({'mensaje': 'No existe usuario con el email ingresado'})
    else:
        return jsonify({'mensaje': 'Datos de acceso incompletos'})

#Función para iniciar la sesión de un Administrador mediante su Email y Password 
@app.route('/api/admin-auth', methods=['POST'])
def login_admin():
    credenciales = request.json
    email = credenciales.get('Email')
    password = credenciales.get('Password')
    if email and password:
        usuario = get_usuario_en_db_por_email(email)
        if (usuario):
            if (usuario[3] == password and usuario[4] == True):
                return jsonify({'mensaje': 'Acceso exitoso'})
            else:
                if (usuario[3] == password):
                    return jsonify({'mensaje': 'Contraseña o Email incorrecto'})
                else:
                    return jsonify({'mensaje': 'El Email no corresponde a un administrador'})
        else:
            return jsonify({'mensaje': 'No existe usuario con el email ingresado'})
    else:
        return jsonify({'mensaje': 'Datos de acceso incompletos'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
