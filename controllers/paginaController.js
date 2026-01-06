import {Viaje} from "../models/Viaje.js";
import {Testimonial} from "../models/Testimonio.js";

const paginaInicio=async (req, res) => {
    //res.send("inicio")

    const promiseDB=[];
    promiseDB.push(Viaje.findAll({limit:3}));
    promiseDB.push(Testimonial.findAll({
        limit:3,
        order: [['Id', 'DESC']],
    }));

    //Consultar 3 viajes de modelo de viaje
    try{
        const resultado = await  Promise.all(promiseDB);

        res.render('inicio', {
            pagina: 'Inicio',
            clase:'home',
            viajes: resultado[0],
            testimonios: resultado[1],
        });
    }catch(err){
        console.log(err);
    }
}

const paginaNosotros=(req, res) => {
    res.render('nosotros', {
        pagina: 'Nosotros',
    });
}

const paginaViajes= async (req, res) => {
    //Consultar la bbdd
    const viajes = await Viaje.findAll();
    console.log(viajes);

    res.render('viajes', {
        pagina: 'Viajes Disponibles',
        viajes: viajes,
    });
}

const paginaTestimonios = async (req, res) => {
    try{
        const testimonios = await Testimonial.findAll({
            limit:6,
            order: [["Id", "DESC"]],
        });
        res.render('testimonios', {
            pagina: 'Testimonios',
            testimonios: testimonios,

        });
    }catch(err){
        console.log(err);
    }
}

//Muestra una página por su detalle
const paginaDetallesViajes=async (req, res) => {
    // req.params te va a dar los :slug que ponemos al pasarlo del router
    const {slug} = req.params;
    //console.log(slug)
    //por si falla la consulta lo mejor es try catch
    try{
        //Me traigo una sola columna y lo hago con un where donde coincide el slug
        const resultado = await Viaje.findOne({where: {slug}});
        res.render('viaje', {
            pagina: 'Información del viaje',
            resultado: resultado,
        })
    }catch (error) {
        console.log(error);
    }
}

const guardarTestimonios =  async (req, res) => {

    const {nombre, correo, mensaje} = req.body;

    const errores = [];

    if (nombre.trim()===''){
        errores.push({mensaje: 'El nombre está vacío'});
    }
    if (correo.trim()===''){
        errores.push({mensaje: 'El correo está vacío'});
    }
    if (mensaje.trim()===''){
        errores.push({mensaje: 'El mensaje está vacío'});
    }

    if (errores.length>0){ //Debemos volver a la vista y mostrar los errores

        const testimonios = await Testimonial.findAll({
            limit: 6,
            order: [["Id", "DESC"]],
        });

        res.render('testimonios', {
            pagina: 'Testimonios',
            errores: errores,
            nombre: nombre,
            correo: correo,
            mensaje: mensaje,
            testimonios: testimonios,
        })
    }else{//Almacenar el mensaje en la BBDD
        try{
            await Testimonial.create({nombre: nombre, correo: correo,mensaje: mensaje,});
            res.redirect('/testimonios'); //Guardo en la base de datos y lo envío a la misma vista
        }catch(error){
            console.log(error);
        }
    }

}



export {
    paginaInicio,
    paginaNosotros,
    paginaViajes,
    paginaTestimonios,
    paginaDetallesViajes,
    guardarTestimonios,
}