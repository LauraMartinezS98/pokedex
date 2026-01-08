import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import Equipo from '../models/Equipo.js';
import Pokemon from '../models/Pokemon.js';

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

    // Verificar existencia del usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'El Usuario no existe'}]
        });
    }

    // Validar password mediante el método del modelo
    if(!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'La Contraseña es Incorrecta'}]
        });
    }

    // Generación de JWT (Válido por 24h)
    const token = jwt.sign({
        id: usuario.id,
        nombre: usuario.nombre
    }, process.env.JWT_SECRET || 'palabraSecreta', {
        expiresIn: '1d'
    });

    // Almacenamiento seguro en Cookie (httpOnly evita acceso por JS del cliente)
    return res.cookie('_token', token, {
        httpOnly: true
    }).redirect('/');
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
    });
}

const registrar = async (req, res) => {
    const { nombre, email, password } = req.body;

    // Validaciones de servidor
    if([nombre, email, password].includes('')) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'Todos los campos son obligatorios'}]
        });
    }

    // Prevención de duplicados
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
 * GESTIÓN DEL EQUIPO POKÉMON (CRUD)
 */

const capturarPokemon = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    try {
        const pokemonIdNum = parseInt(id);

        // 1. VALIDACIÓN DE GENERACIÓN (Kanto: 1 al 151)
        if (pokemonIdNum < 1 || pokemonIdNum > 151) {
            req.flash('error', 'Este pokemon no puede ser capturado, no es de la primera generación');
            return res.redirect('/pokemons');
        }

        // 2. VALIDACIÓN DE DUPLICADOS (Evitar tener el mismo Pokémon dos veces)
        const existeEnEquipo = await Equipo.findOne({
            where: { usuarioId, pokemonId: id }
        });

        if (existeEnEquipo) {
            req.flash('error', 'Este Pokémon ya forma parte de tu equipo actual');
            return res.redirect('/pokemons'); // Regresa al detalle del pokemon o lista
        }

        // 3. VALIDACIÓN DE LÍMITE DE EQUIPO (Máximo 6)
        const conteo = await Equipo.count({ where: { usuarioId } });
        if (conteo >= 6) {
            req.flash('error', 'Tu equipo ya está lleno (máximo 6 Pokémon)');
            return res.redirect('/pokemons');
        }

        // Si pasa todas las validaciones, se crea el registro
        await Equipo.create({ usuarioId, pokemonId: id });
        res.redirect('/perfil');

    } catch (error) {
        console.error('Error al capturar Pokémon:', error);
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
        res.redirect('/perfil');
    } catch (error) {
        console.error(error);
        res.redirect('/perfil');
    }
}

/**
 * VISTA DE PERFIL Y ANÁLISIS DE DATOS
 */

const paginaPerfil = async (req, res) => {
    if(!req.usuario) return res.redirect('/auth/login');
    const usuarioId = req.usuario.id;

    try {
        // 1. Recuperar IDs del equipo del usuario
        const equipoRaw = await Equipo.findAll({ where: { usuarioId }, raw: true });
        const pokemonIds = equipoRaw.map(item => item.pokemonId);

        let equipo = [];
        if (pokemonIds.length > 0) {
            // 2. Obtener datos básicos de DB local
            const pokemonsBD = await Pokemon.findAll({ where: { id: pokemonIds } });

            // 3. Enriquecimiento de datos mediante PokéAPI (Stats, Tipos, Peso, Altura)
            equipo = await Promise.all(pokemonsBD.map(async (p) => {
                try {
                    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
                    const data = await respuesta.json();

                    return {
                        ...p.dataValues,
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

        // 4. Procesamiento de Estadísticas del Equipo
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

            // Conversión de unidades API (Hectogramos/Decímetros) a Métrico (Kg/M)
            analisis.promedioPeso = (sumaPeso / equipo.length / 10).toFixed(1);
            analisis.promedioAltura = (sumaAltura / equipo.length / 10).toFixed(1);

            // Cálculo de moda estadística para el Tipo Dominante
            let maxRep = 0;
            for (const [tipo, cant] of Object.entries(analisis.tipos)) {
                if (cant > maxRep) { maxRep = cant; analisis.tipoDominante = tipo; }
            }
        }

        // Normalización del array para la vista (siempre 6 slots)
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