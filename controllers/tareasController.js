const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.agregarTarea = async (req, res, next) => {
  
  const proyectosPromise =  Proyectos.findAll();
  const tareasPromise = Tareas.findAll();

  // Obtenemos el proyecto actual
  const proyectoPromise = Proyectos.findOne({where: {url: req.params.url}})

  const [proyectos, proyecto, tareas] = await Promise.all([proyectosPromise, proyectoPromise, tareasPromise]);

  // Leer el valor del input
  const {tarea} = req.body;

  let errores = [];

  if (!tarea) {
    errores.push({
      'texto': 'No puedes agregar una tarea vacía.'
    })
  }

  // Si hay errores
  if (errores.length > 0) {
    res.render('tareas', {
      nombrePagina: 'Tareas del Proyectos',
      proyecto,
      errores,
      proyectos,
      tareas
    })

  } else {
    // No hay errores
    // estado 0 = incompleto y ID del proyecto
    const estado = 0;
    const proyectoId = proyecto.id;

    // Insertar en la base de datos
    const resultado = await Tareas.create({tarea, estado, proyectoId})

    if(!resultado) return next();

    // Redireccionar
    res.redirect(`/proyectos/${req.params.url}`)

  }
}

exports.cambiarEstadoTarea = async (req, res, next) => {

  const { id } = req.params;
  const tarea = await Tareas.findOne({ where: {id} })

  // Cambiar el estado
  let estado = 0;

  if(tarea.estado === estado) {
    estado = 1
  }
  tarea.estado = estado;

  const resultado = await tarea.save();

  if(!resultado) return next();

  res.status(200).send('Actualizado')

}

exports.eliminarTarea = async (req, res) => {

  const { id } = req.params;

  // Eliminar la tarea
  const resultado = await Tareas.destroy({ where: { id } })

  if(!resultado) return next();

  res.status(200).send('Tarea Eliminada')

}