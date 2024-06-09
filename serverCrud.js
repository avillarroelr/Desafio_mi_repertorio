import express from 'express';
import { logger } from 'logger-express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const PORT = 5005;

// Usando Middleware para parsear JSON
const app = express();
app.use(express.json());
app.use(logger());

// Definiendo PATHS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definiendo la ruta raiz para cargar index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

// Definiendo la ruta get que devuelve un JSON con las canciones registradas en el repertorio
app.get('/canciones', (req, res) => {
    try {
        const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
        res.status(200).json(repertorio);
    } catch (error) {
        res.status(500).json({ message: "RECURSO NO DISPONIBLE" });
    }
});

// Definiendo la ruta post para cargar cancion al directorio
app.post('/canciones', (req, res) => {
    try {
        const nuevaCancion = req.body;
        const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
        repertorio.push(nuevaCancion);
        fs.writeFileSync('repertorio.json', JSON.stringify(repertorio));
        res.status(201).send('Canción agregada exitosamente!!!');
    } catch (error) {
        res.status(500).json({ message: 'Canción no agregada', error });
    }
});

// Definiendo la ruta put que recibe los datos de una canción que se desea editar
app.put('/canciones/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, artista, tono } = req.body;
        const repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
        const index = repertorio.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            repertorio[index] = { id: parseInt(id), titulo, artista, tono };
            fs.writeFileSync('repertorio.json', JSON.stringify(repertorio));
            res.status(200).send('Canción actualizada exitosamente!!!');
        } else {
            res.status(404).json({ message: 'Canción no encontrada!!!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Canción no encontrada!!!', error });
    }
});

// Definiendo la ruta delete que recibe el id de una canción y la elimina del repertorio
app.delete('/canciones/:id', (req, res) => {
    try {
        const { id } = req.params;
        let repertorio = JSON.parse(fs.readFileSync('repertorio.json', 'utf8'));
        const index = repertorio.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            repertorio = repertorio.filter(c => c.id !== parseInt(id));
            fs.writeFileSync('repertorio.json', JSON.stringify(repertorio));
            res.status(200).send('CANCION ELIMINADA EXITOSAMENTE!!!');
        } else {
            res.status(404).json({ message: 'CANCION NO ENCONTRADA!!!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'CANCION NO ELIMINADA!!!', error });
    }
});

// Estableciendo configuración del servidor
app.listen(PORT, () => {
    console.log(`¡¡SERVER ONLINE!! http://localhost:${PORT}`);
});
