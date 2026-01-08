import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import jwt from 'jsonwebtoken';
import db from './config/bd.js';
import router from './routers/index.js';
import usuarioRoutes from './routers/usuarioRoutes.js';

// Importación de modelos para sincronización
import './models/Usuario.js';
import './models/Equipo.js';

const app = express();

/**
 * CONFIGURACIÓN DE BASE DE DATOS
 */
db.authenticate()
    .then(() => db.sync())
    .then(() => console.log('Base de datos conectada y tablas sincronizadas'))
    .catch(error => console.error('Error de conexión a la BD:', error));

/**
 * CONFIGURACIÓN DEL SERVIDOR Y MIDDLEWARES
 */
const port = process.env.PORT || 4000;

// Motor de plantillas
app.set('view engine', 'pug');

// Procesamiento de datos y cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de Sesión y Mensajes Flash (Persistencia temporal)
app.use(session({
    secret: process.env.SESSION_SECRET || 'palabrasecreta',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Carpeta de recursos estáticos
app.use(express.static('public'));

/**
 * MIDDLEWARE GLOBAL
 * Gestiona variables locales, mensajes de sesión e identidad del usuario
 */

app.use((req, res, next) => {
    // 1. Variables de utilidad para las vistas
    const year = new Date();
    res.locals.añoActual = year.getFullYear();
    res.locals.nombreSitio = "PokéTool";

    // 2. Persistencia de mensajes Flash a nivel local (Alertas)
    res.locals.mensajes = req.flash();

    // 3. Verificación de identidad mediante JWT
    const token = req.cookies._token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'palabraSecreta');
            // Almacenamos en locals para PUG y en req para los controladores
            res.locals.usuario = decoded;
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
app.use('/', router);
app.use('/auth', usuarioRoutes);

app.listen(port, () => {
    console.log(`El Servidor está funcionando en el puerto ${port}`);
});