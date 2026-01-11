import Pokemon from "../models/Pokemon.js";
import { Comentario } from "../models/Comentario.js";

/**
 * Muestra la página de inicio con los últimos 3 comentarios
 */
const paginaInicio = async (req, res) => {
    try {
        // Consultamos solo los 3 comentarios más recientes para el feed de inicio
        const comentarios = await Comentario.findAll({
            limit: 3,
            order: [['id', 'DESC']]
        });

        res.render('inicio', {
            pagina: 'Inicio',
            clase: 'home',
            comentarios
        });
    } catch (err) {
        console.log(err);
        res.render('inicio', { pagina: 'Inicio', pokemons: [], comentarios: [] });
    }
}

const paginaNosotros = (req, res) => {
    res.render('nosotros', { pagina: 'Nosotros' });
}

/**
 * Despliega la Pokédex. Si la base de datos está vacía,
 * realiza el sembrado (seeding) inicial desde PokéAPI.
 */
const paginaPokemons = async (req, res) => {
    try {
        let pokemons = await Pokemon.findAll();

        // Lógica de Sembrado Automático
        if (pokemons.length === 0) {
            const url = 'https://pokeapi.co/api/v2/pokemon?limit=151';
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();

            const datosParaGuardar = resultado.results.map( (pokemon, index) => {
                const idReal = index + 1;
                return {
                    nombre: pokemon.name,
                    imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idReal}.png`
                };
            });

            await Pokemon.bulkCreate(datosParaGuardar);
            pokemons = await Pokemon.findAll();
        }

        res.render('pokemons', {
            pagina: 'Pokédex Nacional',
            pokemons
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
}

/**
 * Obtiene detalles específicos de un Pokémon desde la API externa
 * y traduce la descripción al español.
 */
const paginaDetallesPokemons = async (req, res) => {
    const { id } = req.params;

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await respuesta.json();

        // Formateo de datos para la vista (Mapeo de API a Objeto local)
        pokemon.imagen = pokemon.sprites.other['official-artwork'].front_default;
        pokemon.nombre = pokemon.name;
        pokemon.tipo = pokemon.types[0].type.name;

        // Obtención de la descripción en español
        const respuestaEspecie = await fetch(pokemon.species.url);
        const especie = await respuestaEspecie.json();

        const descripcionObj = especie.flavor_text_entries.find(entry => entry.language.name === 'es');
        const descripcion = descripcionObj
            ? descripcionObj.flavor_text.replace(/(\r\n|\n|\r|\f)/gm, " ")
            : "Sin descripción disponible.";

        res.render('pokemon', {
            pagina: `Detalles de ${pokemon.nombre}`,
            pokemon,
            descripcion
        });

    } catch (error) {
        console.log(error);
        res.redirect('/pokemons');
    }
}

/**
 * Gestión de Comentarios (Lectura y Guardado con Validación)
 */
const paginaComentarios = async (req, res) => {
    try {
        const comentarios = await Comentario.findAll({ limit: 6, order: [["id", "DESC"]] });
        res.render('comentarios', { pagina: 'Comentarios', comentarios });
    } catch (err) {
        console.log(err);
        res.render('comentarios', { pagina: 'Comentarios', comentarios: [] });
    }
}

const guardarComentarios = async (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    const errores = [];

    // Validación de campos obligatorios
    if (nombre.trim() === '') errores.push({ mensaje: 'El nombre está vacío' });
    if (correo.trim() === '') errores.push({ mensaje: 'El correo está vacío' });
    if (mensaje.trim() === '') errores.push({ mensaje: 'El mensaje está vacío' });

    if (errores.length > 0) {
        const comentarios = await Comentario.findAll({ limit: 6, order: [["id", "DESC"]] });
        res.render('comentarios', {
            pagina: 'Comentarios',
            errores,
            nombre,
            correo,
            mensaje,
            comentarios,
        })
    } else {
        try {
            await Comentario.create({ nombre, correo, mensaje });
            res.redirect('/comentarios');
        } catch (error) {
            console.log(error);
        }
    }
}

/**
 * Procesa la búsqueda del usuario y redirige al detalle del Pokémon
 */
const buscador = (req, res) => {
    const { termino } = req.body;

    // Validación para evitar búsquedas vacías que rompan la URL
    if (!termino || termino.trim() === "") {
        req.flash('error', 'No has introducido nada en la búsqueda');
        return res.redirect('/pokemons');
    }

    return res.redirect(`/pokemons/${termino.toLowerCase().trim()}`);
}

export {
    paginaInicio,
    paginaNosotros,
    paginaPokemons,
    paginaComentarios,
    paginaDetallesPokemons,
    guardarComentarios,
    buscador,
}