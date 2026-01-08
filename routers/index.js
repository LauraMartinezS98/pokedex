import express from 'express';
const router = express.Router();

/**
 * IMPORTACIÓN DE CONTROLADORES
 */
import {
    paginaInicio,
    paginaNosotros,
    paginaComentarios,
    paginaPokemons,
    paginaDetallesPokemons,
    guardarComentarios,
    buscador,
} from "../controllers/paginaController.js";

import {
    paginaPerfil,
    capturarPokemon,
    soltarPokemon
} from '../controllers/usuarioController.js';

/**
 * RUTAS PÚBLICAS Y NAVEGACIÓN GENERAL
 */
router.get('/', paginaInicio);
router.get('/nosotros', paginaNosotros);
router.post('/buscador', buscador);

/**
 * MÓDULO POKÉMON (Listado y Detalle)
 */
router.get('/pokemons', paginaPokemons);
router.get('/pokemons/:id', paginaDetallesPokemons);

/**
 * MÓDULO COMUNIDAD (Testimoniales / Comentarios)
 */
router.get('/comentarios', paginaComentarios);
router.post('/comentarios', guardarComentarios);

/**
 * MÓDULO USUARIO Y GESTIÓN DE EQUIPO
 * Nota: 'soltar' y 'capturar' utilizan POST para mayor seguridad en la BD
 */
router.get('/perfil', paginaPerfil);
router.post('/pokemons/capturar/:id', capturarPokemon);
router.post('/pokemons/soltar/:id', soltarPokemon);

export default router;