import Pokemon from "../models/Pokemon.js";
import { Comentario } from "../models/Comentario.js";

// --- PÁGINA DE INICIO ---
const paginaInicio = async (req, res) => {
    try {
        const promiseDB = [
            Comentario.findAll({ limit: 3, order: [['id', 'DESC']] })
        ];

        const [ comentarios] = await Promise.all(promiseDB);

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

// --- PÁGINA NOSOTROS ---
const paginaNosotros = (req, res) => {
    res.render('nosotros', { pagina: 'Nosotros' });
}

// --- PÁGINA POKEMONS (TIENDA) ---
// La hemos renombrado para que coincida con tu temática
const paginaPokemons = async (req, res) => {

    let pokemons = [];

    try {
        // 1. Leer de BBDD
        pokemons = await Pokemon.findAll();

        // 2. Si BBDD vacía, llamar a PokéAPI
        if (pokemons.length === 0) {
            console.log("BBDD vacía. Capturando 151 Pokémons...");

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

    } catch (error) {
        console.log(error);
    }

    // Renderizamos 'pokemons' (porque vi en tu foto que tienes el archivo pokemons.pug)
    res.render('pokemons', {
        pagina: 'Pokédex Nacional',
        pokemons: pokemons,
    });
}

// --- DETALLE ---
const paginaDetallesPokemons = async (req, res) => {
    const { id } = req.params;

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await respuesta.json();

        // --- AÑADE ESTAS LÍNEAS EXACTAMENTE AQUÍ ---

        // 1. Arreglar Imagen
        pokemon.imagen = pokemon.sprites.other['official-artwork'].front_default;

        // 2. Arreglar Nombre
        pokemon.nombre = pokemon.name;

        // 3. ARREGLAR TIPO (¡Esta es la que te falta!)
        // Cogemos el primer tipo de la lista para que la vista lo entienda
        pokemon.tipo = pokemon.types[0].type.name;

        // -------------------------------------------

        const respuestaEspecie = await fetch(pokemon.species.url);
        const especie = await respuestaEspecie.json();

        const descripcionObj = especie.flavor_text_entries.find(entry => entry.language.name === 'es');
        const descripcion = descripcionObj ? descripcionObj.flavor_text.replace(/(\r\n|\n|\r|\f)/gm, " ") : "Sin descripción disponible.";

        res.render('pokemon', {
            pagina: `Detalles de ${pokemon.nombre}`,
            pokemon: pokemon,
            descripcion: descripcion
        });

    } catch (error) {
        console.log(error);
        res.redirect('/pokemons');
    }
}
// --- COMENTARIOS ---
const paginaComentarios = async (req, res) => {
    try {
        const comentarios = await Comentario.findAll({ limit: 6, order: [["id", "DESC"]] });
        res.render('comentarios', { pagina: 'Comentarios', comentarios: comentarios });
    } catch (err) {
        console.log(err);
        res.render('comentarios', { pagina: 'Comentarios', comentarios: [] });
    }
}

const guardarComentarios = async (req, res) => {
    const { nombre, correo, mensaje } = req.body;
    const errores = [];
    if (nombre.trim() === '') errores.push({ mensaje: 'El nombre está vacío' });
    if (correo.trim() === '') errores.push({ mensaje: 'El correo está vacío' });
    if (mensaje.trim() === '') errores.push({ mensaje: 'El mensaje está vacío' });

    if (errores.length > 0) {
        const comentarios = await Comentario.findAll({ limit: 6, order: [["id", "DESC"]] });
        res.render('comentarios', {
            pagina: 'Comentarios',
            errores: errores,
            nombre: nombre,
            correo: correo,
            mensaje: mensaje,
            comentarios: comentarios,
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


const buscador = (req, res) => {
    const { termino } = req.body;
    if(!termino) return res.redirect('back');
    // Redirigimos al detalle del pokemon
    res.redirect(`/pokemons/${termino.toLowerCase()}`);
}

// --- EXPORTACIÓN CORRECTA ---
export {
    paginaInicio,
    paginaNosotros,
    paginaPokemons,
    paginaComentarios,
    paginaDetallesPokemons,
    guardarComentarios,
    buscador,
}