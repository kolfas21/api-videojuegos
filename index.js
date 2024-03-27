const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swaggerConfig');
const { leerArchivo, escribirArchivo } = require('./src/files');
const { validateVideojuego } = require('./src/validator');

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


/**
 * @swagger
 * /Videojuegos:
 *   get:
 *     summary: Obtener todos los videojuegos.
 *     description: Retorna todos los videojuegos almacenados en la base de datos.
 *     responses:
 *       200:
 *         description: Éxito. Retorna un arreglo con todos los videojuegos.
 *       500:
 *         description: Error del servidor al intentar obtener los datos.
 */

app.get('/Videojuegos', (req, res) => {
  try{
    const Videojuegos = leerArchivo('./db.json');
    res.send(Videojuegos)
    }catch(error){
    console.log("Error al enviar los datos", error)
    res.status(500).send('Error al enviar los datos')
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
  try{
  const id = req.params.id;
  const Videojuegos = leerArchivo('./db.json');
  const videojuego = Videojuegos.find((videojuego) => videojuego.id == id);
  if (!videojuego) {
    return res.status(404).send('No se encontro el videojuego')    
  }
  res.send(videojuego)
}catch(error){
  console.log("Error al obtener el videojuego", error)
  res.status(500).send('Error al aobtener el videojuego')
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
app.post('/Videojuegos/Guardarjuegos', validateVideojuego, (req, res) => {
  try{
  const guardarVideojuego = req.body
  let Videojuegos = leerArchivo('./db.json')
  guardarVideojuego.id = Videojuegos.length +1
  Videojuegos.push(guardarVideojuego)

  escribirArchivo('./db.json', Videojuegos)
      res.status(201).send(guardarVideojuego)
} catch(error){
  console.error("Error al guardar el videojuego", error)
  res.status(500).send('Error al guardar el videojuego')
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
app.put('/Videojuegos/:id', validateVideojuego, (req, res) => {
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
})