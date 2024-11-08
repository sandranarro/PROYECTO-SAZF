import {
    getDocs,        //
    getDoc,
    collection, //
    setDoc,
    doc,    //
    addDoc, //
    onSnapshot, //  Escucha los cambios en una coleccion y da una respuesta
    deleteDoc,   // Elimina un documento de un coleccion
    updateDoc   // Actualiza un documento de una coleccion
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { db, auth, storage } from "./firebase.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
    ref,    //Guarda la referencia de la carpeta donde se subira la imagen
    uploadBytes,    //Sube la imagen a la referencia indicada
    getDownloadURL,  //Consigue la URL del archivo subido
    deleteObject,   //Elminia un archivo de una ubicacion con su 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import { resizeImage, formatoFechaHora } from "./utilitarios.js";

//Cuando el usurio se autentique cargar los post
const listaPost = document.getElementById("posts");
const listaPostOtros = document.getElementById("posts-otros");
const listaTendencia = document.getElementById("posts-tendencia")
let id = ""; //El id del post
let downloadURL = "";
let userEmail = "";
let usuarioId = "";


onAuthStateChanged(auth, async (user) => {
    if (user) { //Si el usuario está logueado, entonces ....
        userEmail = user.email;
        usuarioId = user.uid
        //Conseguir datos de usuario actual de la base de datos
        const docUser = await getDoc(doc(db, "usuarios", user.uid));
        const usuario = docUser.data();
        usuarioId = docUser.id;
        document.getElementById("quePiensasBtn").innerText = `Que Piensas ${usuario.nombres}?`;
        document.getElementById("avatar-foto").src = usuario.avatarUrl;
        //
        //Pintar coincidencia 

        //MODAL PERFIL

        //LLamar al nombre del usurario en el boton que estas pensando
        await onSnapshot(collection(db, "posts"), (Querysnapshot) => {

            var documentos = Querysnapshot.docs //TODOS LOS DOCS
            pintarPerfil(usuario)
            //Columna izq: mis post
            let misPosts = documentos.filter(function (doc) { return user.email == doc.data().userEmail });
            misPosts = misPosts.sort((a, b) => b.data().fecha.toDate().getTime() - a.data().fecha.toDate().getTime());
            pintarPost(misPosts);


            //Columna der: otros post
            let otrosPosts = documentos.filter(function (doc) { return user.email != doc.data().userEmail });
            otrosPosts = otrosPosts.sort((a, b) => b.data().fecha.toDate().getTime() - a.data().fecha.toDate().getTime());
            pintarPostOtros(otrosPosts);

            //modal tendencias
            let copiadocumentos = documentos
            copiadocumentos.sort(function (doc1, doc2) {
                return doc2.data().personasLiked.length - doc1.data().personasLiked.length
            })
            pintarPostTendencias(copiadocumentos)
        // pintarMatch(usuario, documentos)

            //Columna

            //Elimiar Post
            const btnsDelete = document.querySelectorAll(".btn-delete");

            btnsDelete.forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    try {
                        await deletePost(e.target.dataset.id)
                    } catch (error) {
                        alert(error.code)
                    }
                })
            });

            //Editar Post
            const btnsEdit = document.querySelectorAll(".btn-edit")

            btnsEdit.forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    id = e.target.dataset.id //Actualizando el id
                    const doc = await getPost(id)
                    const post = doc.data()

                    document.getElementById("editarPost-titulo").value = post.titulo
                    document.getElementById("editarPost-descripcion").value = post.descripcion
                    console.log(post.imagenURL)
                    document.getElementById('editImage').innerHTML = `<img style="width:100%" src="${post.imagenURL}"/>`

                    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-editarPost"))
                    modal.show()
                })
            })

            //Likear Post
            const btnsLike = document.querySelectorAll(".btn-like");

            btnsLike.forEach((btn) => {
                btn.addEventListener('click', async (e) => {

                    let id = btn.getAttribute("data-id");

                    const doc = await getPost(id);

                    const post = doc.data();
                    //dislike 
                    if (post.personasLiked.includes(userEmail)) {//si mi correo le dio like
                        //borralo del arreglo
                        //se elimina mi correo de arreglo (se uso filter, porque pop solo borro el úultimo)
                        post.personasLiked = post.personasLiked.filter(email => email != userEmail);
                    }
                    else { //en caso no le dio like
                        //agregarlo al arreglo de likes
                        post.personasLiked.push(userEmail);
                    }
                    updatePost(id, post); //se actualiza en firestore 
                })
            });
        })
        //const posts = await getDocs(collection(db, "posts"))
    } else {
        listaPost.innerHTML = ""
        listaPostOtros.innerHTML = ""
    }
})

// Recorremos los botones de radio y verificamos cuál está marcado
function obtenerOpcionSeleccionada(radios) {

    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {

            // Si el radio está marcado, retornamos su valor
            return radios[i].value;
        }
    }
    return null; // Si no hay ninguna opción marcada, retornamos null
}

function pintarPost(datos) {
    if (datos.length) {
        let html = ''
        datos.forEach(doc => {
            const post = doc.data()
            let iconoLike = "";
            if (post.personasLiked.includes(userEmail)) { //deberia pintarse la manito
                iconoLike = `<i class="bi bi-hand-thumbs-up-fill"></i>` //manito pintada
            }
            else {
                iconoLike = `<i class = "bi bi-hand-thumbs-up"></i> `
            }

            const li = `
                <li class="list-group-item list-group-item-action " style="background-color:white  ; margin-bottom:5px; border: 1px solid #de4c8a">
                    <h4>${post.userEmail} publicó: </h4>
                    <p>${formatoFechaHora(post.fecha.toDate())}</p>
                  <h5>${post.titulo}</h5>
                  <p>${post.descripcion}</p>
                  <img src="${post.imagenURL}" style="width:100%; margin-bottom:5px " />
                  <button class="btn-delete" data-id="${doc.id}">Eliminar</button>
                  <button class="btn-edit" data-id="${doc.id}">Edit</button>
                  <button class="btn-like" style= "border: none" data-id="${doc.id}" >${iconoLike}</i></button>
                    <p>A ${post.personasLiked.length} personas les gusta esto.</p>
                </li>
                `
            html += li
        });
        listaPost.innerHTML = html
    } else {
        listaPost.innerHTML = `<h1>Aun no hay posts que mostrar</h1>`
    }
}


//PINTAL PERFIL

function pintarPerfil(usuario) {
    console.log(usuario)

    document.getElementById("avatar-foto-perfil").src = usuario.avatarUrl
    document.getElementById("nombre-perfil").innerHTML = usuario.nombres
    document.getElementById("correo-perfil").innerHTML = userEmail
    document.getElementById("respuestas-perfil").innerHTML = usuario.respuestas 
}

/*
//pintar match
async function  pintarMatch(usuario, documentos) {
    console.log(usuario)
    let posts = documentos.map(doc => doc.data())
    console.log(posts)

    let usuarios = await getDocs(collection(db, "usuarios"))
    usuarios = usuarios.docs
    usuarios = usuarios.map(doc => doc.data())
    console.log(usuarios)
   let postsCoincidencias = posts.filter(function (usu) {

        if (usuario.respuestas[0] == usu.respuestas[0] || usuario.respuestas[1] == usu.respuestas[1] || usuario.respuestas[2] == usu.respuestas[2] || usuario.respuestas[3] == usu.respuestas[3] || usuario.respuestas[4] == usu.respuestas[4] ){
            return true 
        }else return false

    })
console.log(postsCoincidencias)

}*/


//PINTAR TENDENCIAS 

function pintarPostTendencias(datos) {
    if (datos.length) {
        let html = ''
        datos.forEach(doc => {
            const post = doc.data()
            let iconoLike = "";
            if (post.personasLiked.includes(userEmail)) {//deberia pintarse la manito 
                iconoLike = `<i class = "bi bi-hand-thumbs-up-fill"></i> ` //manita pintada
            }
            else {
                iconoLike = `<i class = "bi bi-hand-thumbs-up"></i> `
            }


            const li = `
                <li class="list-group-item list-group-item-action " style="background-color:white ; margin-bottom:5px ; border: 1px solid #de4c8a">
                    <h4>${post.userEmail} publicó: </h4>
                    <p>${formatoFechaHora(post.fecha.toDate())}</p>
                  <h5>${post.titulo}</h5>
                  <p>${post.descripcion}</p>
                  <img src="${post.imagenURL}" style="width:100%; margin-bottom:5px" />
                 
               <button class="btn-like" style= "border: none; background-color: none" data-id="${doc.id}">${iconoLike} </button>
                    <p>A ${post.personasLiked.length} personas les gusta esto.</p>
                  </li>
                `
            html += li
        });
        listaTendencia.innerHTML = html
    }
    else {
        listaTendencia.innerHTML = `<p>Aún no hay posts que mostrar</p>`
    }
}


//AQUI SE IMPRIMEN LOS POSTS DE LOS OTROS USUARIOS

function pintarPostOtros(datos) {
    if (datos.length) {
        let html = ''
        datos.forEach(doc => {
            const post = doc.data()
            let iconoLike = "";
            if (post.personasLiked.includes(userEmail)) {//deberia pintarse la manito 
                iconoLike = `<i class = "bi bi-hand-thumbs-up-fill"></i> ` //manita pintada
            }
            else {
                iconoLike = `<i class = "bi bi-hand-thumbs-up"></i> `
            }


            const li = `
                <li class="list-group-item list-group-item-action " style="background-color:  ; margin-bottom:5px; border: 1px solid #de4c8a">
                    <h4>${post.userEmail} publicó: </h4>
                    <p>${formatoFechaHora(post.fecha.toDate())}</p>
                  <h5>${post.titulo}</h5>
                  <p>${post.descripcion}</p>
                  <img src="${post.imagenURL}" style="width:100%; margin-bottom:5px" />
                 
               <button class="btn-like" style= "border: none" data-id="${doc.id}">${iconoLike} </button>
                    <p>A ${post.personasLiked.length} personas les gusta esto.</p>
                  </li>
                `
            html += li
        });
        listaPostOtros.innerHTML = html
    }
    else {
        listaPostOtros.innerHTML = `<p>Aún no hay posts que mostrar</p>`
    }
}

//CrearPost
const postForm = document.getElementById("form-createPost")

postForm.addEventListener("submit", (e) => {
    e.preventDefault()


    const titulo = document.getElementById("crearPost-titulo").value
    const descripcion = document.getElementById("crearPost-descripcion").value
    const imagenURL = downloadURL
    const fecha = new Date()
    const personasLiked = [];

    savePost(titulo, descripcion, imagenURL, fecha, userEmail, personasLiked) //Crea Post

    postForm.reset() //Resetear formulario
    document.getElementById('uploadedImage').innerHTML = "";

    //Ocultar Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-crearPost"))
    modal.hide() //Ocultar Modal
})

//Actualizar Post
const editarPostForm = document.getElementById('form-editarPost');

editarPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById("editarPost-titulo").value
    const descripcion = document.getElementById("editarPost-descripcion").value
    const imagenURL = downloadURL

    updatePost(id, { titulo, descripcion, imagenURL }) //Actualiza el Post

    editarPostForm.reset();

    //Ocultar Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-editarPost"))
    modal.hide() //Ocultar Modal
})

// Subir Imagen Crear Post
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            downloadURL = await uploadImage(file); //Se optine la url de la imagen
            document.getElementById('uploadedImage').innerHTML = `<img src="${downloadURL}" alt="Imagen subida" style="width:100%">`;
        } catch (error) {
            console.error('Error en la carga:', error);
        }
    } else {
        alert("Por favor, selecciona un archivo.");
    }
});


//cerrar modal match

/*
document.getElementById('boton-match').addEventListener('click', function() {
    document.getElementById('modal-match').style.display = 'none';
});
*/



// Subir Imagen Editar Post
document.getElementById('editFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            downloadURL = await uploadImage(file); //Se optine la url de la imagen
            document.getElementById('editImage').innerHTML = `<img src="${downloadURL}" alt="Imagen subida" style="width:100%">`;
        } catch (error) {
            console.error('Error en la carga:', error);
        }
    } else {
        alert("Por favor, selecciona un archivo.");
    }
});




async function uploadImage(file) {
    const resizedImage = await resizeImage(file, 500, 500); // Cambia 800, 800 por el tamaño máximo deseado
    const storageRef = ref(storage, `images/${file.name}`);

    await uploadBytes(storageRef, resizedImage); // Subir la imagen
    return await getDownloadURL(storageRef); // Obtener la URL de descarga
}


// MATCH RECOPILACIÓN
// Seleccionamos todos los botones de radio que tienen el mismo nombre
console.log(document.getElementById("boton-match"))
document.getElementById("boton-match").addEventListener('click', async (e) => {
    e.preventDefault()
    console.log("hola")
    const radios = document.getElementsByName('inlineRadioOptions');

    let opcionSeleccionadaP1 = obtenerOpcionSeleccionada(radios)
    console.log(opcionSeleccionadaP1)

    const radios2 = document.getElementsByName('inlineRadioOptions2');
    let opcionSeleccionadaP2 = obtenerOpcionSeleccionada(radios2)

    const radios3 = document.getElementsByName('inlineRadioOptions3');
    let opcionSeleccionadaP3 = obtenerOpcionSeleccionada(radios3)

    const radios4 = document.getElementsByName('inlineRadioOptions4');
    let opcionSeleccionadaP4 = obtenerOpcionSeleccionada(radios4)

    const radios5 = document.getElementsByName('inlineRadioOptions5');
    let opcionSeleccionadaP5 = obtenerOpcionSeleccionada(radios5)

saveMatch(opcionSeleccionadaP1, opcionSeleccionadaP2, opcionSeleccionadaP3, opcionSeleccionadaP4, opcionSeleccionadaP5, userEmail)
})


//save match
const saveMatch = (respuesta1, respuesta2, respuesta3, respuesta4, respuesta5, userEmail) => {
    console.log(usuarioId)
    const respuestas = [respuesta1, respuesta2, respuesta3, respuesta4, respuesta5]
    const userRef = doc(db, "usuarios", usuarioId)
    console.log(userRef)
    setDoc(userRef, { respuestas: respuestas }, { merge: true })
    //addDoc(collection(db, 'match'), {respuesta1, respuesta2, respuesta3, respuesta4, respuesta5, userEmail})
}


//Funciones reutilizables de firestore

//Guardar Post
const savePost = (titulo, descripcion, imagenURL, fecha, userEmail, personasLiked) => {
    addDoc(collection(db, 'posts'), { titulo, descripcion, imagenURL, fecha, userEmail, personasLiked })
}

const deletePost = (id) => deleteDoc(doc(db, "posts", id))

const getPost = (id) => getDoc(doc(db, "posts", id))

const updatePost = (id, newFields) => updateDoc(doc(db, "posts", id), newFields)