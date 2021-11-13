const formularioContactos = document.querySelector('#contacto'),
      listadoContactos = document.querySelector('#listado-contacto tbody');
       inputbuscador = document.querySelector('#buscar');
eventListeners();

function eventListeners(){
    //cuando el formulario de crear o editar se ejecuta
    formularioContactos.addEventListener('submit', leerFormulario);

    //listener para eliminar el boton
    if(listadoContactos){
        listadoContactos.addEventListener('click', eliminarContacto);

    };

    //buscador
    inputbuscador.addEventListener('input', buscarContactos);
    numeroContactos();
}

function leerFormulario(e){
    e.preventDefault();

    // leer los campos de los imputs
    const nombre = document.querySelector('#nombre').value,
          empresa = document.querySelector('#empresa').value,
          telefono = document.querySelector('#telefono').value,
          accion = document.querySelector('#accion').value;

    if(nombre === '' || empresa === '' || telefono === '' ){
        //dos parametros texto y clase
        mostrarNotificacion('Todos los campos son Obligatorios', 'error');
    }else{
        //pasa la validacion, crear llamado a ajax
        const infoContacto = new FormData();
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);

        if(accion === 'crear'){
            //creamos un nuevo contacto
            insertarBD(infoContacto);
        }else{
            //editar el contacto
            //leer el id
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegistro(infoContacto);
        }
    }
}
//inserta en la base de datas via AJAX
function insertarBD(infoContacto){
    //llamada a ajax

    //crear el objeto
    const xhr = new XMLHttpRequest();
    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);
    //pasar los datos
    xhr.onload = function() {
        if(this.status === 200){
             console.log(JSON.parse(xhr.responseText));
            //leemos la respuesta de php
            const respuesta = JSON.parse(xhr.responseText);

            // inserta un nuevo elemento a la tabla
            const nuevoContacto = document.createElement('tr');
            nuevoContacto.innerHTML = `
                <td>${respuesta.datos.nombre}</td>
                <td>${respuesta.datos.empresa}</td>
                <td>${respuesta.datos.telefono}</td>
            `;

            //crear contenedor para lo botones
            const contenedorAciones = document.createElement('td');

            //crear el icono de editar
            const iconoEditar = document.createElement('i');
            iconoEditar.classList.add('fas', 'fa-pen-square');

            //crea el enlace para editar
            const btnEditar = document.createElement('a');
            btnEditar.appendChild(iconoEditar);
            btnEditar.href = `editar.php?id=${respuesta.datos.id_insertado}`;
            btnEditar.classList.add('btn', 'btn-editar');

            //agregarlo al padre
            contenedorAciones.appendChild(btnEditar);

            //crear el icono de eliminar
            const iconoEliminar = document.createElement('i');
            iconoEliminar.classList.add('fas', 'fa-trash-alt');

            //crear el boton de eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.appendChild(iconoEliminar);
            btnEliminar.setAttribute('data-id', respuesta.datos.id_insertado);
            btnEliminar.classList.add('btn', 'btn-borrar');

            //agregarlo al padre
            contenedorAciones.appendChild(btnEliminar);

            //agregarlo al tr
            nuevoContacto.appendChild(contenedorAciones);

            //agregarlo con los contactos
            listadoContactos.appendChild(nuevoContacto);

            //resetear el formulario
            document.querySelector('form').reset();

            //mostrar la notificacion de exito
            mostrarNotificacion('Contacto Creado Correctamente', 'correcto');

            //actaulizamos el numero de contactos
            buscarContactos();
        };
    };
    //enviar los datos
    xhr.send(infoContacto);

}
function actualizarRegistro(infoContacto){
    //crear el objeto
    const xhr = new XMLHttpRequest();
    //abrir la conexion
    xhr.open('POST','inc/modelos/modelo-contactos.php', true);
    //leer la respuesta
    xhr.onload = function(){
        if(this.status === 200){
            const respuesta = JSON.parse(xhr.responseText);

            if(respuesta.respuesta === 'correcto'){
                mostrarNotificacion('Contacto Actualizado Correctamente', 'correcto');

            }else{
                //hubo algun error
                mostrarNotificacion('Hubo un error...', 'error');
            }
            //despues de 3 segundo redireccion
             setTimeout(() => {
                 window.location.href = 'index.php';
             }, 4000);
        };
    };
    //enviar peticion
    xhr.send(infoContacto);
}
//eliminar el contcatos
function eliminarContacto(e){
    if(e.target.parentElement.classList.contains('btn-borrar')){
        //tomar el id
        const id = e.target.parentElement.getAttribute('data-id');
        
        //preguntar al usuario 
        const respuesta = confirm('ESTAS SEGURO (a)?');

        if(respuesta){
            //llamado a ajax

            //creal el objeto
            const xhr = new XMLHttpRequest();
            //abrir la conexion
            xhr.open('GET', `inc/modelos/modelo-contactos.php?id=${id}&accion=borrar`, true);
            //leer la respuesta
            xhr.onload = function() {
                if(this.status === 200){
                    const resultado = JSON.parse(xhr.responseText);
                    console.log(resultado);
                    
                    if(resultado.respuesta === 'correcto'){
                        //eliminar registro del DOM
                        e.target.parentElement.parentElement.parentElement.remove();

                        //mostrar notificacion de exito
                        mostrarNotificacion('Contacto Eliminado con exito', 'correcto');

                        //actaulizamos el numero de contactos
                        buscarContactos();

                    }else{
                        //mostramos una notificacion
                        mostrarNotificacion('Hubo un error...', 'error');
                    }
                }
            }
            //enviar la peticion
            xhr.send();
        }
    }
}
//notitificacion en pantalla
function mostrarNotificacion(mensaje, clase){
    const notificacion = document.createElement('div');
    notificacion.classList.add(clase, 'notificacion', 'sombra');
    notificacion.textContent = mensaje;

    //formulario
    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));

    //ocultar y  mostrar notificacion
    setTimeout(() => {
        notificacion.classList.add('visible');

        setTimeout(() => {
            notificacion.classList.remove('visible');

            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }, 100);
}

//buscador de contactos
function buscarContactos(e){
    const expresion = new RegExp(e.target.value, "i"),
          registros = document.querySelectorAll('tbody tr');

    //ocultando los registros no ecesarios o que no tengan match
    registros.forEach(registro => {
        registro.style.display = 'none';
        //accediendo a todos los registro y su contenido
        if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
            registro.style.display = 'table-row';
        }
        numeroContactos();

    });
}

//muestra el numero de contactos
function numeroContactos(){
    const totalContactos = document.querySelectorAll('tbody tr'),
            contenedorNumero = document.querySelector('.total-contactos span');

    let total = 0;
    totalContactos.forEach(contacto =>{
        if(contacto.style.display === '' || contacto.style.display === 'table-row'){
            total++;
        }

    });

    contenedorNumero.textContent = total;
}