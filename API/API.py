import os
import json
import hashlib
import hmac
import uuid
import secrets
import string
import smtplib
from email.message import EmailMessage
from io import BytesIO
from PIL import Image
from datetime import date, datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from functools import wraps

import sqlalchemy as sa
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from flask_restx import Api, Resource, fields, marshal
from flask_sqlalchemy import SQLAlchemy
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from sqlalchemy.engine import URL
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import BadRequest

# ---------------------------------------------------------------------------
# App, base de datos y Swagger
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app,
     origins=["http://localhost:8080", "http://127.0.0.1:8080"],
     supports_credentials=True)


def build_database_uri():
    """DATABASE_URL tiene prioridad (útil para tests); si no, se arma desde MYSQL_*."""
    if os.getenv('DATABASE_URL'):
        return os.getenv('DATABASE_URL')
    return URL.create(
        'mysql+mysqlconnector',
        username=os.getenv('MYSQL_USER', 'user'),
        password=os.getenv('MYSQL_PASSWORD', 'password'),
        host=os.getenv('MYSQL_HOST', 'db'),
        port=int(os.getenv('MYSQL_PORT', '3306')),
        database=os.getenv('MYSQL_DB', 'indiar'),
    )


app.config['SQLALCHEMY_DATABASE_URI'] = build_database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True, 'pool_recycle': 280}
app.config['MAX_CONTENT_LENGTH'] = 15 * 1024 * 1024
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/app/uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
db = SQLAlchemy(app)

@app.route('/uploads/<path:filename>')
def uploaded_game_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

SECRET_KEY = os.getenv('SECRET_KEY', 'indiAR-secret-key-change-in-production')
serializer = URLSafeTimedSerializer(SECRET_KEY)

DESCRIPCION_API = """
API REST de la plataforma de videojuegos **IndiAR**.

### Autenticación
1. Registrate con `POST /api/registrar` o iniciá sesión con `POST /api/login`.
2. Copiá el `token` de la respuesta.
3. Presioná **Authorize** (arriba a la derecha) e ingresá: `Bearer <token>`.

Los tokens vencen a los **7 días**.

### Permisos
| Recurso | Lectura | Escritura |
|---|---|---|
| Juegos | Pública | Solo administradores |
| Requisitos | Pública | — |
| Usuarios | Solo administradores | Solo administradores |

### Errores
Todas las respuestas de error usan el campo `mensaje`.
Los errores de validación (400) incluyen además `errores` con el detalle por campo.
"""

api = Api(
    app,
    version='1.0',
    title='IndiAR API',
    description=DESCRIPCION_API,
    doc='/swagger',
    prefix='/api',
    contact='IndiAR',
    authorizations={
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Formato: **Bearer &lt;token&gt;**',
        }
    },
)

ns_auth = api.namespace('Autenticación', description='Registro e inicio de sesión', path='/')
ns_usuarios = api.namespace('Usuarios', description='Gestión de usuarios (solo administradores)', path='/')
ns_juegos = api.namespace('Juegos', description='Catálogo de juegos', path='/')
ns_requisitos = api.namespace('Requisitos', description='Requisitos técnicos de los juegos', path='/')
ns_categorias = api.namespace('Categorías', description='Categorías del catálogo', path='/')
ns_colecciones = api.namespace('Colecciones', description='Colecciones del catálogo', path='/')
ns_landing = api.namespace('Landing', description='Configuración pública de la portada', path='/')


# ---------------------------------------------------------------------------
# Modelos SQLAlchemy
# ---------------------------------------------------------------------------
class Usuario(db.Model):
    __tablename__ = 'Usuarios'
    id = db.Column('ID', db.Integer, primary_key=True)
    nombre = db.Column('Nombre', db.String(100), nullable=False)
    email = db.Column('Email', db.String(255), unique=True, nullable=False)
    password = db.Column('Password', db.String(255), nullable=False)
    es_admin = db.Column('es_Admin', db.Boolean, nullable=False, default=False)
    activo = db.Column('activo', db.Boolean, nullable=False, default=True)


class Categoria(db.Model):
    __tablename__ = 'Categorias'
    id = db.Column('ID', db.Integer, primary_key=True)
    nombre = db.Column('Nombre', db.String(100), unique=True, nullable=False)


class Coleccion(db.Model):
    __tablename__ = 'Colecciones'
    id = db.Column('ID', db.Integer, primary_key=True)
    nombre = db.Column('Nombre', db.String(100), unique=True, nullable=False)


class LandingConfig(db.Model):
    __tablename__ = 'LandingConfig'
    id = db.Column('ID', db.Integer, primary_key=True)
    config = db.Column('Config', db.Text, nullable=False)


juego_categorias = db.Table(
    'Juego_Categorias',
    db.Column('juego_id', db.Integer, db.ForeignKey('Juegos.ID'), primary_key=True),
    db.Column('categoria_id', db.Integer, db.ForeignKey('Categorias.ID'), primary_key=True),
)

juego_colecciones = db.Table(
    'Juego_Colecciones',
    db.Column('juego_id', db.Integer, db.ForeignKey('Juegos.ID'), primary_key=True),
    db.Column('coleccion_id', db.Integer, db.ForeignKey('Colecciones.ID'), primary_key=True),
)


class Juego(db.Model):
    __tablename__ = 'Juegos'
    id = db.Column('ID', db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    distribuidor = db.Column(db.String(255), nullable=False)
    desarrollador = db.Column(db.String(255), nullable=False)
    lanzamiento = db.Column(db.Date, nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    requisitos_id = db.Column('requisitosID', db.Integer, nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    oferta_tipo = db.Column(db.String(20), nullable=True)
    oferta_valor = db.Column(db.Numeric(10, 2), nullable=True)
    oferta_desde = db.Column(db.Date, nullable=True)
    oferta_hasta = db.Column(db.Date, nullable=True)
    img_principal = db.Column(db.String(500), nullable=False)
    activo = db.Column(db.Boolean, nullable=False, default=True)
    plataformas = db.Column(db.JSON, nullable=False, default=list)
    idiomas = db.Column(db.JSON, nullable=False, default=list)
    fecha_subida = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    categorias = db.relationship('Categoria', secondary=juego_categorias, backref='juegos', lazy='joined')
    colecciones = db.relationship('Coleccion', secondary=juego_colecciones, backref='juegos', lazy='joined')
    imagenes = db.relationship('JuegoImagen', back_populates='juego', cascade='all, delete-orphan', lazy='select')

    @property
    def oferta_activa(self):
        hoy = date.today()
        return bool(
            self.oferta_tipo in ('precio', 'porcentaje')
            and self.oferta_valor is not None
            and self.oferta_desde is not None
            and self.oferta_hasta is not None
            and self.oferta_desde <= hoy <= self.oferta_hasta
        )

    @property
    def precio_final(self):
        if not self.oferta_activa:
            return self.precio
        valor_oferta = Decimal(self.oferta_valor)
        if self.oferta_tipo == 'precio':
            return valor_oferta.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if self.oferta_tipo == 'porcentaje':
            return (Decimal(self.precio) * (Decimal('100') - valor_oferta) / Decimal('100')).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
        return self.precio


class JuegoImagen(db.Model):
    __tablename__ = 'JuegoImagenes'
    id = db.Column('ID', db.Integer, primary_key=True, autoincrement=True)
    juego_id = db.Column('juegoID', db.Integer, db.ForeignKey('Juegos.ID'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    juego = db.relationship('Juego', back_populates='imagenes')


class Requisito(db.Model):
    __tablename__ = 'Requisitos'
    id = db.Column('ID', db.Integer, primary_key=True, autoincrement=True)
    procesador_min = db.Column(db.String(255), nullable=True)
    ram_min = db.Column(db.String(255), nullable=True)
    gpu_min = db.Column(db.String(255), nullable=True)
    almacenamiento_min = db.Column(db.String(255), nullable=True)
    sistema_min = db.Column(db.String(255), nullable=True)
    procesador_rec = db.Column(db.String(255), nullable=True)
    ram_rec = db.Column(db.String(255), nullable=True)
    gpu_rec = db.Column(db.String(255), nullable=True)
    almacenamiento_rec = db.Column(db.String(255), nullable=True)
    sistema_rec = db.Column(db.String(255), nullable=True)


with app.app_context():
    db.create_all()
    columnas_juegos = {columna['name'] for columna in db.inspect(db.engine).get_columns('Juegos')}
    columnas_oferta = {
        'oferta_tipo': 'VARCHAR(20) NULL',
        'oferta_valor': 'DECIMAL(10, 2) NULL',
        'oferta_desde': 'DATE NULL',
        'oferta_hasta': 'DATE NULL',
    }
    for nombre, definicion in columnas_oferta.items():
        if nombre not in columnas_juegos:
            db.session.execute(sa.text(f'ALTER TABLE Juegos ADD COLUMN {nombre} {definicion}'))
    if any(nombre not in columnas_juegos for nombre in columnas_oferta):
        db.session.commit()

    if 'activo' not in columnas_juegos:
        db.session.execute(sa.text('ALTER TABLE Juegos ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE'))
        db.session.commit()
        columnas_juegos.add('activo')
    if 'plataformas' not in columnas_juegos:
        db.session.execute(sa.text("ALTER TABLE Juegos ADD COLUMN plataformas JSON NULL"))
        db.session.execute(sa.text("UPDATE Juegos SET plataformas = JSON_ARRAY() WHERE plataformas IS NULL"))
        db.session.execute(sa.text("ALTER TABLE Juegos MODIFY COLUMN plataformas JSON NOT NULL"))
        db.session.commit()
    if 'idiomas' not in columnas_juegos:
        db.session.execute(sa.text("ALTER TABLE Juegos ADD COLUMN idiomas JSON NULL"))
        db.session.execute(sa.text("UPDATE Juegos SET idiomas = JSON_ARRAY() WHERE idiomas IS NULL"))
        db.session.execute(sa.text("ALTER TABLE Juegos MODIFY COLUMN idiomas JSON NOT NULL"))
        db.session.commit()
    if 'fecha_subida' not in columnas_juegos:
        db.session.execute(sa.text("ALTER TABLE Juegos ADD COLUMN fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))
        db.session.commit()
    columnas_usuarios = {columna['name'] for columna in db.inspect(db.engine).get_columns('Usuarios')}
    if 'activo' not in columnas_usuarios:
        db.session.execute(sa.text('ALTER TABLE Usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE'))
        db.session.commit()
    if Usuario.query.filter_by(email='test@test.com').first() is None:
        db.session.add(Usuario(
            nombre='TestUser',
            email='test@test.com',
            password='fijo1234567890abcd:95770a7ab33c6dc81c1a9d9a9bc717fd1dac9f3129d637cc85b1bdc3b2c65942',
            es_admin=False,
            activo=True,
        ))
        db.session.commit()


_requisitos_table = None


def get_requisitos_table():
    """La tabla Requisitos se refleja desde la base de datos (columnas desconocidas)."""
    global _requisitos_table
    if _requisitos_table is None:
        _requisitos_table = sa.Table('Requisitos', db.metadata,
                                     autoload_with=db.engine, extend_existing=True)
    return _requisitos_table


def get_requisitos_id_column(tabla):
    return next(col for col in tabla.c if col.name.lower() == 'id')


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def hash_password(password):
    # Salt fijo para que el hash sea determinista en cualquier despliegue
    salt = "fijo1234567890abcd"
    hashed = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{hashed.hex()}"



def verify_password(stored_password, provided_password):
    try:
        salt, stored_hash = stored_password.split(':', 1)
    except (ValueError, AttributeError):
        return False
    incoming = hashlib.pbkdf2_hmac(
        'sha256', provided_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return hmac.compare_digest(stored_hash, incoming)


def guardar():
    """Confirma la transacción. Devuelve False (y hace rollback) si falla."""
    try:
        db.session.commit()
        return True
    except SQLAlchemyError as e:
        db.session.rollback()
        app.logger.error('Error de base de datos: %s', e)
        return False


def jsonable(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def get_token_from_request():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:]
    return None


def verify_token(token, max_age=3600 * 24 * 7):
    try:
        return serializer.loads(token, max_age=max_age)
    except (SignatureExpired, BadSignature):
        return None


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return {'mensaje': 'Token de autenticación requerido'}, 401
        user_data = verify_token(token)
        if not user_data:
            return {'mensaje': 'Token inválido o expirado'}, 401
        if not user_data.get('es_Admin'):
            return {'mensaje': 'Acceso denegado: se requiere rol de administrador'}, 403
        request.current_user = user_data
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Modelos Swagger
# ---------------------------------------------------------------------------
EMAIL_PATTERN = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'

mensaje_model = api.model('Mensaje', {
    'mensaje': fields.String(description='Descripción del resultado', example='Operación exitosa'),
})

error_model = api.model('Error', {
    'mensaje': fields.String(description='Descripción del error', example='Datos inválidos'),
    'errores': fields.Raw(description='Detalle por campo (solo errores de validación)',
                          example={'titulo': "'titulo' is a required property"}),
})

# --- Autenticación
login_in = api.model('LoginEntrada', {
    'email': fields.String(required=True, min_length=1, example='ana@mail.com'),
    'password': fields.String(required=True, min_length=1, example='miClave123'),
})

login_usuario_out = api.model('LoginUsuario', {
    'id': fields.Integer(example=1),
    'nombre': fields.String(example='Ana'),
    'email': fields.String(example='ana@mail.com'),
    'es_Admin': fields.Boolean(example=False),
    'activo': fields.Boolean(example=True),
})

login_out = api.model('LoginSalida', {
    'mensaje': fields.String(example='Login exitoso'),
    'token': fields.String(description='Enviar como `Authorization: Bearer <token>`'),
    'usuario': fields.Nested(login_usuario_out),
})

registro_in = api.model('RegistroEntrada', {
    'Nombre': fields.String(required=True, min_length=1, max_length=100, example='Ana'),
    'Email': fields.String(required=True, max_length=255, pattern=EMAIL_PATTERN, example='ana@mail.com'),
    'Password': fields.String(required=True, min_length=8, description='Mínimo 8 caracteres',
                              example='miClave123'),
})

# --- Usuarios
usuario_crear_in = api.model('UsuarioCrear', {
    'Nombre': fields.String(required=True, min_length=1, max_length=100, example='Ana'),
    'Email': fields.String(required=True, max_length=255, pattern=EMAIL_PATTERN, example='ana@mail.com'),
    'es_Admin': fields.Boolean(required=True, description='Otorga rol de administrador', example=False),
})

usuario_actualizar_in = api.model('UsuarioActualizar', {
    'Nombre': fields.String(required=True, min_length=1, max_length=100, example='Ana'),
    'Email': fields.String(required=True, max_length=255, pattern=EMAIL_PATTERN, example='ana@mail.com'),
    'Password': fields.String(min_length=8,
                              description='Opcional. Si se omite, se conserva la contraseña actual'),
    'es_Admin': fields.Boolean(required=True, example=False),
    'activo': fields.Boolean(required=False, example=True),
})

usuario_out = api.model('Usuario', {
    'ID': fields.Integer(attribute='id', example=1),
    'Nombre': fields.String(attribute='nombre', example='Ana'),
    'Email': fields.String(attribute='email', example='ana@mail.com'),
    'es_Admin': fields.Boolean(attribute='es_admin', example=False),
    'activo': fields.Boolean(attribute='activo', example=True),
})

# --- Categorías y colecciones
categoria_in = api.model('CategoriaEntrada', {
    'nombre': fields.String(required=True, min_length=1, max_length=100, example='Acción'),
})
categoria_out = api.model('Categoria', {
    'ID': fields.Integer(attribute='id', example=1),
    'nombre': fields.String(example='Acción'),
})
coleccion_in = api.model('ColeccionEntrada', {
    'nombre': fields.String(required=True, min_length=1, max_length=100, example='Favoritos'),
})
coleccion_out = api.model('Coleccion', {
    'ID': fields.Integer(attribute='id', example=1),
    'nombre': fields.String(example='Favoritos'),
})

# --- Juegos
juego_in = api.model('JuegoEntrada', {
    'titulo': fields.String(required=True, min_length=1, max_length=255, example='Hollow Pixel'),
    'distribuidor': fields.String(required=True, min_length=1, max_length=255, example='Indie Corp'),
    'desarrollador': fields.String(required=True, min_length=1, max_length=255, example='Pixel Studio'),
    'lanzamiento': fields.Date(required=True, description='Formato YYYY-MM-DD', example='2024-05-20'),
    'descripcion': fields.String(required=True, min_length=1, example='Aventura de plataformas 2D.'),
    'requisitosID': fields.Integer(required=True, description='ID existente en Requisitos', example=1),
    'precio': fields.Float(required=True, min=0, example=19.99),
    'oferta_tipo': fields.String(required=False, enum=['precio', 'porcentaje'], description='Tipo de oferta'),
    'oferta_valor': fields.Float(required=False, description='Precio de oferta o porcentaje de descuento'),
    'oferta_desde': fields.Date(required=False, description='Inicio de oferta, formato YYYY-MM-DD'),
    'oferta_hasta': fields.Date(required=False, description='Fin de oferta, formato YYYY-MM-DD'),
    'img_principal': fields.String(required=True, min_length=1, max_length=500,
                                   description='URL de la imagen principal',
                                   example='https://ejemplo.com/img/hollow.png'),
    'activo': fields.Boolean(required=False, default=True, example=True),
    'categorias': fields.List(fields.Integer, description='IDs de categorías'),
    'colecciones': fields.List(fields.Integer, description='IDs de colecciones'),
    'plataformas': fields.List(fields.String, description='Windows, Linux, macOS, Android, iOS'),
    'idiomas': fields.List(fields.String, description='Idiomas disponibles'),
})

juego_out = api.model('Juego', {
    'ID': fields.Integer(attribute='id', example=1),
    'titulo': fields.String(example='Hollow Pixel'),
    'distribuidor': fields.String(example='Indie Corp'),
    'desarrollador': fields.String(example='Pixel Studio'),
    'lanzamiento': fields.Date(example='2024-05-20'),
    'descripcion': fields.String(example='Aventura de plataformas 2D.'),
    'requisitosID': fields.Integer(attribute='requisitos_id', example=1),
    'precio': fields.Float(example=19.99),
    'oferta_tipo': fields.String(example='porcentaje'),
    'oferta_valor': fields.Float(example=20),
    'oferta_desde': fields.Date(dt_format='iso8601'),
    'oferta_hasta': fields.Date(dt_format='iso8601'),
    'oferta_activa': fields.Boolean(attribute='oferta_activa'),
    'precio_final': fields.Float(attribute='precio_final', example=15.99),
    'img_principal': fields.String(example='https://ejemplo.com/img/hollow.png'),
    'activo': fields.Boolean(example=True),
    'categorias': fields.List(fields.Nested(categoria_out)),
    'colecciones': fields.List(fields.Nested(coleccion_out)),
    'plataformas': fields.Raw,
    'idiomas': fields.Raw,
    'fecha_subida': fields.DateTime(dt_format='iso8601'),
})

# --- Requisitos
requisito_out = api.model('Requisito', {
    'id': fields.Integer(example=1),
    '...': fields.Raw(description='Resto de las columnas definidas en la tabla Requisitos'),
})


def admin_only(ns):
    """Aplica require_admin y documenta seguridad + respuestas 401/403 en Swagger."""
    def decorator(f):
        f = require_admin(f)
        f = ns.response(403, 'El usuario no es administrador', mensaje_model)(f)
        f = ns.response(401, 'Token ausente, inválido o expirado', mensaje_model)(f)
        f = ns.doc(security='Bearer')(f)
        return f
    return decorator


@api.errorhandler(BadRequest)
def manejar_bad_request(e):
    """Unifica los errores 400 (validación, JSON inválido) con el formato {mensaje, errores}."""
    data = getattr(e, 'data', None) or {}
    cuerpo = {'mensaje': data.get('message') or e.description or 'Solicitud inválida'}
    if data.get('errors'):
        cuerpo['errores'] = data['errors']
    e.data = dict(cuerpo)  # restx prioriza e.data; se usa una copia para que no agregue 'message'
    return cuerpo, 400


# ---------------------------------------------------------------------------
# Autenticación
# ---------------------------------------------------------------------------
@ns_auth.route('/login')
class LoginResource(Resource):
    @ns_auth.expect(login_in, validate=True)
    @ns_auth.response(200, 'Login exitoso', login_out)
    @ns_auth.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_auth.response(401, 'Credenciales inválidas', mensaje_model)
    def post(self):
        """Iniciar sesión

        Devuelve un token firmado válido por 7 días junto con los datos básicos del usuario.
        """
        data = request.get_json()
        # Primero intentar con email, si no encuentra buscar por nombre
        usuario = db.session.query(Usuario).filter_by(email=data['email']).first()
        if not usuario:
            usuario = db.session.query(Usuario).filter_by(nombre=data['email']).first()
        if not usuario or not verify_password(usuario.password, data['password']):
            return {'mensaje': 'Credenciales inválidas'}, 401
        if usuario.activo is False:
            return {'mensaje': 'Esta cuenta fue bloqueada'}, 403

        user_data = {
            'id': usuario.id,
            'nombre': usuario.nombre,
            'email': usuario.email,
            'es_Admin': bool(usuario.es_admin),
        }
        token = serializer.dumps(user_data)
        return {'mensaje': 'Login exitoso', 'token': token, 'usuario': user_data}, 200


@ns_auth.route('/registrar')
class RegistrarResource(Resource):
    @ns_auth.expect(registro_in, validate=True)
    @ns_auth.response(201, 'Usuario registrado', mensaje_model)
    @ns_auth.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_auth.response(409, 'Ya existe un usuario con ese email', mensaje_model)
    @ns_auth.response(500, 'Error de base de datos', mensaje_model)
    def post(self):
        """Registro público de usuario

        El usuario creado **nunca** es administrador.
        """
        data = request.get_json()
        existe = db.session.execute(
            db.select(Usuario.id).filter_by(email=data['Email'])).first()
        if existe:
            return {'mensaje': 'El usuario ya existe'}, 409

        db.session.add(Usuario(nombre=data['Nombre'], email=data['Email'],
                               password=hash_password(data['Password']), es_admin=False))
        if not guardar():
            return {'mensaje': 'Error al registrar usuario en la base de datos'}, 500
        return {'mensaje': 'Usuario registrado exitosamente'}, 201


def generar_password_temporal():
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(12))


def enviar_credenciales_usuario(destinatario, nombre, password):
    remitente = os.getenv('SMTP_USER', '')
    clave = os.getenv('SMTP_PASSWORD', '')
    if not remitente or not clave:
        return False, 'El envío de correo no está configurado'
    mensaje = EmailMessage()
    mensaje['Subject'] = 'Tus credenciales de acceso a IndiAR'
    mensaje['From'] = os.getenv('SMTP_FROM', remitente)
    mensaje['To'] = destinatario
    mensaje.set_content(
        f'Hola {nombre},\n\nTu cuenta de IndiAR fue creada.\n\nUsuario (email): {destinatario}\nContraseña temporal: {password}\n\nPodés cambiarla desde Mi cuenta al iniciar sesión.\n'
    )
    try:
        with smtplib.SMTP(os.getenv('SMTP_HOST', 'smtp.gmail.com'), int(os.getenv('SMTP_PORT', '587'))) as servidor:
            servidor.starttls()
            servidor.login(remitente, clave)
            servidor.send_message(mensaje)
        return True, ''
    except (smtplib.SMTPException, OSError) as error:
        return False, str(error)


# ---------------------------------------------------------------------------
# Usuarios (solo administradores)
# ---------------------------------------------------------------------------
@ns_usuarios.route('/usuarios')
class UsuariosListResource(Resource):
    @admin_only(ns_usuarios)
    @ns_usuarios.response(200, 'Lista de usuarios (sin contraseñas)', [usuario_out])
    def get(self):
        """Listar usuarios"""
        usuarios = db.session.execute(db.select(Usuario).order_by(Usuario.id)).scalars().all()
        return marshal(usuarios, usuario_out), 200

    @admin_only(ns_usuarios)
    @ns_usuarios.expect(usuario_crear_in, validate=True)
    @ns_usuarios.response(201, 'Usuario creado', mensaje_model)
    @ns_usuarios.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_usuarios.response(409, 'Ya existe un usuario con ese email', mensaje_model)
    @ns_usuarios.response(500, 'Error de base de datos', mensaje_model)
    def post(self):
        """Crear usuario

        A diferencia de `/registrar`, permite definir si el nuevo usuario es administrador.
        """
        data = request.get_json()
        if db.session.execute(db.select(Usuario.id).filter_by(email=data['Email'])).first():
            return {'mensaje': 'El usuario ya existe'}, 409

        password_temporal = generar_password_temporal()
        db.session.add(Usuario(nombre=data['Nombre'], email=data['Email'],
                               password=hash_password(password_temporal),
                               es_admin=bool(data['es_Admin'])))
        if not guardar():
            return {'mensaje': 'Error al crear el usuario en la base de datos'}, 500
        enviado, error_correo = enviar_credenciales_usuario(data['Email'], data['Nombre'], password_temporal)
        if not enviado:
            return {'mensaje': 'Usuario creado, pero no se pudo enviar el correo', 'detalle': error_correo}, 201
        return {'mensaje': 'Usuario creado y credenciales enviadas por correo'}, 201


@ns_usuarios.route('/usuarios/<int:id>')
@ns_usuarios.doc(params={'id': 'ID del usuario'})
class UsuarioResource(Resource):
    @admin_only(ns_usuarios)
    @ns_usuarios.response(200, 'Usuario encontrado', usuario_out)
    @ns_usuarios.response(404, 'Usuario no encontrado', mensaje_model)
    def get(self, id):
        """Obtener un usuario por ID"""
        usuario = db.session.get(Usuario, id)
        if not usuario:
            return {'mensaje': 'No se encontró usuario'}, 404
        return marshal(usuario, usuario_out), 200

    @admin_only(ns_usuarios)
    @ns_usuarios.expect(usuario_actualizar_in, validate=True)
    @ns_usuarios.response(200, 'Usuario actualizado', mensaje_model)
    @ns_usuarios.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_usuarios.response(404, 'Usuario no encontrado', mensaje_model)
    @ns_usuarios.response(409, 'El email ya pertenece a otro usuario', mensaje_model)
    @ns_usuarios.response(500, 'Error de base de datos', mensaje_model)
    def put(self, id):
        """Actualizar un usuario

        Si no se envía `Password`, se conserva la contraseña actual.
        """
        usuario = db.session.get(Usuario, id)
        if not usuario:
            return {'mensaje': 'No se encontró usuario'}, 404

        data = request.get_json()
        otro = db.session.execute(
            db.select(Usuario.id).where(Usuario.email == data['Email'], Usuario.id != id)).first()
        if otro:
            return {'mensaje': 'El email ya pertenece a otro usuario'}, 409

        usuario.nombre = data['Nombre']
        usuario.email = data['Email']
        usuario.es_admin = bool(data['es_Admin'])
        if 'activo' in data:
            usuario.activo = bool(data['activo'])
        if data.get('Password'):
            usuario.password = hash_password(data['Password'])
        if not guardar():
            return {'mensaje': 'Error al actualizar el usuario en la base de datos'}, 500
        return {'mensaje': 'Usuario actualizado exitosamente'}, 200


@ns_usuarios.route('/usuarios/<int:id>/restablecer-password')
@ns_usuarios.doc(params={'id': 'ID del usuario'})
class UsuarioRestablecerPasswordResource(Resource):
    @admin_only(ns_usuarios)
    @ns_usuarios.response(200, 'Contraseña restablecida', mensaje_model)
    @ns_usuarios.response(404, 'Usuario no encontrado', mensaje_model)
    def post(self, id):
        """Generar y enviar una contraseña temporal"""
        usuario = db.session.get(Usuario, id)
        if not usuario:
            return {'mensaje': 'No se encontró usuario'}, 404

        password_temporal = generar_password_temporal()
        usuario.password = hash_password(password_temporal)
        if not guardar():
            return {'mensaje': 'Error al guardar la nueva contraseña'}, 500

        enviado, error_correo = enviar_credenciales_usuario(usuario.email, usuario.nombre, password_temporal)
        if not enviado:
            return {'mensaje': 'Contraseña restablecida, pero no se pudo enviar el correo', 'detalle': error_correo}, 201
        return {'mensaje': 'Contraseña nueva enviada por correo'}, 200


# ---------------------------------------------------------------------------
# Juegos (lectura pública, escritura solo administradores)
# ---------------------------------------------------------------------------
def aplicar_datos_juego(juego, data):
    """Copia y valida el payload antes de persistir los datos del juego."""
    juego.titulo = data['titulo']
    juego.distribuidor = data['distribuidor']
    juego.desarrollador = data['desarrollador']
    try:
        juego.lanzamiento = date.fromisoformat(data['lanzamiento'])
    except (TypeError, ValueError):
        raise ValueError('La fecha de lanzamiento no es válida; usa el formato YYYY-MM-DD.')
    juego.descripcion = data['descripcion']
    juego.requisitos_id = data['requisitosID']
    try:
        precio = Decimal(str(data['precio']))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError('El precio debe ser un número válido.')
    if not precio.is_finite():
        raise ValueError('El precio debe ser un número mayor o igual a cero.')
    try:
        precio = precio.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except InvalidOperation:
        raise ValueError('El precio excede el máximo permitido.')
    if precio < 0 or precio > Decimal('99999999.99'):
        raise ValueError('El precio debe estar entre cero y 99.999.999,99.')
    juego.precio = precio

    oferta_tipo = str(data.get('oferta_tipo') or '').strip().lower() or None
    oferta_valor = data.get('oferta_valor')
    oferta_desde = data.get('oferta_desde')
    oferta_hasta = data.get('oferta_hasta')
    if oferta_tipo not in (None, 'precio', 'porcentaje'):
        raise ValueError('El tipo de oferta debe ser precio o porcentaje.')
    if oferta_tipo is None:
        if any(value not in (None, '') for value in (oferta_valor, oferta_desde, oferta_hasta)):
            raise ValueError('Quitá los datos de oferta o seleccioná un tipo de oferta.')
        juego.oferta_tipo = None
        juego.oferta_valor = None
        juego.oferta_desde = None
        juego.oferta_hasta = None
    else:
        if oferta_valor in (None, ''):
            raise ValueError('Ingresá el valor de la oferta.')
        try:
            oferta_valor = Decimal(str(oferta_valor))
        except (InvalidOperation, TypeError, ValueError):
            raise ValueError('El valor de la oferta debe ser un número válido.')
        if not oferta_valor.is_finite():
            raise ValueError('El valor de la oferta debe ser un número válido.')
        try:
            oferta_valor = oferta_valor.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        except InvalidOperation:
            raise ValueError('El valor de la oferta excede el máximo permitido.')
        if oferta_tipo == 'precio' and (oferta_valor < 0 or oferta_valor >= precio):
            raise ValueError('El precio de oferta debe ser mayor o igual a cero y menor que el precio normal.')
        if oferta_tipo == 'porcentaje' and (oferta_valor <= 0 or oferta_valor > 100):
            raise ValueError('El descuento porcentual debe ser mayor que cero y como máximo 100%.')
        try:
            oferta_desde = date.fromisoformat(str(oferta_desde))
            oferta_hasta = date.fromisoformat(str(oferta_hasta))
        except (TypeError, ValueError):
            raise ValueError('Indicá fechas de inicio y fin válidas para la oferta.')
        if oferta_desde > oferta_hasta:
            raise ValueError('La fecha de fin de la oferta debe ser igual o posterior al inicio.')
        juego.oferta_tipo = oferta_tipo
        juego.oferta_valor = oferta_valor
        juego.oferta_desde = oferta_desde
        juego.oferta_hasta = oferta_hasta

    juego.img_principal = data['img_principal']
    if 'activo' in data:
        juego.activo = bool(data['activo'])
    elif juego.activo is None:
        juego.activo = True
    if 'categorias' in data:
        juego.categorias = db.session.execute(
            db.select(Categoria).where(Categoria.id.in_(data['categorias']))
        ).scalars().all()
    if 'colecciones' in data:
        juego.colecciones = db.session.execute(
            db.select(Coleccion).where(Coleccion.id.in_(data['colecciones']))
        ).scalars().all()
    plataformas_permitidas = {'Windows', 'Linux', 'macOS', 'Android', 'iOS'}
    plataformas = data.get('plataformas') or []
    idiomas = data.get('idiomas') or []
    if not isinstance(plataformas, list) or not isinstance(idiomas, list):
        raise TypeError('Plataformas e idiomas deben enviarse como listas')

    plataformas_normalizadas = list(dict.fromkeys(
        str(item).strip() for item in plataformas
        if isinstance(item, str) and item.strip()
    ))
    idiomas_normalizados = list(dict.fromkeys(
        str(item).strip() for item in idiomas
        if isinstance(item, str) and item.strip()
    ))
    plataformas_invalidas = [item for item in plataformas_normalizadas if item not in plataformas_permitidas]
    if plataformas_invalidas:
        raise ValueError('Plataforma no válida: ' + ', '.join(plataformas_invalidas))

    juego.plataformas = plataformas_normalizadas
    juego.idiomas = idiomas_normalizados


@ns_juegos.route('/juegos')
class JuegoListResource(Resource):
    @ns_juegos.response(200, 'Lista de juegos', [juego_out])
    def get(self):
        """Listar todos los juegos"""
        juegos = db.session.execute(db.select(Juego).order_by(Juego.id)).unique().scalars().all()
        return marshal(juegos, juego_out), 200

    @admin_only(ns_juegos)
    @ns_juegos.expect(juego_in, validate=True)
    @ns_juegos.response(201, 'Juego creado', mensaje_model)
    @ns_juegos.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_juegos.response(500, 'Error de base de datos', mensaje_model)
    def post(self):
        """Crear un juego"""
        juego = Juego()
        try:
            aplicar_datos_juego(juego, request.get_json())
        except (TypeError, ValueError) as error:
            db.session.rollback()
            mensaje = str(error)
            if mensaje.startswith('Plataforma no válida') or mensaje.startswith('Plataformas e idiomas'):
                return {'mensaje': mensaje}, 400
            return {'mensaje': mensaje}, 400
        db.session.add(juego)
        if not guardar():
            return {'mensaje': 'Error al crear el juego en la base de datos'}, 500
        return {'mensaje': 'Juego creado exitosamente'}, 201


@ns_juegos.route('/juegos/<int:id>')
@ns_juegos.doc(params={'id': 'ID del juego'})
class JuegoResource(Resource):
    @ns_juegos.response(200, 'Juego encontrado', juego_out)
    @ns_juegos.response(404, 'Juego no encontrado', mensaje_model)
    def get(self, id):
        """Obtener un juego por ID"""
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        return marshal(juego, juego_out), 200

    @admin_only(ns_juegos)
    @ns_juegos.expect(juego_in, validate=True)
    @ns_juegos.response(200, 'Juego actualizado', mensaje_model)
    @ns_juegos.response(400, 'Datos inválidos o incompletos', error_model)
    @ns_juegos.response(404, 'Juego no encontrado', mensaje_model)
    @ns_juegos.response(500, 'Error de base de datos', mensaje_model)
    def put(self, id):
        """Actualizar un juego (reemplaza todos los campos)"""
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        try:
            aplicar_datos_juego(juego, request.get_json())
        except (TypeError, ValueError) as error:
            db.session.rollback()
            mensaje = str(error)
            if mensaje.startswith('Plataforma no válida') or mensaje.startswith('Plataformas e idiomas'):
                return {'mensaje': mensaje}, 400
            return {'mensaje': mensaje}, 400
        if not guardar():
            return {'mensaje': 'Error al actualizar el juego en la base de datos'}, 500
        return {'mensaje': 'Juego actualizado exitosamente'}, 200

    @admin_only(ns_juegos)
    @ns_juegos.response(200, 'Juego eliminado', mensaje_model)
    @ns_juegos.response(404, 'Juego no encontrado', mensaje_model)
    @ns_juegos.response(500, 'Error de base de datos', mensaje_model)
    def delete(self, id):
        """Eliminar un juego"""
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        db.session.delete(juego)
        if not guardar():
            return {'mensaje': 'Error al eliminar juego'}, 500
        return {'mensaje': 'Juego eliminado exitosamente'}, 200


@ns_juegos.route('/juegos/<int:id>/estado')
class JuegoEstadoResource(Resource):
    @admin_only(ns_juegos)
    def patch(self, id):
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        data = request.get_json(silent=True) or {}
        if 'activo' not in data:
            return {'mensaje': 'Debes indicar el nuevo estado'}, 400
        juego.activo = bool(data['activo'])
        if not guardar():
            return {'mensaje': 'No se pudo actualizar el estado'}, 500
        return {'mensaje': 'Estado actualizado correctamente', 'activo': juego.activo}, 200


@ns_juegos.route('/juegos/<int:id>/imagenes')
class JuegoImagenesResource(Resource):
    def get(self, id):
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        return [{'ID': imagen.id, 'url': imagen.url} for imagen in JuegoImagen.query.filter_by(juego_id=id).order_by(JuegoImagen.id.asc()).all()], 200

    @admin_only(ns_juegos)
    def post(self, id):
        juego = db.session.get(Juego, id)
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        file = request.files.get('imagen')
        if not file or not file.filename:
            return {'mensaje': 'Debes seleccionar una imagen'}, 400
        try:
            image = Image.open(file.stream)
            image.load()
            if image.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.getchannel('A'))
                image = background
            else:
                image = image.convert('RGB')
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            filename = f'{uuid.uuid4()}.webp'
            image.save(os.path.join(UPLOAD_FOLDER, filename), 'WEBP', quality=82, method=6)
        except Exception:
            app.logger.exception('No se pudo procesar la imagen')
            return {'mensaje': 'El archivo seleccionado no es una imagen válida'}, 400
        relative_url = f'/uploads/{filename}'
        imagen = JuegoImagen(juego_id=id, url=relative_url)
        db.session.add(imagen)
        if not JuegoImagen.query.filter_by(juego_id=id).first():
            juego.img_principal = relative_url
        if not guardar():
            return {'mensaje': 'No se pudo guardar la imagen del juego'}, 500
        return {'mensaje': 'Imagen subida correctamente', 'ID': imagen.id, 'url': relative_url}, 200


@ns_juegos.route('/imagenes/<int:id>')
class JuegoImagenResource(Resource):
    @admin_only(ns_juegos)
    def delete(self, id):
        imagen = db.session.get(JuegoImagen, id)
        if not imagen:
            return {'mensaje': 'No se encontró la imagen'}, 404
        juego = db.session.get(Juego, imagen.juego_id)
        if juego and juego.img_principal == imagen.url:
            replacement = JuegoImagen.query.filter(JuegoImagen.juego_id == imagen.juego_id, JuegoImagen.id != id).order_by(JuegoImagen.id.asc()).first()
            juego.img_principal = replacement.url if replacement else '/uploads/pendiente.webp'
        db.session.delete(imagen)
        if not guardar():
            return {'mensaje': 'No se pudo eliminar la imagen'}, 500
        filename = imagen.url.rsplit('/', 1)[-1]
        try:
            os.remove(os.path.join(UPLOAD_FOLDER, filename))
        except FileNotFoundError:
            pass
        return {'mensaje': 'Imagen eliminada correctamente'}, 200


@ns_juegos.route('/juegos/titulo/<string:titulo>')
@ns_juegos.doc(params={'titulo': 'Título exacto del juego'})
class JuegoByTituloResource(Resource):
    @ns_juegos.response(200, 'Juego encontrado', juego_out)
    @ns_juegos.response(404, 'Juego no encontrado', mensaje_model)
    def get(self, titulo):
        """Obtener un juego por título exacto"""
        juego = db.session.execute(db.select(Juego).filter_by(titulo=titulo)).scalars().first()
        if not juego:
            return {'mensaje': 'No se encontró el juego'}, 404
        return marshal(juego, juego_out), 200


# ---------------------------------------------------------------------------
# Categorías y colecciones
# ---------------------------------------------------------------------------
@ns_categorias.route('/categorias')
class CategoriasListResource(Resource):
    @ns_categorias.response(200, 'Lista de categorías', [categoria_out])
    def get(self):
        categorias = db.session.execute(db.select(Categoria).order_by(Categoria.nombre)).scalars().all()
        return marshal(categorias, categoria_out), 200

    @admin_only(ns_categorias)
    @ns_categorias.expect(categoria_in, validate=True)
    def post(self):
        data = request.get_json()
        if db.session.execute(db.select(Categoria).where(Categoria.nombre == data['nombre'].strip())).scalars().first():
            return {'mensaje': 'Ya existe una categoría con ese nombre'}, 409
        categoria = Categoria(nombre=data['nombre'].strip())
        db.session.add(categoria)
        if not guardar():
            return {'mensaje': 'No se pudo crear la categoría'}, 500
        return {'mensaje': 'Categoría creada exitosamente'}, 201


@ns_categorias.route('/categorias/<int:id>')
class CategoriaResource(Resource):
    @admin_only(ns_categorias)
    @ns_categorias.expect(categoria_in, validate=True)
    def put(self, id):
        categoria = db.session.get(Categoria, id)
        if not categoria:
            return {'mensaje': 'Categoría no encontrada'}, 404
        nombre = request.get_json()['nombre'].strip()
        if db.session.execute(db.select(Categoria).where(Categoria.nombre == nombre, Categoria.id != id)).scalars().first():
            return {'mensaje': 'Ya existe una categoría con ese nombre'}, 409
        categoria.nombre = nombre
        if not guardar():
            return {'mensaje': 'No se pudo actualizar la categoría'}, 500
        return {'mensaje': 'Categoría actualizada exitosamente'}, 200

    @admin_only(ns_categorias)
    def delete(self, id):
        categoria = db.session.get(Categoria, id)
        if not categoria:
            return {'mensaje': 'Categoría no encontrada'}, 404
        db.session.delete(categoria)
        if not guardar():
            return {'mensaje': 'No se pudo eliminar la categoría'}, 500
        return {'mensaje': 'Categoría eliminada exitosamente'}, 200


@ns_colecciones.route('/colecciones')
class ColeccionesListResource(Resource):
    @ns_colecciones.response(200, 'Lista de colecciones', [coleccion_out])
    def get(self):
        colecciones = db.session.execute(db.select(Coleccion).order_by(Coleccion.nombre)).scalars().all()
        return marshal(colecciones, coleccion_out), 200

    @admin_only(ns_colecciones)
    @ns_colecciones.expect(coleccion_in, validate=True)
    def post(self):
        data = request.get_json()
        if db.session.execute(db.select(Coleccion).where(Coleccion.nombre == data['nombre'].strip())).scalars().first():
            return {'mensaje': 'Ya existe una colección con ese nombre'}, 409
        coleccion = Coleccion(nombre=data['nombre'].strip())
        db.session.add(coleccion)
        if not guardar():
            return {'mensaje': 'No se pudo crear la colección'}, 500
        return {'mensaje': 'Colección creada exitosamente'}, 201


@ns_colecciones.route('/colecciones/<int:id>')
class ColeccionResource(Resource):
    @admin_only(ns_colecciones)
    @ns_colecciones.expect(coleccion_in, validate=True)
    def put(self, id):
        coleccion = db.session.get(Coleccion, id)
        if not coleccion:
            return {'mensaje': 'Colección no encontrada'}, 404
        nombre = request.get_json()['nombre'].strip()
        if db.session.execute(db.select(Coleccion).where(Coleccion.nombre == nombre, Coleccion.id != id)).scalars().first():
            return {'mensaje': 'Ya existe una colección con ese nombre'}, 409
        coleccion.nombre = nombre
        if not guardar():
            return {'mensaje': 'No se pudo actualizar la colección'}, 500
        return {'mensaje': 'Colección actualizada exitosamente'}, 200

    @admin_only(ns_colecciones)
    def delete(self, id):
        coleccion = db.session.get(Coleccion, id)
        if not coleccion:
            return {'mensaje': 'Colección no encontrada'}, 404
        db.session.delete(coleccion)
        if not guardar():
            return {'mensaje': 'No se pudo eliminar la colección'}, 500
        return {'mensaje': 'Colección eliminada exitosamente'}, 200


DEFAULT_LANDING_CONFIG = {
    'title': 'Novedades para ti',
    'mode': 'todos',
    'categoryId': '',
    'collectionId': '',
    'categoryIds': [],
    'collectionIds': [],
    'limit': 8,
    'featuredIds': [],
    'carouselGameIds': [],
}


@ns_landing.route('/landing-config')
class LandingConfigResource(Resource):
    def get(self):
        stored = db.session.execute(db.select(LandingConfig).order_by(LandingConfig.id)).scalars().first()
        if not stored:
            return DEFAULT_LANDING_CONFIG, 200
        try:
            return {**DEFAULT_LANDING_CONFIG, **json.loads(stored.config)}, 200
        except (TypeError, json.JSONDecodeError):
            return DEFAULT_LANDING_CONFIG, 200

    @admin_only(ns_landing)
    def put(self):
        data = request.get_json() or {}
        allowed_modes = {'todos', 'categoria', 'coleccion', 'destacados'}
        try:
            landing_limit = int(data.get('limit', 8) or 8)
        except (TypeError, ValueError):
            landing_limit = 8
        carousel_game_ids = data.get('carouselGameIds', [])
        if not isinstance(carousel_game_ids, list):
            carousel_game_ids = []
        carousel_game_ids = list(dict.fromkeys(str(game_id) for game_id in carousel_game_ids))[:24]
        config = {
            'title': str(data.get('title', DEFAULT_LANDING_CONFIG['title']))[:80],
            'mode': data.get('mode', 'todos') if data.get('mode', 'todos') in allowed_modes else 'todos',
            'categoryId': str(data.get('categoryId', '') or ''),
            'collectionId': str(data.get('collectionId', '') or ''),
            'categoryIds': [str(value) for value in (data.get('categoryIds') or [])][:24],
            'collectionIds': [str(value) for value in (data.get('collectionIds') or [])][:4],
            'limit': max(1, min(24, landing_limit)),
            'featuredIds': [str(game_id) for game_id in (data.get('featuredIds') or [])],
            'carouselGameIds': carousel_game_ids,
        }
        stored = db.session.execute(db.select(LandingConfig).order_by(LandingConfig.id)).scalars().first()
        if stored:
            stored.config = json.dumps(config, ensure_ascii=False)
        else:
            db.session.add(LandingConfig(config=json.dumps(config, ensure_ascii=False)))
        if not guardar():
            return {'mensaje': 'No se pudo guardar la configuración de la landing'}, 500
        return config, 200


# ---------------------------------------------------------------------------
# Requisitos (lectura pública)
# ---------------------------------------------------------------------------
@ns_requisitos.route('/requisitos')
class RequisitosListResource(Resource):
    @ns_requisitos.response(200, 'Lista de requisitos', [requisito_out])
    def get(self):
        """Listar requisitos"""
        tabla = get_requisitos_table()
        filas = db.session.execute(sa.select(tabla)).mappings().all()
        return [{k: jsonable(v) for k, v in fila.items()} for fila in filas], 200

    @admin_only(ns_requisitos)
    def post(self):
        tabla = get_requisitos_table()
        data = request.get_json() or {}
        columnas = [col for col in tabla.c if col.name.lower() != 'id']
        valores = {col.name: data[col.name] for col in columnas if col.name in data}
        result = db.session.execute(tabla.insert().values(**valores))
        if not guardar():
            return {'mensaje': 'No se pudieron crear los requisitos'}, 500
        return {'mensaje': 'Requisitos creados exitosamente', 'id': result.inserted_primary_key[0]}, 201


@ns_requisitos.route('/requisitos/<int:id>')
@ns_requisitos.doc(params={'id': 'ID del requisito'})
class RequisitoResource(Resource):
    @ns_requisitos.response(200, 'Requisito encontrado', requisito_out)
    @ns_requisitos.response(404, 'Requisito no encontrado', mensaje_model)
    def get(self, id):
        """Obtener un requisito por ID"""
        tabla = get_requisitos_table()
        fila = db.session.execute(sa.select(tabla).where(get_requisitos_id_column(tabla) == id)).mappings().first()
        if not fila:
            return {'mensaje': 'No se encontró el requisito'}, 404
        return {k: jsonable(v) for k, v in fila.items()}, 200

    @admin_only(ns_requisitos)
    @ns_requisitos.expect(ns_requisitos.model('RequisitosMutacion', {
        k: fields.Raw(required=k != 'id') for k in []
    }))
    def put(self, id):
        tabla = get_requisitos_table()
        fila = db.session.execute(sa.select(tabla).where(get_requisitos_id_column(tabla) == id)).first()
        if not fila:
            return {'mensaje': 'Requisitos no encontrados'}, 404
        data = request.get_json() or {}
        valores = {k: v for k, v in data.items() if k.lower() != 'id' and k in tabla.c}
        db.session.execute(tabla.update().where(get_requisitos_id_column(tabla) == id).values(**valores))
        if not guardar():
            return {'mensaje': 'No se pudieron actualizar los requisitos'}, 500
        return {'mensaje': 'Requisitos actualizados exitosamente'}, 200

    @admin_only(ns_requisitos)
    def delete(self, id):
        tabla = get_requisitos_table()
        fila = db.session.execute(sa.select(tabla).where(get_requisitos_id_column(tabla) == id)).first()
        if not fila:
            return {'mensaje': 'Requisitos no encontrados'}, 404
        db.session.execute(tabla.delete().where(get_requisitos_id_column(tabla) == id))
        if not guardar():
            return {'mensaje': 'No se pudieron eliminar los requisitos'}, 500
        return {'mensaje': 'Requisitos eliminados exitosamente'}, 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=os.getenv('FLASK_DEBUG', '0') == '1', port=5000)