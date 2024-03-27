const fs = require('fs');

function leerArchivo(path) {
    const data = fs.readFileSync(path);
    const Videojuegos = JSON.parse(data).Videojuegos;
    return Videojuegos;
}

function escribirArchivo(path, info) {
    const data = JSON.stringify({ 'Videojuegos': info });
    fs.writeFileSync(path, data);
}

module.exports = {
    leerArchivo,
    escribirArchivo
};
