const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swaggerConfig');
const moment = require('moment'); // Añadido para utilizar moment

const { leerArchivo, escribirArchivo } = require('./src/files');
const { validateVideojuego } = require('./src/validator');
const { agregarCreatedAt } = require('./src/middleware');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Crear un stream de escritura para el archivo access_log.txt
const accessLogStream = fs.createWriteStream('./access_log.txt', { flags: 'a' });

app.use(morgan((tokens, req, res) => {
  // Formatear la fecha y hora en el formato deseado (YYYY/MM/DD HH:mm)
  const dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  // Obtener el tipo de método HTTP (GET, POST, PUT, DELETE, etc.)
  const tipoMetodo = tokens.method(req, res);
  // Obtener el nombre del método de la ruta solicitada
  const nombreMetodo = req.route ? req.route.path : 'unknown';
  // Obtener la ruta de la solicitud
  const ruta = tokens.url(req, res);

  // Construir y devolver la cadena de registro formateada
  return `${dateTime} [${tipoMetodo}] [${nombreMetodo}] ${ruta}\n`;
}, { stream: accessLogStream }));

/**
 * @swagger
 * /Videojuegos:
 *   get:
 *     summary: Obtener videojuegos con filtros opcionales.
 *     description: Retorna todos los videojuegos almacenados en la base de datos, con la opción de aplicar filtros por clave y valor.
 *     parameters:
 *       - in: query
 *         name: clave
 *         schema:
 *           type: string
 *         description: Clave por la cual filtrar los registros.
 *       - in: query
 *         name: valor
 *         schema:
 *           type: string
 *         description: Valor por el cual filtrar los registros.
 *     responses:
 *       200:
 *         description: Éxito. Retorna un arreglo con todos los videojuegos.
 *       500:
 *         description: Error del servidor al intentar obtener los datos.
 */
app.get('/Videojuegos', (req, res) => {
  try {
    const Videojuegos = leerArchivo('./db.json');
    const filtroClave = req.query.clave; // Obtener la clave de filtrado del query parameter
    const filtroValor = req.query.valor; // Obtener el valor de filtrado del query parameter

    let videojuegosFiltrados = Videojuegos;

    if (filtroClave && filtroValor) {
      // Filtrar los registros por la clave y valor proporcionados en el query parameter
      videojuegosFiltrados = Videojuegos.filter(videojuego => videojuego[filtroClave].toLowerCase().includes(filtroValor.toLowerCase()));
    }

    res.status(200).send(videojuegosFiltrados);
  } catch (err) {
    console.error(`Error al realizar la consulta: ${err}`);
    res.status(500).send('Error al obtener los datos');
  }
});

/**
 * @swagger
 * /Videojuegos/{id}:
 *   get:
 *     summary: Obtener un videojuego por su ID.
 *     description: Retorna el videojuego correspondiente al ID proporcionado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del videojuego a buscar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito. Retorna el videojuego correspondiente al ID.
 *       404:
 *         description: No se encontró el videojuego con el ID especificado.
 *       500:
 *         description: Error del servidor al intentar obtener el videojuego.
 */
app.get('/Videojuegos/:id', (req, res) => {
  try {
    const id = req.params.id;
    const Videojuegos = leerArchivo('./db.json');
    const videojuego = Videojuegos.find((videojuego) => videojuego.id == id);
    if (!videojuego) {
      return res.status(404).send('No se encontró el videojuego');
    }
    res.send(videojuego);
  } catch (error) {
    console.log("Error al obtener el videojuego", error);
    res.status(500).send('Error al obtener el videojuego');
  }
});

/**
 * @swagger
 * /Videojuegos/Guardarjuegos:
 *   post:
 *     summary: Agregar un nuevo videojuego a la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               genero:
 *                 type: string
 *               plataforma:
 *                 type: string
 *               lanzamiento:
 *                 type: string
 *                 format: date
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Videojuego creado satisfactoriamente.
 *       500:
 *         description: Error interno del servidor al guardar el videojuego.
 */
app.post('/Videojuegos/Guardarjuegos', validateVideojuego, agregarCreatedAt,   (req, res) => {
  try {
    const guardarVideojuego = req.body;
    let Videojuegos = leerArchivo('./db.json');
    guardarVideojuego.id = Videojuegos.length + 1;
    Videojuegos.push(guardarVideojuego);

    escribirArchivo('./db.json', Videojuegos);
    res.status(201).send(guardarVideojuego);
  } catch (error) {
    console.error("Error al guardar el videojuego", error);
    res.status(500).send('Error al guardar el videojuego');
  }
});
app.put('/Videojuegos/ActualizarFecha', (req, res) => {
  try {
    // Obtener los videojuegos almacenados
    const Videojuegos = leerArchivo('./db.json');
    
    // Obtener la fecha y hora actual
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; 
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
  
    // Formatear la fecha y hora actual
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
    // Actualizar el campo 'updated_at' de cada videojuego si es necesario
    for (const videojuego of Videojuegos) {
      if (typeof videojuego.updated_at === 'undefined' || videojuego.updated_at === '') {
        videojuego.updated_at = formattedDate;
      }
    }
  
    // Crear un objeto con los videojuegos actualizados
    const updatedJsonObject = { Videojuegos };
  
    // Escribir los videojuegos actualizados de vuelta al archivo JSON
    escribirArchivo('./db.json', JSON.stringify(updatedJsonObject, null, 2));
  
    // Enviar una respuesta con el mensaje de éxito
    res.status(200).send('Campos updated_at actualizados correctamente en todos los registros.');
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al actualizar los campos updated_at:', error);
    res.status(500).send('Error al actualizar los campos updated_at');
  }
});
/**
 * @swagger
 * /Videojuegos/:id:
 *   put:
 *     summary: Actualizar la información de un videojuego existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: ID del videojuego a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               genero:
 *                 type: string
 *               plataforma:
 *                 type: string
 *               lanzamiento:
 *                 type: string
 *                 format: date
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Videojuego actualizado satisfactoriamente.
 *       404:
 *         description: No se encontró el videojuego.
 *       500:
 *         description: Error interno del servidor al actualizar el videojuego.
 */
app.put('/Videojuegos/:id', validateVideojuego, agregarCreatedAt,  (req, res) => {
  try {
    const id = req.params.id;
    const Videojuegos = leerArchivo('./db.json');
    const index = Videojuegos.findIndex(videojuego => videojuego.id == id);
    if (index === -1) {
      return res.status(404).send('No se encontró el videojuego');
    }
    const updatedVideojuego = req.body;
    Videojuegos[index] = updatedVideojuego;
    escribirArchivo('./db.json', Videojuegos);
    res.status(200).send(updatedVideojuego);
  } catch (error) {
    console.error('Error al actualizar el videojuego:', error);
    res.status(500).send('Error al actualizar el videojuego');
  }
});

/**
 * @swagger
 * /Videojuegos/ActualizarFecha:
 *   put:
 *     summary: Actualizar el campo updated_at en todos los registros almacenados.
 *     description: Actualiza el campo updated_at con la fecha y hora actual en formato YYYY-MM-DD hh:mm en todos los registros almacenados que no tengan un valor previo en dicho campo.
 *     responses:
 *       200:
 *         description: Campos updated_at actualizados correctamente en todos los registros.
 *       500:
 *         description: Error interno del servidor al actualizar los campos updated_at.
 */



/**
 * @swagger
 * /Videojuegos/{id}:
 *   delete:
 *     summary: Eliminar un videojuego existente de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: ID del videojuego a eliminar.
 *     responses:
 *       200:
 *         description: Videojuego eliminado satisfactoriamente.
 *       404:
 *         description: No se encontró el videojuego.
 *       500:
 *         description: Error interno del servidor al eliminar el videojuego.
 */
app.delete('/Videojuegos/:id', (req, res) => {
  try {
    const id = req.params.id;
    let Videojuegos = leerArchivo('./db.json');
    Videojuegos = Videojuegos.filter(videojuego => videojuego.id != id);
    escribirArchivo('./db.json', Videojuegos);
    res.status(200).send(`Videojuego con ID ${id} eliminado correctamente`);
  } catch (error) {
    console.error('Error al eliminar el videojuego:', error);
    res.status(500).send('Error al eliminar el videojuego');
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
