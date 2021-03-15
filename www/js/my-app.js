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

$$(document).on('page:init', '.page[data-name="index"]', function (e) {
  $$('#btnIngresar').on('click', loguearUsuario);
  $$('#btnRegistrar').on('click', registrarUsuario);
})

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

$$(document).on('page:init', '.page[data-name="perfil"]', function (e) {
  $$('#btnCrearNota').on('click', crearNota);
  $$('#btnEditarNota').on('click', guardarNota);
  mostrarNotas();
})

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
  $$('#notasTablero').html('');
  const queryNotas = firebase.firestore().collection('notas').where('notaEmail', '==', userEmail);
  queryNotas.get()
  .then((querySnapshot) => {
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