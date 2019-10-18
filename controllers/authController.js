// AuthController.js
const passport = require('passport');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt-nodejs');
const Op = Sequelize.Op;

const Usuarios = require('../models/Usuarios');

const enviarEmail = require('../handlers/email');

// Autenticar al usuario
exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios'
})

// Funcion para revisar que el usuario este logueado o no
exports.usuarioAutenticado = (req, res, next) => {

  // Si el usuario está autenticado, adelante
  if(req.isAuthenticated()) {
    return next();
  }

  // Si no está autenticado, redirigir al login
  return res.redirect('/iniciar-sesion')
}

// Funcion para cerrar sesión
exports.cerrarSesion = (req, res) => {

  req.session.destroy(() => {
    res.redirect('/iniciar-sesion'); // Al cerrar sesión nos lleva al login
  })

}

// Genera un token si el usuario es válido
exports.enviarToken = async (req, res) => {

  // Verificar que el usuario existe
  const {email} = req.body;
  const usuario = await Usuarios.findOne({ where: { email } })

  // Si no existe el usuario
  if(!usuario) {
    req.flash('error', 'No existe esa cuenta');
    res.redirect('/reestablecer')
  }

  // Usuario existe
  usuario.token = crypto.randomBytes(20).toString('hex');
  usuario.expiracion = Date.now() + 3600000;

  // Guardarlos en la DB
  await usuario.save();

  // Url de reset
  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
  
  // Envía el correo con el token
  await enviarEmail.enviar({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'reestablecer-password'
  })

  // Redirigir
  req.flash('correcto', 'Se envió un mensaje a tu correo');
  res.redirect('/reestablecer')

}

exports.validarToken = async (req, res) => {

  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token
    } 
  });

  // Sino encuenta al usuario
  if(!usuario) {
    req.flash('error', 'No válido');
    res.redirect('/reestablecer');
  }

  // Form para reiniciar el password
  res.render('resetPassword', {
    nombrePagina: 'Reestablecer Contraseña'
  });

}

// Cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
  
  // Verifica el token válido pero también la fecha de expiración
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
      expiracion: {
        [Op.gte] : Date.now()
      }
    }
  });

  // Verificamos si el usuario existe
  if(!usuario) {
    req.flash('error', 'No Válido'),
    res.redirect('/reestablecer')
  }

  // Hashear el password
  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  // Guardamos el nuevo password
  await usuario.save();

  // Redirigir
  req.flash('correcto', 'Tu password se ha modificado correctamente')
  res.redirect('/iniciar-sesion')


}