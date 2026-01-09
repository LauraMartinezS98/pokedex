import Usuario from './Usuario.js';
import Pokemon from './Pokemon.js';
import Equipo from './Equipo.js';

// Relación Muchos a Muchos entre Usuario y Pokemon a través de Equipo
Usuario.belongsToMany(Pokemon, { through: Equipo, foreignKey: 'usuarioId' });
Pokemon.belongsToMany(Usuario, { through: Equipo, foreignKey: 'pokemonId' });

// Definición de pertenencia para que Equipo pueda usar belongsTo (opcional pero recomendado)
Equipo.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Equipo.belongsTo(Pokemon, { foreignKey: 'pokemonId' });

export {
    Equipo
};