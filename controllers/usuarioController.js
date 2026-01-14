import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import Pokemon from '../models/Pokemon.js';
import Equipo from '../models/Equipo.js';

/**
 * GESTIÓN DE AUTENTICACIÓN
 */

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    });
}

const autenticar = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'El Usuario no existe'}]
        });
    }

    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'La Contraseña es Incorrecta'}]
        });
    }

    const token = jwt.sign({
        id: usuario.id,
        nombre: usuario.nombre
    }, process.env.JWT_SECRET || 'palabraSecreta', {
        expiresIn: '1d'
    });

    return res.cookie('_token', token, {
        httpOnly: true
    }).redirect('/'); // Redirige a la página de inicio pública
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    });
}

const registrar = async (req, res) => {
    const { nombre, email, password } = req.body;

    if([nombre, email, password].includes('')) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Todos los campos son obligatorios'}]
        });
    }

    const existeUsuario = await Usuario.findOne({ where: { email } });
    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Ese correo ya está registrado'}]
        });
    }

    try {
        await Usuario.create({ nombre, email, password });
        req.flash('exito', 'Has creado tu cuenta correctamente. Ya puedes iniciar sesión.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Error interno al crear el usuario'}]
        });
    }
}

const cerrarSesion = (req, res) => {
    res.clearCookie('_token').redirect('/auth/login');
}

/**
 * GESTIÓN DEL EQUIPO POKÉMON
 */

const capturarPokemon = async (req, res) => {
    const { id } = req.params;

    // Validación de sesión activa
    if (!req.usuario) {
        req.flash('error', 'Debes iniciar sesión para capturar un Pokémon');
        return res.redirect('/auth/login');
    }

    const usuarioId = req.usuario.id;

    try {
        const pokemonIdNum = parseInt(id);

        if (pokemonIdNum < 1 || pokemonIdNum > 151) {
            req.flash('error', 'Este Pokémon no es de la primera generación');
            return res.redirect('/pokemons');
        }

        const existeEnEquipo = await Equipo.findOne({
            where: { usuarioId, pokemonId: id }
        });

        if (existeEnEquipo) {
            req.flash('error', 'Ya tienes a este Pokémon en tu equipo');
            return res.redirect('/pokemons');
        }

        const conteo = await Equipo.count({ where: { usuarioId } });
        if (conteo >= 6) {
            req.flash('error', 'Tu equipo está lleno (máximo 6)');
            return res.redirect('/auth/perfil');
        }

        await Equipo.create({ usuarioId, pokemonId: id });
        res.redirect('/auth/perfil');

    } catch (error) {
        console.error('Error en capturarPokemon:', error);
        res.redirect('/pokemons');
    }
}

const soltarPokemon = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
        await Equipo.destroy({
            where: { usuarioId, pokemonId: id }
        });
        res.redirect('/auth/perfil');
    } catch (error) {
        console.error(error);
        res.redirect('/auth/perfil');
    }
}

/**
 * VISTA DE PERFIL Y ANÁLISIS DE DATOS
 */

const paginaPerfil = async (req, res) => {
    if(!req.usuario) return res.redirect('/auth/login');
    const usuarioId = req.usuario.id;

    try {
        const equipoRaw = await Equipo.findAll({ where: { usuarioId }, raw: true });
        const pokemonIds = equipoRaw.map(item => item.pokemonId);

        let equipo = [];
        if (pokemonIds.length > 0) {
            const pokemonsBD = await Pokemon.findAll({ where: { id: pokemonIds } });

            equipo = await Promise.all(pokemonsBD.map(async (p) => {
                try {
                    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
                    const data = await respuesta.json();

                    return {
                        //Los datos de la BBDD
                        ...p.dataValues,
                        //Los datos de la API
                        stats: data.stats,
                        apiWeight: data.weight,
                        apiHeight: data.height,
                        apiTypes: data.types
                    };
                } catch (error) {
                    return p.dataValues;
                }
            }));
        }

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
                sumaPeso += poke.apiWeight || 0;
                sumaAltura += poke.apiHeight || 0;

                const tipo = poke.apiTypes?.[0]?.type?.name || 'unknown';
                analisis.tipos[tipo] = (analisis.tipos[tipo] || 0) + 1;
            });

            analisis.promedioPeso = (sumaPeso / equipo.length / 10).toFixed(1);
            analisis.promedioAltura = (sumaAltura / equipo.length / 10).toFixed(1);

            let maxRep = 0;
            for (const [tipo, cant] of Object.entries(analisis.tipos)) {
                if (cant > maxRep) { maxRep = cant; analisis.tipoDominante = tipo; }
            }
        }

        while (equipo.length < 6) { equipo.push(null); }

        res.render('perfil', {
            pagina: 'Mi Perfil de Entrenador',
            equipo,
            usuario: req.usuario,
            analisis
        });

    } catch (error) {
        console.error(error);
        res.render('perfil', {
            pagina: 'Mi Perfil de Entrenador',
            equipo: Array(6).fill(null),
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