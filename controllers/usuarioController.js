import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import Equipo from '../models/Equipo.js';
import Pokemon from '../models/Pokemon.js';

// --- Mostrar formulario de Login ---
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    });
}

// --- PROCESAR EL LOGIN ---
const autenticar = async (req, res) => {
    const { email, password } = req.body;

    // 1. Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } });

    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'El Usuario no existe'}]
        });
    }

    // 2. Comprobar si la contraseña es correcta
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'La Contraseña es Incorrecta'}]
        });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign({
        id: usuario.id,
        nombre: usuario.nombre
    }, process.env.JWT_SECRET || 'palabraSecreta', {
        expiresIn: '1d'
    });

    // 4. Guardar cookie y redirigir
    console.log(`Usuario ${usuario.nombre} logueado correctamente`);

    return res.cookie('_token', token, {
        httpOnly: true
    }).redirect('/');
}

// --- Mostrar formulario de Registro ---
const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    });
}

// --- Guardar nuevo usuario ---
const registrar = async (req, res) => {
    const { nombre, email, password } = req.body;

    // Validaciones básicas
    if(nombre === '' || email === '' || password === '') {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Todos los campos son obligatorios'}]
        });
    }

    // Verificar duplicados
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El Usuario ya está registrado'}]
        });
    }

    // Guardar
    try {
        await Usuario.create({ nombre, email, password });
        res.redirect('/auth/login');
    } catch (error) {
        console.log(error);
    }
}


// --- Cerrar Sesión ---
const cerrarSesion = (req, res) => {
    res.clearCookie('_token');
    res.redirect('/auth/login');
}


// --- GUARDAR POKEMON (CAPTURAR) ---
const capturarPokemon = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
        const pokemonIdNum = parseInt(id);

        // --- VALIDACIÓN DE GENERACIÓN ---
        if (pokemonIdNum < 1 || pokemonIdNum > 151) {
            // Enviamos el mensaje de error a la vista
            req.flash('error', 'Este pokemon no puede ser capturado, no es de la primera generación');
            return res.redirect('/pokemons');
        }

        // --- VALIDACIÓN DE EQUIPO ---
        const conteo = await Equipo.count({ where: { usuarioId } });
        if (conteo >= 6) {
            req.flash('error', 'Tu equipo ya está lleno (máximo 6 Pokémon)');
            return res.redirect('/perfil');
        }

        await Equipo.create({ usuarioId, pokemonId: id });
        res.redirect('/perfil');

    } catch (error) {
        console.log(error);
        res.redirect('/pokemons');
    }
}
// --- SOLTAR POKEMON (BORRAR DEL EQUIPO) ---
const soltarPokemon = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
        await Equipo.destroy({
            where: {
                usuarioId: usuarioId,
                pokemonId: id
            }
        });

        res.redirect('/perfil');

    } catch (error) {
        console.log(error);
        res.redirect('/perfil');
    }
}

// --- VER PERFIL (CON ESTADÍSTICAS) ---
const paginaPerfil = async (req, res) => {

    if(!req.usuario) return res.redirect('/auth/login');
    const usuarioId = req.usuario.id;

    try {
        // 1. Obtener IDs del equipo desde la BD
        const equipoRaw = await Equipo.findAll({ where: { usuarioId }, raw: true });
        const pokemonIds = equipoRaw.map(item => item.pokemonId);

        let equipo = [];
        if (pokemonIds.length > 0) {
            // Buscamos los datos básicos (nombre, imagen) en nuestra BD
            const pokemonsBD = await Pokemon.findAll({ where: { id: pokemonIds } });

            // 2. ENRIQUECER CON DATOS DE LA API (AQUÍ ESTÁ LA MAGIA)
            equipo = await Promise.all(pokemonsBD.map(async (p) => {
                try {
                    // Pedimos datos frescos a la API
                    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
                    const data = await respuesta.json();

                    return {
                        ...p.dataValues, // Mantenemos nombre e imagen de la BD
                        stats: data.stats,   // Stats de combate
                        // === AÑADIMOS ESTO ===
                        apiWeight: data.weight, // Peso de la API
                        apiHeight: data.height, // Altura de la API
                        apiTypes: data.types    // Tipos de la API (es un array)
                    };
                } catch (error) {
                    return p.dataValues;
                }
            }));
        }

        // --- 3. CÁLCULOS MATEMÁTICOS ---
        let analisis = {
            total: equipo.length,
            promedioPeso: 0,
            promedioAltura: 0,
            tipoDominante: 'Ninguno',
            tipos: {}
        };

        if (equipo.length > 0) {
            let sumaPeso = 0;
            let sumaAltura = 0;

            equipo.forEach(poke => {
                // Usamos los datos de la API (si existen), si no 0
                // La API devuelve: Peso en Hectogramos, Altura en Decímetros
                sumaPeso += poke.apiWeight || 0;
                sumaAltura += poke.apiHeight || 0;

                // Sacar el tipo principal (La API devuelve un array: [{type:{name:'fire'}}])
                let tipo = 'unknown';
                if (poke.apiTypes && poke.apiTypes.length > 0) {
                    tipo = poke.apiTypes[0].type.name; // Cogemos el primer tipo
                }

                // Contamos el tipo
                if(analisis.tipos[tipo]) analisis.tipos[tipo]++;
                else analisis.tipos[tipo] = 1;
            });

            // Promedios: Dividimos entre 10 para pasar a Kg y Metros
            analisis.promedioPeso = (sumaPeso / equipo.length / 10).toFixed(1);
            analisis.promedioAltura = (sumaAltura / equipo.length / 10).toFixed(1);

            // Buscar tipo dominante
            let maxRep = 0;
            for (const [tipo, cant] of Object.entries(analisis.tipos)) {
                if (cant > maxRep) { maxRep = cant; analisis.tipoDominante = tipo; }
            }
        }

        // 4. Rellenar huecos vacíos visuales
        while (equipo.length < 6) { equipo.push(null); }

        res.render('perfil', {
            pagina: 'Mi Perfil de Entrenador',
            equipo: equipo,
            usuario: req.usuario,
            analisis: analisis
        });

    } catch (error) {
        console.log(error);
        res.render('perfil', {
            pagina: 'Mi Perfil de Entrenador',
            equipo: [null,null,null,null,null,null],
            usuario: req.usuario,
            analisis: {}
        });
    }
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    cerrarSesion,
    capturarPokemon,
    paginaPerfil,
    soltarPokemon
}