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
  mostrarNotas();
})

function crearNota() {
  const titulo = $$(notaTitulo).val();
  const contenido = $$(notaContenido).val();
  firebase.firestore().collection('notas').add({
    notaEmail: userEmail,
    notaTitulo: titulo,
    notaContenido: contenido
  })
  .then((docRef) => {
    console.log('Carga exitosa! ');
    mostrarNotas();
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  });
  //llamar a función que actualice la visualización de notas
}

function mostrarNotas() {
  $$('#notasTablero').html('');
  const queryNotas = firebase.firestore().collection('notas').where('notaEmail', '==', userEmail);
  queryNotas.get()
  .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        $$('#notasTablero').append('<div id="' + doc.id + '" class="notas"><h4>' + doc.data().notaTitulo + '</h4><p>' + doc.data().notaContenido + '</p></div>');
      });
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
}
