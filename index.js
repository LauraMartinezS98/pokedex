//Importar el módulo express para crear aplicaciones web
// const express = require('express'); VERSIÓN VIEJA
import express from 'express';


//Esta la instancia de la aplicacion express
const app = express();

//definimos el puerto por defecto
const port = process.env.PORT || 3000;

//Para escuchar del puerto y ver que funciona
app.listen(port, ()=> {
    console.log(`Servidor comenzado en el puerto ${port}`);
});
