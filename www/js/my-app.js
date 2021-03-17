// ---------------------------------- VARIABLES GLOBALES ----------------------------------
var $$ = Dom7;

var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
      swipe: 'left',
    },
    routes: [
      { path: '/', url: 'index.html', },
      { path: '/perfil/', url: 'perfil.html', },
    ]
  });

var mainView = app.views.create('.view-main');
var router = mainView.router;
var userEmail = '';
var idparaeditar ='';
let calendarCumple;

// ---------------------------------- INDEX ----------------------------------

$$(document).on('page:init', '.page[data-name="index"]', function (e) {
  $$('#btnIngresar').on('click', loguearUsuario);
  $$('#btnRegistrar').on('click', registrarUsuario);
})

// ---------------------------------- FUNCIONES DEL INDEX ----------------------------------
function registrarUsuario() {
  const email = $$(emailReg).val();
  const pass = $$(passReg).val();
  console.log('holaaaa registro');
  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then((user) => {
      app.loginScreen.close($$('.register'), true);
    })
    .catch((error) => {
      console.log('Error: ' + error.message + ' [' + error.code + ']');
    });
}

function loguearUsuario() {
  const email = $$(emailLog).val();
  const pass = $$(passLog).val();
  console.log('holaaaa login');
  firebase.auth().signInWithEmailAndPassword(email, pass)
  .then((user) => {
    userEmail = email;
    app.loginScreen.close($$('.login'), true);
    router.navigate('/perfil/');
  })
  .catch((error) => {
    console.log('Error: ' + error.message + ' [' + error.code + ']');
  });
}

// ---------------------------------- PERFIL ----------------------------------

$$(document).on('page:init', '.page[data-name="perfil"]', function (e) {
  calendarCumple = app.calendar.create({
    inputEl: '#cumpleCalendar',
    openIn: 'customModal',
    header: true,
    footer: true,
  });
  edCalendarCumple = app.calendar.create({
    inputEl: '#edCumpleCalendar',
    openIn: 'customModal',
    header: true,
    footer: true,
  });
  calendarTurno = app.calendar.create({
    inputEl: '#turnoCalendar',
    timePicker: true,
    dateFormat: { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
  });
  edCalendarTurno = app.calendar.create({
    inputEl: '#edTurnoCalendar',
    timePicker: true,
    dateFormat: { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
  });

  $$('#btnCrearNota').on('click', crearNota);
  $$('#btnGuardarNota').on('click', guardarNota);
  $$('#btnCrearCumple').on('click', crearCumple);
  $$('#btnGuardarCumple').on('click', guardarCumple);
  $$('#btnCrearPasti').on('click', crearPasti);
  $$('#btnGuardarPasti').on('click', guardarPasti);
  $$('#btnCrearTurno').on('click', crearTurno);
  $$('#btnGuardarTurno').on('click', guardarTurno);

  mostrarNotas();
  mostrarCumple();
  mostrarPasti();
  mostrarTurno();
})

// ---------------------------------- FUNCIONES TURNOS ----------------------------------

function crearTurno() {
  const medico = $$('#turnoMedico').val();
  const lugar = $$('#turnoLugar').val();
  const consulta = $$('#turnoConsulta').val();
  const fecha = $$('#turnoCalendar').val();
  firebase.firestore().collection('turnos').add({
    turnoEmail: userEmail,
    turnoMedico: medico,
    turnoLugar: lugar,
    turnoConsulta: consulta,
    turnoFecha: fecha
  })
  .then(() => {
    console.log('Carga exitosa! ');
    mostrarTurno();
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
  $$('#turnoMedico').val('');
  $$('#turnoLugar').val('');
  $$('#turnoConsulta').val('');
  $$('#turnoCalendar').val('');
}

function mostrarTurno() {
  const queryTurnos = firebase.firestore().collection('turnos').where('turnoEmail', '==', userEmail);
  queryTurnos.get()
  .then((querySnapshot) => {
    $$('#turnoTablero').html('');
    querySnapshot.forEach((doc) => {
      $$('#turnoTablero').append('<div id="' +
      doc.id + '" class="turnos col-100 row popup-open editarTurno" data-popup=".editarturno-popup">' +
      doc.data().turnoMedico + '  ' + '[' + doc.data().turnoFecha + ']' +
      '</div>');
    });
    $$('.editarTurno').on('click', editarTurno);
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
  });
}

function editarTurno() {
  $$('.btnBorrarTurno').on('click', borrarTurno);
  idparaeditar = this.id;
  firebase.firestore().collection('turnos').doc(idparaeditar).get()
  .then((doc) => {
    $$('#edTurnoMedico').val(doc.data().turnoMedico);
    $$('#edTurnoLugar').val(doc.data().turnoLugar);
    $$('#edTurnoConsulta').val(doc.data().turnoConsulta);
    $$('#edTurnoCalendar').val(doc.data().turnoCalendar);
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}

function guardarTurno() {
  const medico = $$('#edTurnoMedico').val();
  const lugar = $$('#edTurnoLugar').val();
  const consulta = $$('#edTurnoConsulta').val();
  const fecha = $$('#edTurnoCalendar').val();
  firebase.firestore().collection('turnos').doc(idparaeditar).update({
    turnoMedico: medico,
    turnoLugar: lugar,
    turnoConsulta: consulta,
    turnoFecha: fecha
  })
  .then(() => {
    mostrarTurno();
  })
  .catch((error) => {
    console.log("Error: " + error);
  });
}

function borrarTurno() {
  firebase.firestore().collection('turnos').doc(idparaeditar).delete()
  .then(() => {
    mostrarTurno();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
}

// ---------------------------------- FUNCIONES PASTILLERO ----------------------------------
function crearPasti() {
  $$('#pastiMedicamento').val('');
  $$('#pastiDosis').val('');
  $$('#pastiHorario').val('');
  $$('input[name="pastiDias"]').prop('checked', false);
  var dias = [];
  $$('[name="pastiDias"]:checked').map((dia) => {
    dias.push(dia.value);
  });
  const medicamento = $$('#pastiMedicamento').val();
  const dosis = $$('#pastiDosis').val();
  const horario = $$('#pastiHorario').val();
  firebase.firestore().collection('medicamentos').add({
    pastiEmail: userEmail,
    pastiMedicamento: medicamento,
    pastiDosis: dosis,
    pastiHorario: horario,
    pastiDias: dias
  })
  .then(() => {
    console.log('Carga exitosa! ');
    mostrarPasti();
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
}

function mostrarPasti() {
  const queryPastis = firebase.firestore().collection('medicamentos').where('pastiEmail', '==', userEmail);
  queryPastis.get()
  .then((querySnapshot) => {
    $$('#pastiTablero').html('');
    querySnapshot.forEach((doc) => {
      $$('#pastiTablero').append('<div id="' +
      doc.id + '" class="pastis col-100 row popup-open editarPasti" data-popup=".editarpasti-popup">' +
      doc.data().pastiHorario + '   ' + doc.data().pastiMedicamento + '[' + doc.data().pastiDosis + ']' +
      '</div>');
    });
    $$('.editarPasti').on('click', editarPasti);
  })
  .catch((error) => {
    console.log("Error en mostrarPasti: ", error);
  });
}

function editarPasti() {
  $$('#edPastiMedicamento').val('');
  $$('#edPastiDosis').val('');
  $$('#edPastiHorario').val('');
  $$('input[name="edPastiDias"]').prop('checked', false);
  $$('.btnBorrarPasti').on('click', borrarPasti);
  idparaeditar = this.id;
  firebase.firestore().collection('medicamentos').doc(idparaeditar).get()
  .then((doc) => {
    $$('#edPastiMedicamento').val(doc.data().pastiMedicamento);
    $$('#edPastiDosis').val(doc.data().pastiDosis);
    $$('#edPastiHorario').val(doc.data().pastiHorario);
    doc.data().pastiDias.map((pastidia) => {
      $$('input[name="edPastiDias"][value="' + pastidia + '"]').prop('checked', true);
    });
  })
  .catch((error) => {
      console.log("Error cargando pasti en editarPasti ", error);
  });
}

function guardarPasti() {
  var dias = [];
  $$('[name="edPastiDias"]:checked').map((dia) => {
    dias.push(dia.value);
  });
  const medicamento = $$('#edPastiMedicamento').val();
  const dosis = $$('#edPastiDosis').val();
  const horario = $$('#edPastiHorario').val();
  firebase.firestore().collection('medicamentos').doc(idparaeditar).update({
    pastiMedicamento: medicamento,
    pastiDosis: dosis,
    pastiHorario: horario,
    pastiDias: dias
  })
  .then(() => {
    console.log('se grabooo chamannn');
    mostrarPasti();
  })
  .catch((error) => {
    console.log("Error al guardarPasti: " + error);
  });
}

function borrarPasti() {
  firebase.firestore().collection('medicamentos').doc(idparaeditar).delete()
  .then(() => {
    mostrarPasti();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
}

// ---------------------------------- FUNCIONES CUMPLEAÑOS ----------------------------------

function crearCumple() {
  const nombre = $$('#cumpleNombre').val();
  const relacion = $$('#cumpleRelacion').val();
  const fecha = $$('#cumpleCalendar').val();
  firebase.firestore().collection('cumpleaños').add({
    cumpleEmail: userEmail,
    cumpleNombre: nombre,
    cumpleRelacion: relacion,
    cumpleFecha: fecha
  })
  .then(() => {
    console.log('Carga exitosa! ');
    mostrarCumple();
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
  $$('#cumpleNombre').val('');
  $$('#cumpleRelacion').val('');
  $$('#cumpleCalendar').val('');
}

function mostrarCumple() {
  const queryCumples = firebase.firestore().collection('cumpleaños').where('cumpleEmail', '==', userEmail);
  queryCumples.get()
  .then((querySnapshot) => {
    $$('#cumpleTablero').html('');
    querySnapshot.forEach((doc) => {
      $$('#cumpleTablero').append('<div id="' +
      doc.id + '" class="cumples col-100 row popup-open editarCumple" data-popup=".editarcumple-popup">' +
      doc.data().cumpleFecha + '   ' + doc.data().cumpleNombre + '[' + doc.data().cumpleRelacion + ']' +
      '</div>');
    });
    $$('.editarCumple').on('click', editarCumple);
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
  });
}

function editarCumple() {
  $$('.btnBorrarCumple').on('click', borrarCumple);
  idparaeditar = this.id;
  firebase.firestore().collection('cumpleaños').doc(idparaeditar).get()
  .then((doc) => {
    $$('#edCumpleNombre').val(doc.data().cumpleNombre);
    $$('#edCumpleRelacion').val(doc.data().cumpleRelacion);
    $$('#edCumpleCalendar').val(doc.data().cumpleCalendar);
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}

function guardarCumple() {
  const nombre = $$('#edCumpleNombre').val();
  const relacion = $$('#edCumpleRelacion').val();
  const fecha = $$('#edCumpleCalendar').val();
  firebase.firestore().collection('cumpleaños').doc(idparaeditar).update({
    cumpleNombre: nombre,
    cumpleRelacion: relacion,
    cumpleFecha: fecha
  })
  .then(() => {
    mostrarCumple();
  })
  .catch((error) => {
    console.log("Error: " + error);
  });
}

function borrarCumple() {
  firebase.firestore().collection('cumpleaños').doc(idparaeditar).delete()
  .then(() => {
    mostrarCumple();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
}

// ---------------------------------- FUNCIONES ANOTADOR ----------------------------------

function crearNota() {
  const titulo = $$('#notaTitulo').val();
  const contenido = $$('#notaContenido').val();
  firebase.firestore().collection('notas').add({
    notaEmail: userEmail,
    notaTitulo: titulo,
    notaContenido: contenido
  })
  .then(() => {
    console.log('Carga exitosa! ');
    mostrarNotas();
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
  $$('#notaTitulo').val('');
  $$('#notaContenido').val('');
}

function mostrarNotas() {
  const queryNotas = firebase.firestore().collection('notas').where('notaEmail', '==', userEmail);
  queryNotas.get()
  .then((querySnapshot) => {
    $$('#notasTablero').html('');
    querySnapshot.forEach((doc) => {
      $$('#notasTablero').append('<div id="' +
      doc.id + '" class="notas col-50 row popup-open btnEditarNota" data-popup=".editarnota-popup"><div class="col-80">' +
      '<span class="titunota col-100">' + doc.data().notaTitulo + '</span>' +
      '<p class="col-100">' + doc.data().notaContenido + '</p></div>' +
      '<div class="col-20">' +
      '</div></div>');
    });
    $$('.btnEditarNota').on('click', editarNota);
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}

function editarNota() {
  $$('.btnBorrarNota').on('click', borrarNota);
  idparaeditar = this.id;
  firebase.firestore().collection('notas').doc(idparaeditar).get()
  .then((doc) => {
    $$('#edNotaTitulo').val(doc.data().notaTitulo);
    $$('#edNotaContenido').val(doc.data().notaContenido);
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
  });
}

function guardarNota() {
  const titulo = $$('#edNotaTitulo').val();
  const contenido = $$('#edNotaContenido').val();
  firebase.firestore().collection('notas').doc(idparaeditar).update({
    notaTitulo: titulo,
    notaContenido: contenido
  })
  .then(() => {
    mostrarNotas();
  })
  .catch((error) => {
    console.log("Error: " + error);
  });
}

function borrarNota() {
  firebase.firestore().collection('notas').doc(idparaeditar).delete()
  .then(() => {
    mostrarNotas();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
}





/* SOLUCION PARA REFRESCAR PANTALLA TODOS LOS DIAS A LAS 00.00, CON UN INTERVAL CADA 1 MINUTO
var dia = new Date();
var hs = dia.getHours();
var min = dia.getMinutes();
var sec = dia.getSeconds();
if (hs === 0 && min === 0 && sec < 60) {
  //refrescar pantalla
}*/