import express from 'express';
import cookieParser from 'cookie-parser';
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

// 5. Definir la carpeta publica
app.use(express.static('public'));

// 6. Middleware Propio (Variables Globales y Sesión)
app.use((req, res, next) => {
    // A) Variables generales
    const year = new Date();
    res.locals.añoActual = year.getFullYear();
    res.locals.nombreSitio = "PokéTool";

    // B) Lógica para identificar al usuario
    const token = req.cookies._token;

    if(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'palabraSecreta');

            // Guardamos al usuario en locals para que PUG lo pueda usar
            res.locals.usuario = decoded;

            // --- CAMBIO 2: IMPORTANTE PARA EL CONTROLADOR ---
            // Guardamos al usuario en req para que el controlador (paginaPerfil) lo pueda leer
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