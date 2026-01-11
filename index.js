import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import jwt from 'jsonwebtoken';
import db from './config/bd.js';

// --- 1. MODELOS Y RELACIONES ---
// Importamos primero los modelos base
import './models/Usuario.js';
import './models/Pokemon.js';
import './models/Equipo.js';
import './models/Comentario.js';

// Importamos las relaciones al final para conectar los modelos anteriores
import './models/Relacion.js';

// --- 2. RUTAS ---
import router from './routers/index.js';
import usuarioRoutes from './routers/usuarioRoutes.js';

const app = express();

/**
 * CONFIGURACIÓN DE BASE DE DATOS
 * Sincronización con 'alter: true' para actualizar tablas y relaciones existentes
 */
db.authenticate()
    .then(() => {
        return db.sync({ alter: true });
    })
    .then(() => console.log('Base de datos conectada y relaciones sincronizadas exitosamente'))
    .catch(error => console.error('Error de conexión o sincronización en la BD:', error));

/**
 * CONFIGURACIÓN DEL SERVIDOR Y MIDDLEWARES
 */
const port = process.env.PORT || 4000;

// Motor de plantillas Pug
app.set('view engine', 'pug');

// Procesamiento de datos de formularios y lectura de Cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de Sesión (Necesaria para los mensajes Flash)
app.use(session({
    secret: process.env.SESSION_SECRET || 'palabrasecreta',
    resave: false,
    saveUninitialized: false
}));

// Habilitar mensajes flash para alertas (errores/éxitos)
app.use(flash());

// Carpeta de recursos estáticos (CSS, Imágenes, etc.)
app.use(express.static('public'));

/**
 * MIDDLEWARE DE VARIABLES GLOBALES E IDENTIDAD
 * Se encarga de pasar datos comunes a todas las vistas PUG
 */
app.use((req, res, next) => {
    // Año actual para el footer
    const year = new Date();
    res.locals.añoActual = year.getFullYear();
    res.locals.nombreSitio = "PokéTool";

    // Pasar mensajes de error/éxito a las vistas
    res.locals.mensajes = req.flash();

    // Verificación de sesión mediante JWT almacenado en cookies
    const token = req.cookies._token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'palabraSecreta');
            // 'usuario' estará disponible en todos los archivos .pug
            res.locals.usuario = decoded;
            // 'req.usuario' estará disponible en todos los controladores
            req.usuario = decoded;
        } catch (error) {
            res.locals.usuario = null;
            req.usuario = null;
        }
    } else {
        res.locals.usuario = null;
        req.usuario = null;
    }

    next();
});

/**
 * DEFINICIÓN DE RUTAS
 */
app.use('/', usuarioRoutes);        // Rutas generales y de Pokédex
app.use('/auth', usuarioRoutes); // Rutas de login, registro y equipo

app.listen(port, () => {
    console.log(`El Servidor está funcionando en el puerto ${port}`);
});