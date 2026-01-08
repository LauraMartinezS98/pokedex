import express from 'express';
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    soltarPokemon,
    cerrarSesion
} from '../controllers/usuarioController.js';

const router = express.Router();

/**
 * RUTAS DE AUTENTICACIÓN (Acceso y Registro)
 */

// Gestión de Inicio de Sesión
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Gestión de Creación de Cuentas
router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

// Finalización de Sesión
router.post('/cerrar-sesion', cerrarSesion);

/**
 * GESTIÓN DE EQUIPO (Acciones de Usuario)
 */

// Nota: Se utiliza GET para facilitar la eliminación mediante enlaces directos (X) en la vista
router.get('/soltar/:id', soltarPokemon);

export default router;