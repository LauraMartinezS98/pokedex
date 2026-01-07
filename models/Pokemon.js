import { DataTypes } from 'sequelize';
import db from '../config/bd.js';

const Pokemon = db.define('pokemons', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    imagen: {
        type: DataTypes.STRING
    }
});

export default Pokemon;