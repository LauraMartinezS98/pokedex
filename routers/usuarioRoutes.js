import express from 'express';
const router = express.Router();
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    cerrarSesion,
    paginaPerfil,
    capturarPokemon,
    soltarPokemon
} from '../controllers/usuarioController.js';

// Autenticación
router.get('/login', formularioLogin);
router.post('/login', autenticar);
router.get('/registro', formularioRegistro);
router.post('/registro', registrar);
router.post('/cerrar-sesion', cerrarSesion);

// Gestión de Equipo (Perfil y acciones)
router.get('/perfil', paginaPerfil);
router.post('/pokemons/capturar/:id', capturarPokemon);
router.get('/soltar/:id', soltarPokemon);

export default router;