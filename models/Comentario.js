import Sequelize from "sequelize";
import db from "../config/bd.js";

export const Comentario = db.define("comentarios", {
    nombre: {
        type: Sequelize.STRING
    },
    correo: {
        type: Sequelize.STRING
    },
    mensaje: {
        type: Sequelize.STRING
    },
});