import Usuario from './Usuario.js';
import Pokemon from './Pokemon.js';
import Equipo from './Equipo.js';

// Establecer la relación Muchos a Muchos
// Un Usuario tiene muchos Pokemons a través de Equipo
Usuario.belongsToMany(Pokemon, {
    through: Equipo,
    foreignKey: 'usuarioId', // La llave en la tabla Equipo que apunta a Usuario
    otherKey: 'pokemonId'    // La llave en la tabla Equipo que apunta a Pokemon
});

// Un Pokemon puede ser de muchos Usuarios
Pokemon.belongsToMany(Usuario, {
    through: Equipo,
    foreignKey: 'pokemonId',
    otherKey: 'usuarioId'
});

export {
    Usuario,
    Pokemon,
    Equipo
}