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
  $$('#btnCrearNota').on('click', crearNota);
  $$('#btnGuardarNota').on('click', guardarNota);
  $$('#btnCrearCumple').on('click', crearCumple);
  $$('#btnGuardarCumple').on('click', guardarCumple);
  mostrarNotas();
  mostrarCumple();
})

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