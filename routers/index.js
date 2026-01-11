import express from 'express';
const router = express.Router();
import {
    paginaInicio,
    paginaNosotros,
    paginaComentarios,
    paginaPokemons,
    paginaDetallesPokemons,
    guardarComentarios,
    buscador,
} from "../controllers/paginaController.js";

// Navegación
router.get('/', paginaInicio);
router.get('/nosotros', paginaNosotros);
router.post('/buscador', buscador);

// Pokémon (Listado y Detalle)
router.get('/pokemons', paginaPokemons);
router.get('/pokemons/:id', paginaDetallesPokemons);

// Comentarios
router.get('/comentarios', paginaComentarios);
router.post('/comentarios', guardarComentarios);

export default router;