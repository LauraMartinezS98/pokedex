import express from 'express';
const router = express.Router();

// Importar controladores de PÁGINA
import {
    paginaInicio,
    paginaNosotros,
    paginaComentarios,
    paginaPokemons,
    paginaDetallesPokemons,
    guardarComentarios,
    buscador,
} from "../controllers/paginaController.js";

// Importar controladores de USUARIO (Asegúrate de importar soltarPokemon aquí)
import {
    paginaPerfil,
    capturarPokemon,
    soltarPokemon // <--- IMPORTANTE
} from '../controllers/usuarioController.js';


// --- RUTAS PÚBLICAS ---
router.get('/', paginaInicio);
router.get('/nosotros', paginaNosotros);

// --- RUTA DEL BUSCADOR  ---
router.post('/buscador', buscador);

// Rutas de Pokemons
router.get('/pokemons', paginaPokemons);
router.get('/pokemons/:id', paginaDetallesPokemons);

// Rutas de Comentarios
router.get('/comentarios', paginaComentarios);
router.post('/comentarios', guardarComentarios);

// --- RUTAS DE USUARIO ---
router.get('/perfil', paginaPerfil);
router.post('/pokemons/capturar/:id', capturarPokemon);

// ESTA ES LA RUTA QUE TE FALTABA AQUÍ:
router.post('/pokemons/soltar/:id', soltarPokemon);

export default router;