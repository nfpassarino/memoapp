// ---------------------------------- VARIABLES GLOBALES ----------------------------------
var $$ = Dom7;
var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: { swipe: 'left', },
    routes: [
        { path: '/', url: 'index.html', },
        { path: '/perfil/', url: 'perfil.html', },
    ]
});
var mainView = app.views.create('.view-main');
var router = mainView.router;
var userEmail = '', idparaeditar ='', capturabtn = '';

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
        .then((user) => app.loginScreen.close($$('.register'), true))
        .catch((error) => console.log('Error registro: ' + error.message + ' [' + error.code + ']'));
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
    .catch((error) => console.log('Error registro: ' + error.message + ' [' + error.code + ']'));
}

// ---------------------------------- PERFIL ----------------------------------

$$(document).on('page:init', '.page[data-name="perfil"]', function (e) {

    $$('#btnCamara').on('click', activarCamaraOCR);
    $$('#btnGaleria').on('click', activarGaleriaOCR);
    $$('#btnSOS').on('click', mandarSOS);

    $$('.btnCrearNota').on('click', crearNota);
    $$('.btnGuardarNota').on('click', guardarNota);
    $$('.btnCompra').on('click', mostrarCompra);
    $$('.btnAgregarCompra').on('click', crearCompra);
    $$('.btnGuardarCompra').on('click', guardarCompra);

    $$('.btnCrearPasti').on('click', crearPasti);
    $$('.btnGuardarPasti').on('click', guardarPasti);
    $$('.btnTurnosTodos').on('click', mostrarTodosTurnos);
    $$('.btnCrearTurno').on('click', crearTurno);
    $$('.btnGuardarTurno').on('click', guardarTurno);
    $$('.btnCumplesTodos').on('click', mostrarTodosCumples);
    $$('.btnCrearCumple').on('click', crearCumple);
    $$('.btnGuardarCumple').on('click', guardarCumple);

    mostrarPasti();
    mostrarTurno();
    mostrarCumple();
    mostrarNota();
});

function mandarSOS() {
    var latitude = 0;
    var longitude = 0;
    function onSuccessGEO(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        window.plugins.socialsharing.share('NECESITO AYUDA URGENTE, ESTA ES MI UBICACIÓN', null, null,
        'http://maps.google.com/maps?q=' + latitude + ',' + longitude);
    };

    function onErrorGEO(error) {
        console.log('errorGEO code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccessGEO, onErrorGEO);
}

// ---------------------------------- FUNCIONES ANOTADOR ----------------------------------
function mostrarNota() {
    const queryNotas = firebase.firestore().collection('notas').where('notaEmail', '==', userEmail).orderBy('notaMs', 'desc');
    queryNotas.get()
    .then((querySnapshot) => {
        $$('#notasTablero').html('');
        querySnapshot.forEach((doc) => {
            $$('#notasTablero').append('<div id="' +
            doc.id + '" class="notas col-50 row popup-open btnEditarNota" data-popup=".nota-popup"><div class="col-80">' +
            '<span class="titunota col-100">' + doc.data().notaTitulo + '</span>' +
            '<p class="col-100">' + doc.data().notaContenido + '</p></div>' +
            '<div class="col-20">' +
            '</div></div>');
        });
        $$('.btnEditarNota').on('click', cargarNota);
    })
    .catch((error) => console.log("Error mostrarNotas: ", error));
}

function crearNota() {
    capturabtn = 'crear';
    $$('#btnBorrarNota').addClass('oculto');
    $$('#notaTitulo').val('');
    $$('#notaContenido').val('');
}

function cargarNota() {
    capturabtn = 'editar';
    $$('#btnBorrarNota').removeClass('oculto').on('click', borrarNota);
    $$('#notaTitulo').val('');
    $$('#notaContenido').val('');
    idparaeditar = this.id;
    firebase.firestore().collection('notas').doc(idparaeditar).get()
    .then((doc) => {
        $$('#notaTitulo').val(doc.data().notaTitulo);
        $$('#notaContenido').val(doc.data().notaContenido);
    })
    .catch((error) => console.error("Error cargarNota para editar: ", error));
}

function guardarNota() {
    const mseg = Date.now();
    const titulo = $$('#notaTitulo').val();
    const contenido = $$('#notaContenido').val();
    if ((titulo || contenido) && capturabtn === 'crear') {
        firebase.firestore().collection('notas').add({
            notaEmail: userEmail,
            notaTitulo: titulo,
            notaContenido: contenido,
            notaMs: mseg
        })
        .then(() => mostrarNota())
        .catch((error) => console.error("Error guardarNota para crear: ", error));
    } else if ((titulo || contenido) && capturabtn === 'editar') {
        firebase.firestore().collection('notas').doc(idparaeditar).update({
            notaTitulo: titulo,
            notaContenido: contenido
        })
        .then(() => mostrarNota())
        .catch((error) => console.error("Error guardarNota para editar: ", error));
    }
}

function borrarNota() {
    firebase.firestore().collection('notas').doc(idparaeditar).delete()
    .then(() => mostrarNota())
    .catch((error) => console.error("Error borrarNota: ", error));
}
// ----------------------------- FUNCIONES LISTA DE COMPRAS -----------------------------
function mostrarCompra() {
    const queryCompras = firebase.firestore().collection('compras').where('compraEmail', '==', userEmail).orderBy('compraMs');
    queryCompras.get()
    .then((querySnapshot) => {
        $$('#compraTablero').html('');
        querySnapshot.forEach((doc) => {
        $$('#compraTablero').append(`
        <li class="swipeout">
            <div class="item-content swipeout-content">
                <div class="item-media">
                <i
                    class="icon material-icons"
                    style="color: green; font-size: 2rem;"
                >done</i>
                </div>
                <div class="item-inner">
                <div class="item-title" style="font-weight: bold">
                    ${doc.data().compraObjeto}
                </div>
                </div>
            </div>
            <div class="swipeout-actions-right">
                <a id="${doc.id}" class="btnBorrarCompra swipeout-delete">Eliminar</a>
            </div>
            </li>
        `);
        });
    $$('.btnBorrarCompra').on('click', borrarCompra);
    })
    .catch((error) => console.log("Error mostrarCompra: ", error));
}

function crearCompra() {
    $$('#compraObjeto').val('');
}

function guardarCompra() {
    const mseg = Date.now();
    const objeto = $$('#compraObjeto').val();
    if (objeto) {
        firebase.firestore().collection('compras').add({
            compraEmail: userEmail,
            compraObjeto: objeto,
            compraMs: mseg
        })
        .then(() => mostrarCompra())
        .catch((error) => console.error("Error guardarCompra para crear: ", error));
    }
}

function borrarCompra() {
    firebase.firestore().collection('compras').doc(this.id).delete()
    .then(() => mostrarCompra())
    .catch((error) => console.error("Error borrarCompra: ", error));
}
// ---------------------------------- FUNCIONES PASTILLERO ----------------------------------
function mostrarPasti() {
    const queryPastis = firebase.firestore().collection('medicamentos').where('pastiEmail', '==', userEmail);
    queryPastis.get()
    .then((querySnapshot) => {
        $$('#pastiTablero').html('');
        querySnapshot.forEach((doc) => {
            $$('#pastiTablero').append('<div id="' +
            doc.id + '" class="pastis col-100 row popup-open btnEditarPasti" data-popup=".pasti-popup">' +
            doc.data().pastiHorario + '   ' + doc.data().pastiMedicamento + '[' + doc.data().pastiDosis + ']' +
            '</div>');
        });
        $$('.btnEditarPasti').on('click', cargarPasti);
    })
    .catch((error) => console.log("Error mostrarPasti: ", error));
}

function crearPasti() {
    capturabtn = 'crear';
    $$('#btnBorrarPasti').addClass('oculto');
    $$('#pastiMedicamento').val('');
    $$('#pastiDosis').val('');
    $$('#pastiHorario').val('');
    app.smartSelect.get('.my-smart-select').setValue([]);
}

function cargarPasti() {
    capturabtn = 'editar';
    $$('#btnBorrarPasti').removeClass('oculto').on('click', borrarPasti);
    $$('#pastiMedicamento').val('');
    $$('#pastiDosis').val('');
    $$('#pastiHorario').val('');
    app.smartSelect.get('.my-smart-select').setValue([]);
    idparaeditar = this.id;
    firebase.firestore().collection('medicamentos').doc(idparaeditar).get()
    .then((doc) => {
        $$('#pastiMedicamento').val(doc.data().pastiMedicamento);
        $$('#pastiDosis').val(doc.data().pastiDosis);
    $$('#pastiHorario').val(doc.data().pastiHorario);
    doc.data().pastiDias.map((pastidia) => {
    $$('option[value="' + pastidia + '"]').prop('selected', true);
    });
    })
    .catch((error) => {
        console.log("Error cargarPasti: ", error);
    });
}

function guardarPasti() {
    const medicamento = $$('#pastiMedicamento').val();
    const dosis = $$('#pastiDosis').val();
    const horario = $$('#pastiHorario').val();
    const dias = app.smartSelect.get('.my-smart-select').getValue();
    if (medicamento && dias && capturabtn === 'crear') {
        firebase.firestore().collection('medicamentos').add({
            pastiEmail: userEmail,
            pastiMedicamento: medicamento,
            pastiDosis: dosis,
            pastiHorario: horario,
            pastiDias: dias
        })
        .then(() => mostrarPasti())
        .catch((error) => console.error("Error guardarPasti para crear: ", error));
    } else if (medicamento && dias && capturabtn === 'editar') {
        firebase.firestore().collection('medicamentos').doc(idparaeditar).update({
            pastiMedicamento: medicamento,
            pastiDosis: dosis,
            pastiHorario: horario,
            pastiDias: dias
        })
        .then(() => mostrarPasti())
        .catch((error) => console.error("Error guardarPasti para editar: ", error));
    }
}

function borrarPasti() {
    firebase.firestore().collection('medicamentos').doc(idparaeditar).delete()
    .then(() => mostrarPasti())
    .catch((error) => console.error("Error borrarPasti: ", error));
}


// ---------------------------------- FUNCIONES TURNOS ----------------------------------

function mostrarTurno() {
    const mes = new Date().getMonth() + 1;
    var mesActual = '';
    (String(mes).length === 1) ? mesActual = '0' + String(mes) : mesActual = String(mes);
    const dia = new Date().getDate();
    var diaActual = '';
    (String(dia).length === 1) ? diaActual = '0' + String(dia) : diaActual = String(dia);
    mostrarTodosTurnos();
    const queryTurnos = firebase.firestore().collection('turnos').where('turnoEmail', '==', userEmail).where('turnoMes', '==', mesActual).orderBy('turnoFecha');
    queryTurnos.get()
    .then((querySnapshot) => {
        $$('#turnoTablero').html('');
        querySnapshot.forEach((doc) => {
            $$('#turnoTablero').append(`
                <div id="${doc.id}" class="turnos col-100 row popup-open btnEditarTurno
                ${(doc.data().turnoFecha.split('T')[0].split('-')[2] === diaActual) ? 'hoyTurno' : ''}" data-popup=".turno-popup">
                    ${doc.data().turnoFecha.split('T')[0]} ${doc.data().turnoFecha.split('T')[1]}  ${doc.data().turnoMedico}
                </div>
            `);
        });
        $$('.btnEditarTurno').on('click', cargarTurno);
    })
    .catch((error) => console.log("Error mostrarTurno: ", error));
}

function mostrarTodosTurnos() {
    const queryTurnos = firebase.firestore().collection('turnos').where('turnoEmail', '==', userEmail).orderBy('turnoFecha')
    queryTurnos.get()
    .then((querySnapshot) => {
        $$('.mesesTurnos').html('');
        querySnapshot.forEach((doc) => {
            $$('#turnos_' + doc.data().turnoMes).append(`
                <div id="${doc.id}" class="turnos col-100 row popup-open btnEditarTurno" data-popup=".turno-popup">
                    ${doc.data().turnoFecha.split('T')[0]} ${doc.data().turnoFecha.split('T')[1]}  ${doc.data().turnoMedico}
                </div>
            `);
        });
        $$('.btnEditarTurno').on('click', cargarTurno);
    })
    .catch((error) => console.log("Error mostrarTodosTurnos: ", error));
}

function crearTurno() {
    capturabtn = 'crear';
    $$('#btnBorrarTurno').addClass('oculto');
    $$('#turnoMedico').val('');
    $$('#turnoLugar').val('');
    $$('#turnoConsulta').val('');
    $$('#turnoFecha').val('');
}

function cargarTurno() {
    capturabtn = 'editar';
    $$('#btnBorrarTurno').removeClass('oculto').on('click', borrarTurno);
    $$('#turnoMedico').val('');
    $$('#turnoLugar').val('');
    $$('#turnoConsulta').val('');
    $$('#turnoFecha').val('');
    idparaeditar = this.id;
    firebase.firestore().collection('turnos').doc(idparaeditar).get()
    .then((doc) => {
        $$('#turnoMedico').val(doc.data().turnoMedico);
    $$('#turnoLugar').val(doc.data().turnoLugar);
    $$('#turnoConsulta').val(doc.data().turnoConsulta);
    $$('#turnoFecha').val(doc.data().turnoFecha);
    })
    .catch((error) => console.log("Error cargarTurno: ", error));
}

function guardarTurno() {
    const medico = $$('#turnoMedico').val();
    const lugar = $$('#turnoLugar').val();
    const consulta = $$('#turnoConsulta').val();
    const fecha = $$('#turnoFecha').val();
    const mes = fecha.split('-')[1];
    if (medico && fecha && capturabtn === 'crear') {
        firebase.firestore().collection('turnos').add({
            turnoEmail: userEmail,
            turnoMedico: medico,
            turnoLugar: lugar,
            turnoConsulta: consulta,
            turnoFecha: fecha,
            turnoMes: mes
        })
        .then(() => mostrarTurno())
        .catch((error) => console.error("Error guardarTurno para crear: ", error));
    } else if (medico && fecha && capturabtn === 'editar') {
        firebase.firestore().collection('turnos').doc(idparaeditar).update({
            turnoMedico: medico,
            turnoLugar: lugar,
            turnoConsulta: consulta,
            turnoFecha: fecha,
            turnoMes: mes
        })
        .then(() => mostrarTurno())
        .catch((error) => console.error("Error guardarTurno para editar: ", error));
    }
}

function borrarTurno() {
    firebase.firestore().collection('turnos').doc(idparaeditar).delete()
    .then(() => mostrarTurno())
    .catch((error) => console.error("Error borrarTurno: ", error));
}

// ---------------------------------- FUNCIONES CUMPLEAÑOS ----------------------------------

function mostrarCumple() {
    const mes = new Date().getMonth() + 1;
    var mesActual = '';
    (String(mes).length === 1) ? mesActual = '0' + String(mes) : mesActual = String(mes);
    const dia = new Date().getDate();
    var diaActual = '';
    (String(dia).length === 1) ? diaActual = '0' + String(dia) : diaActual = String(dia);
    mostrarTodosCumples();
    const queryCumples = firebase.firestore().collection('cumpleaños').where('cumpleEmail', '==', userEmail).where('cumpleMes', '==', mesActual).orderBy('cumpleFecha');
    queryCumples.get()
    .then((querySnapshot) => {
        $$('#cumpleTablero').html('');
        querySnapshot.forEach((doc) => {
            $$('#cumpleTablero').append(`
                <div id="${doc.id}" class="cumples col-100 row popup-open btnEditarCumple
                ${(doc.data().cumpleFecha.split('-')[2] === diaActual) ? 'hoyCumple' : ''}" data-popup=".cumple-popup">
                    ${doc.data().cumpleFecha}   ${doc.data().cumpleNombre} [${doc.data().cumpleRelacion}]
                </div>
            `);
        });
        $$('.btnEditarCumple').on('click', cargarCumple);
    })
    .catch((error) => console.log("Error mostrarCumple: ", error));
}

function mostrarTodosCumples() {
    const queryCumples = firebase.firestore().collection('cumpleaños').where('cumpleEmail', '==', userEmail).orderBy('cumpleFecha');
    queryCumples.get()
    .then((querySnapshot) => {
        $$('.mesesCumples').html('');
        querySnapshot.forEach((doc) => {
            $$('#cumples_' + doc.data().cumpleMes).append(`
            <div id="${doc.id}" class="cumples col-100 row popup-open btnEditarCumple" data-popup=".cumple-popup">
                ${doc.data().cumpleFecha}   ${doc.data().cumpleNombre} [${doc.data().cumpleRelacion}]
            </div>
            `);
        });
        $$('.btnEditarCumple').on('click', cargarCumple);
    })
    .catch((error) => console.log("Error mostrarTodosCumples: ", error));
}

function crearCumple() {
    capturabtn = 'crear';
    $$('#btnBorrarCumple').addClass('oculto');
    $$('#cumpleNombre').val('');
    $$('#cumpleRelacion').val('');
    $$('#cumpleFecha').val('');
}

function cargarCumple() {
    capturabtn = 'editar';
    $$('#btnBorrarCumple').removeClass('oculto').on('click', borrarCumple);
    $$('#cumpleNombre').val('');
    $$('#cumpleRelacion').val('');
    $$('#cumpleFecha').val('');
    idparaeditar = this.id;
    firebase.firestore().collection('cumpleaños').doc(idparaeditar).get()
    .then((doc) => {
        $$('#cumpleNombre').val(doc.data().cumpleNombre);
    $$('#cumpleRelacion').val(doc.data().cumpleRelacion);
    $$('#cumpleFecha').val(doc.data().cumpleFecha);
    })
    .catch((error) => console.log("Error cargarCumple: ", error));
}

function guardarCumple() {
    const nombre = $$('#cumpleNombre').val();
    const relacion = $$('#cumpleRelacion').val();
    const fecha = $$('#cumpleFecha').val();
    const mes = fecha.split('-')[1];
    if (nombre && fecha && capturabtn === 'crear') {
        firebase.firestore().collection('cumpleaños').add({
            cumpleEmail: userEmail,
            cumpleNombre: nombre,
            cumpleRelacion: relacion,
            cumpleFecha: fecha,
            cumpleMes: mes
        })
        .then(() => mostrarCumple())
        .catch((error) => console.error("Error guardarCumple para crear: ", error));
    } else if (nombre && fecha && capturabtn === 'editar') {
        firebase.firestore().collection('cumpleaños').doc(idparaeditar).update({
            cumpleNombre: nombre,
            cumpleRelacion: relacion,
            cumpleFecha: fecha,
            cumpleMes: mes
        })
        .then(() => mostrarCumple())
        .catch((error) => console.error("Error guardarCumple para editar: ", error));
    }
}

function borrarCumple() {
    firebase.firestore().collection('cumpleaños').doc(idparaeditar).delete()
    .then(() => mostrarCumple())
    .catch((error) => console.error("Error borrarCumple: ", error));
}

/* SOLUCION PARA REFRESCAR PANTALLA TODOS LOS DIAS A LAS 00.00, CON UN INTERVAL CADA 1 MINUTO
var dia = new Date();
var hs = dia.getHours();
var min = dia.getMinutes();
var sec = dia.getSeconds();
if (hs === 0 && min === 0 && sec < 60) {
    //refrescar pantalla
}*/

// ---------------------------------- LECTOR OCR ----------------------------------

function activarCamaraOCR() {
    navigator.camera.getPicture(onSuccessCamara, onFailCamara, { quality: 100, correctOrientation: true });
}

function activarGaleriaOCR() {
    navigator.camera.getPicture(onSuccessCamara, onFailCamara,
        {
            quality: 100,
            correctOrientation: true,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        }
    );
}

function onSuccessCamara(imageData) {
    textocr.recText(0, imageData, onSuccessOCR, onFailOCR);
    function onSuccessOCR(recognizedText) {
        if(recognizedText.foundText) {
            $$('#txtOCR').text(recognizedText.blocks.blocktext);
        } else {
            console.log('No encontró texto :(');
        }
    }
    function onFailOCR(message) {
        console.log('Error OCR: ' + message);
    }
}

function onFailCamara(message) {
    console.log('Error de cámara/galería: ' + message);
}