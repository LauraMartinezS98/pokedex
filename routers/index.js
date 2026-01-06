//Importar el módulo express para crear aplicaciones web
import express from 'express';
import {paginaInicio, paginaNosotros, paginaTestimonios, paginaViajes, paginaDetallesViajes, guardarTestimonios} from "../controllers/paginaController.js";

const router = express.Router();

//Creo un endpoint de get en la web
router.get('/',paginaInicio);
//res.json({id:1});

//Creo un endpoint
router.get('/nosotros', paginaNosotros);

//Creo un endpoint
router.get('/testimonios', paginaTestimonios);

//Creo un endpoint
router.get('/viajes', paginaViajes);

//Los dos puntos es como un comodin y no repetir páginas
router.get('/viajes/:slug', paginaDetallesViajes);

router.post('/testimonios', guardarTestimonios);

export default router;