const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

mongoose.connect(
    'mongodb+srv://admin:1234@atlascluster.zehyx4l.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster', {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB...'))
.catch(err => console.error('No se pudo conectar a MongoDB...', err));


const usuarioSchema = new mongoose.Schema({
    nombre: String,
    password: String, 
    admin: { type: Boolean, default: false }, 
    imagen: String
  }, { versionKey: false });

const Usuario = mongoose.model('Usuario', usuarioSchema);

const noticiaSchema = new mongoose.Schema({
    titulo: String,
    sinopsis: String,
    cuerpoNoticia: String,
    imagen: String
  }, { versionKey: false });
  
  const Noticia = mongoose.model('Noticia', noticiaSchema);
  

//se añade uario con nombre, password, imagen, admin es opcional
app.post('/addUsuario', async (req, res) => {
    try {
      const { nombre, password, admin, imagen } = req.body;
      const usuario = new Usuario({ nombre, password, admin, imagen });
      const nuevoUsuario = await usuario.save();
      res.send(nuevoUsuario);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // Ruta para consultar usuarios existentes o buscar
app.post('/getUsuarios', async (req, res) => {
    try {
      let { cantidad, buscar } = req.body;
      cantidad = cantidad || 30;
      buscar = buscar ? new RegExp(`.*${buscar}.*`, 'i') : null;
      let consulta = buscar ? { nombre: buscar } : {};
      const usuarios = await Usuario.find(consulta).limit(cantidad);
      const totalUsuarios = await Usuario.countDocuments();
      res.send({ usuarios, totalUsuarios });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  


//se envia el id del usario a eliminar a traves de la url
app.delete('/removeUsuario', async (req, res) => {
  try {
    const { nombre, password } = req.body;

    const usuario = await Usuario.findOne({ nombre, password });

    if (!usuario) {
      return res.status(404).send("No se encontró ningún usuario con los datos proporcionados.");
    }

    const usuarioEliminado = await Usuario.findByIdAndDelete(usuario._id);

    if (!usuarioEliminado) {
      return res.status(500).send("No se pudo eliminar el usuario.");
    }

    res.send(true);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



  // Ruta para modificar un usuario por su ID
  app.put('/updateUsuario', async (req, res) => {
    try {
      const { nombreNuevo, passwordNuevo, imagenNueva, OldNombre, OldContraseña } = req.body;
  
      const usuario = await Usuario.findOne({ nombre: OldNombre, password: OldContraseña });
  
      if (!usuario) {
        return res.status(404).send("No se encontró ningún usuario con los datos proporcionados.");
      }
  
      const updateFields = {};
      if (nombreNuevo) updateFields.nombre = nombreNuevo;
      if (passwordNuevo) updateFields.password = passwordNuevo;
      if (imagenNueva) updateFields.imagen = imagenNueva;
  
      const usuarioActualizado = await Usuario.findByIdAndUpdate(usuario._id, updateFields, { new: true });
  
      if (!usuarioActualizado) {
        return res.status(500).send("No se pudo actualizar el usuario.");
      }
  
      res.send(true);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  
  // Ruta para iniciar sesion
app.post('/siginUsuario', async (req, res) => {
    try {
      const { nombre, password } = req.body;
      const usuario = await Usuario.findOne({ nombre, password });
      if (usuario) {
        res.json({ existe: true, admin: usuario.admin });
      } else {
        res.json({ existe: false });
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  
  // Ruta para agregar una nueva noticia
app.post('/addNoticia', async (req, res) => {
    try {
      const { titulo, sinopsis, cuerpoNoticia, imagen } = req.body;
      const nuevaNoticia = new Noticia({
        titulo,
        sinopsis,
        cuerpoNoticia,
        imagen
      });
      const noticiaGuardada = await nuevaNoticia.save();
      res.send(noticiaGuardada);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

// Ruta para consultar todas las noticias
app.post('/getNoticias', async (req, res) => {
    try {
      let { cantidad, buscar } = req.body;
      cantidad = cantidad || 10;
      buscar = buscar ? new RegExp(`.*${buscar}.*`, 'i') : null;
      let consulta = buscar ? { titulo: buscar } : {};
      const noticias = await Noticia.find(consulta).limit(cantidad);
      res.send(noticias);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  

app.delete('/removeNoticia', async (req, res) => {
    try {
      const { id } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("El ID de la noticia proporcionado no es válido.");
      }
      const resultado = await Noticia.deleteOne({ _id: id });
      if (resultado.deletedCount === 0) {
        return res.status(404).send("No se encontró ninguna noticia con el ID proporcionado.");
      }
      res.send("Noticia eliminada exitosamente.");
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Escuchando en el puerto: '+port));