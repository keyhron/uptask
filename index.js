const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Config
const passport = require('./config/passport');

// Variables de entorno
require("dotenv").config({ path: "variables.env" });

// Helpers con algunas funciones
const helpers = require('./helpers');

// Crear la conexión a la DB
const db = require('./config/db');

// Importar los modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
  .then(() => console.log('Conectado al servidor'))
  .catch((err) => console.log(err));

// Crear una app de express
const app = express();

// Donde cargar los archivos estaticos
app.use(express.static('public'));

// Habilitar pug
app.set('view engine', 'pug');

// Habilitar bodyParser para leer datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Añadir carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

app.use(cookieParser());

// Sesiones nos permite navegar en distintas páginas sin volvernos a autenticar
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Agregar flash messages
app.use(flash());

// Pasar var dumb a la app
app.use((req, res, next) => {
  res.locals.vardump = helpers.vardump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = {...req.user} || null;
  next();
  
});

app.use('/', routes());
 
// Servidor y Puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
  console.log('DB Conectada')
})