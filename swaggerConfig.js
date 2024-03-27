const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const router = express.Router();

const options = {
    swaggerDefinition: {
    openapi: '3.0.0',
    info: {
        title: 'API de Videojuegos',
        version: '1.0.0',
    description: 'Una API para gestionar videojuegos',
    },
    },
  apis: ['./index.js'], // Rutas que deseas documentar
};

const specs = swaggerJsdoc(options);
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(specs));

module.exports = router;
