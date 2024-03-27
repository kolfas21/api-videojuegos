const Joi = require('joi');
const { leerArchivo } = require('./files');

const videojuegoSchema = Joi.object({
    "id": Joi.number().integer(),
    "titulo": Joi.string().required(),
    "plataforma": Joi.string().required(),
    "genero": Joi.string().required(),
    "lanzamiento": Joi.date().iso().required(),
    "estudio": Joi.string().required(),
    "modo de juego": Joi.string().required(),
    "precio venta": Joi.string().required(),
});

function validateVideojuego(req, res, next) {
    try {
        const videojuegoData = req.body;

        // Verificar si el videojuego ya existe en los datos recibidos
        const Videojuegos = leerArchivo('./db.json');
        const videojuegoExistente = Videojuegos.find(vj => vj.titulo === videojuegoData.titulo);
        if (videojuegoExistente) {
            return res.status(400).send('El videojuego ya existe');
        }

        // Validar el cuerpo de la solicitud utilizando Joi
        const { error } = videojuegoSchema.validate(videojuegoData);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        next();
    } catch (error) {
        res.status(500).send('Error al validar el videojuego');
    }
}

module.exports = {
    validateVideojuego
};
