const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.proyectosHome = async (req, res) => {

  // console.log(res.locals.usuario);

  const UsuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({ where: { UsuarioId }});

  res.render('index', {
    nombrePagina: 'Proyectos',
    proyectos
  });


}

exports.formularioProyecto = async (req, res) => {

  const UsuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({ where: { UsuarioId }});

  res.render('nuevoProyecto', {
    nombrePagina: 'Nuevo Proyecto',
    proyectos
  })
}

exports.nuevoProyecto = async (req, res) => {
  
  const UsuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({ where: { UsuarioId }});

  // Validar inputs
  const { nombre } = req.body;

  let errores = [];

  if (!nombre) {
    errores.push({
      'texto': 'Agrega un nombre al proyecto'
    })
  }

  // Si hay errores
  if (errores.length > 0) {
    res.render('nuevoProyecto', {
      nombrePagina: 'Nuevo Proyecto',
      errores,
      proyectos
    })
  } else {
    // No hay errores
    // Insertar en la DB
    const UsuarioId = res.locals.usuario.id;
    await Proyectos.create({ nombre, UsuarioId });
    res.redirect('/');

  }
}

exports.proyectoPorUrl = async (req, res, next) => {

  const UsuarioId = res.locals.usuario.id;
  const proyectosPromise = Proyectos.findAll({ where: { UsuarioId }});

  const proyectoPromise = Proyectos.findOne({
    where: {
      url: req.params.url,
      UsuarioId
    }
  })

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

  // Consultar tareas del proyecto actual
  const tareas = await Tareas.findAll({
    where: {
      proyectoId: proyecto.id
    }
  })


  if(!proyecto) return next();

  // render a la vista
  res.render('tareas', {
    nombrePagina: 'Tareas del Proyectos',
    proyecto,
    proyectos,
    tareas
  })

}

exports.formularioEditar = async (req, res) => {

  const UsuarioId = res.locals.usuario.id;
  const proyectosPromise = Proyectos.findAll({ where: { UsuarioId }});

  const proyectoPromise = Proyectos.findOne({
    where: {
      id: req.params.id,
      UsuarioId
    }
  })

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

  // render a la vista
  res.render('nuevoProyecto', {
    nombrePagina: 'Editar Proyecto',
    proyecto,
    proyectos
  })

}

exports.actualizarProyecto = async (req, res) => {
  
  const UsuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({ where: { UsuarioId }});

  // Validar inputs
  const { nombre } = req.body;

  let errores = [];

  if (!nombre) {
    errores.push({
      'texto': 'Agrega un nombre al proyecto'
    })
  }

  // Si hay errores
  if (errores.length > 0) {
    res.render('nuevoProyecto', {
      nombrePagina: 'Editar Proyecto',
      errores,
      proyectos
    })
  } else {
    // No hay errores
    // Insertar en la DB
    await Proyectos.update({ nombre }, { where: { id: req.params.id } });
    res.redirect('/');

  }
}

exports.eliminarProyecto = async (req, res, next) => {
  // req, query o params
  // console.log(req.params);

  const {urlProyecto} = req.query;

  const resultado = await Proyectos.destroy({
    where: {
      url: urlProyecto
    }
  })

  if(!resultado) return next();

  res.status(200).send('Proyecto Eliminado Correctamente.')

}