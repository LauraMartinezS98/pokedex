import { DataTypes } from 'sequelize';
import db from '../config/bd.js';

const Equipo = db.define('equipos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pokemonId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default Equipo;