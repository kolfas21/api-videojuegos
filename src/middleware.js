const moment = require('moment');

// Middleware para agregar el campo created_at con la fecha y hora actual al cuerpo de la solicitud
const agregarCreatedAt = (req, res, next) => {
    req.body.created_at = moment().format('YYYY-MM-DD HH:mm');
    next();
};

module.exports = {
    agregarCreatedAt
};
