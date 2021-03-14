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
        doc.id + '" class="notas"><h4>' +
        doc.data().notaTitulo + '</h4><p>' +
        doc.data().notaContenido + '</p>' +
        '<button class="button button-small btnEditarNota"><i class="f7-icons">pencil_circle</i></button>' +
        '<button class="button button-small btnBorrarNota"><i class="f7-icons">trash_circle</i></button>' +
        '</div>');
      });
      $$('.btnEditarNota').on('click', editarNota);
      $$('.btnBorrarNota').on('click', borrarNota);
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}

function editarNota() {
  idparaeditar = this.parentNode.id;
  firebase.firestore().collection('notas').doc(this.parentNode.id).get()
  .then((doc) => {
        $$('#notaTitulo').val(doc.data().notaTitulo);
        $$('#notaContenido').val(doc.data().notaContenido);
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}

function guardarNota() {
  const titulo = $$('#notaTitulo').val();
  const contenido = $$('#notaContenido').val();
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
  idparaeditar = this.parentNode.id;
  firebase.firestore().collection('notas').doc(this.parentNode.id).delete()
  .then(() => {
    mostrarNotas();
  })
  .catch((error) => {
    console.log("Error: ", error);
  });
}