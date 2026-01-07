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

// --- Login ---
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// --- Registro ---
router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

// Ruta para soltar (borrar)
router.post('/pokemons/soltar/:id', soltarPokemon);

// --- Cerrar Sesión ---
router.post('/cerrar-sesion', cerrarSesion);

export default router;