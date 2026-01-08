import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import jwt from 'jsonwebtoken';
import db from './config/bd.js';
import './models/Usuario.js';
import router from './routers/index.js';
import usuarioRoutes from './routers/usuarioRoutes.js';
import './models/Equipo.js';

const app = express();

// 1. Conectar a la base de datos
db.authenticate()
    .then(() => db.sync())
    .then(() => console.log('Base de datos conectada y tablas sincronizadas'))
    .catch(error => console.log(error));

// 2. Definir puerto
const port = process.env.PORT || 4000;

// 3. Habilitar PUG
app.set('view engine', 'pug');

// 4. Habilitar lectura de formularios y Cookies
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// --- CONFIGURACIÓN DE SESIÓN (Indispensable para Flash) ---
app.use(session({
    secret: 'palabrasecreta', // Puedes usar process.env.JWT_SECRET
    resave: false,
    saveUninitialized: false
}));

// --- HABILITAR FLASH ---
app.use(flash());

// 5. Definir la carpeta publica
app.use(express.static('public'));

// 6. Middleware Propio (Variables Globales, Sesión y Mensajes)
app.use((req, res, next) => {
    // A) Variables generales
    const year = new Date();
    res.locals.añoActual = year.getFullYear();
    res.locals.nombreSitio = "PokéTool";

    // B) PASAR MENSAJES FLASH A PUG (Esto es lo que hace que salga la alerta)
    // Se asegura de que res.locals.mensajes contenga los errores de req.flash()
    res.locals.mensajes = req.flash();

    // C) Lógica para identificar al usuario
    const token = req.cookies._token;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'palabraSecreta');
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

// 7. Routing
app.use('/', router);
app.use('/auth', usuarioRoutes);

// 8. Arrancar
app.listen(port, () => {
    console.log(`El Servidor esta funcionando en el puerto ${port}`);
});