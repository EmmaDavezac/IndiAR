-- init_admin.sql
-- Script de inicialización para MySQL
-- Este script se ejecuta AUTOMÁTICAMENTE cuando el contenedor MySQL
-- se crea por primera vez (usando docker-entrypoint-initdb.d)

-- ============================================================
-- CREAR TABLA USUARIOS SI NO EXISTE
-- ============================================================

CREATE TABLE IF NOT EXISTS Usuarios (
  ID int NOT NULL AUTO_INCREMENT,
  Nombre varchar(100) NOT NULL,
  Email varchar(255) NOT NULL,
  Password varchar(255) NOT NULL,
  es_Admin tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
);

-- ============================================================
-- USUARIO ADMIN CON CONTRASEÑA admin1234
-- ============================================================

-- Hash PBKDF2-HMAC-SHA256 (100000 iteraciones) para la contraseña admin1234
-- Salt: 2ea5b0eaac7593dfc4d513d95dfc754d
-- Hash: 2ea5b0eaac7593dfc4d513d95dfc754d:cf8fdd64b32828b42a94823df9f268463f9871713f0ba302f80e9d8f3be5000f

SET @password_hash = 's:2ea5b0eaac7593dfc4d513d95dfc754d:cf8fdd64b32828b42a94823df9f268463f9871713f0ba302f80e9d8f3be5000f';

-- ============================================================
-- INSERTAR USUARIO ADMIN (IGNORE si ya existe)
-- ============================================================

INSERT IGNORE INTO Usuarios (ID, Nombre, Email, Password, es_Admin) VALUES (
  2,
  'Admin',
  'admin@indiar.com',
  CONCAT(@password_hash),
  1
);

-- Insertar usuario de prueba (opcional)
INSERT IGNORE INTO Usuarios (ID, Nombre, Email, Password, es_Admin) VALUES (
  3,
  'TestUser',
  'test@test.com',
  'fijo1234567890abcd:95770a7ab33c6dc81c1a9d9a9bc717fd1dac9f3129d637cc85b1bdc3b2c65942',
  0
);
