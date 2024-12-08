const getPlayList = async () => {
    const result = await fetch("/api/v1/playlist", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    const response = await result.json()
    return response
}

window.onload = async () => {
    var canciones = await getPlayList()
    var indiceActual =  [0]
    
    //Funcion para crear mediante javascript el listado de canciones
    function crearPlayList(list) {
        const listado = document.createElement('ol')
        listado.setAttribute("id", 'listadoMusica')
        for (var i = 0; i < list.length; i++) {
            const item = document.createElement('li')
            item.appendChild(document.createTextNode(list[i].name))
            item.setAttribute("id", list.indexOf(list[i]))
            item.setAttribute("data-url", list[i].url)
            listado.appendChild(item)
        }
        return listado
    }

    document.getElementById('playList').appendChild(crearPlayList(canciones))

    var listadoMusica = document.getElementById('listadoMusica')
    listadoMusica.onclick = (e) => {
        const itemClick = e.target
        removeActive()
        itemClick.classList.add("active");
        reproduccionActual("Reproduciendo: " + itemClick.innerText)
        loadMusic(itemClick.getAttribute('data-url'))
        player.play()
        indiceActual[0] = e.target.id
        classIconPlay();
    }

    setMusicForDefault()

    //Funcion para cambiar el icono del reprodutor
    function classIconPlay() {
        var element = document.getElementById("iconPlay")
        element.classList.remove("fa-pause-circle");
        element.classList.add("fa-play-circle");
    }
    //Funcion para control del volumen
    const volumen = document.getElementById("volumen")
    volumen.oninput = (e) => {
        const vol = e.target.value
        player.volume = vol
    }


    //Funcion para remover todas las clases css activas
    function removeActive() {
        var elems = document.querySelectorAll(".active");
        [].forEach.call(elems, function (el) {
            el.classList.remove("active");
        });
        return elems
    }
    //Funcion para mostrar el nombre del arhivo actual en reproduccion
    function reproduccionActual(texto) {
        document.getElementById('currentPlay').innerText = texto
    }
    //Funcion para cargar las canciones en el reproductor
    function loadMusic(ruta) {
        var source = document.getElementById('source')
        source.src = ruta
        var index = indiceActual[0]
        removeActive()
        var item = document.getElementById(index)
        item.classList.add("active");
        reproduccionActual("Reproduciendo: " + item.innerText)
        player.load()
    }

    //Funcion para que al dar click sobre la barra de progreso se permita adelantar
    progress.addEventListener('click', adelantar);
    function adelantar(e) {
        const scrubTime = (e.offsetX / progress.offsetWidth) * player.duration;
        player.currentTime = scrubTime;
        sonsole.log(e);
    }

    document.getElementById('search_music').addEventListener('keyup', (e) => {
        filterMusic(canciones, e.target.value)
    })

    const search = new URLSearchParams(window.location.search).get('q')
    if (search.length != 0) {
        document.getElementById('search_music').value = search
        filterMusic(canciones, search)
    }

    function filterMusic(list, search) {
        const filter = list.filter(m => String(m.name).toLowerCase().includes(String(search).toLowerCase()))
    
        document.getElementById('listadoMusica').remove()
        document.getElementById('playList').appendChild(crearPlayList(filter))
    
        var listadoMusica = document.getElementById('listadoMusica')
        listadoMusica.onclick = (e) => {
            const itemClick = e.target
            removeActive()
            itemClick.classList.add("active");
            reproduccionActual("Reproduciendo: " + itemClick.innerText)
            loadMusic(itemClick.getAttribute('data-url'))
            player.play()
            indiceActual[0] = e.target.id
            classIconPlay();
        }
    }

    loadMusic(canciones[0].url)
    setMusicForDefault()
}



//Funcion para actualizar la barra de progreso del reprodutor
const updateProgress = () => {
    if (player.currentTime > 0) {
        const barra = document.getElementById('progress')
        barra.value = (player.currentTime / player.duration) * 100

        var duracionSegundos = player.duration.toFixed(0);
        dura = secondsToString(duracionSegundos);
        var actualSegundos = player.currentTime.toFixed(0)
        actual = secondsToString(actualSegundos);

        duracion = actual + ' / ' + dura
        document.getElementById('timer').innerText = duracion
    }
    if (player.ended) {
        nextMusic();//Reproducir la siguiente pista
    }
}

//Funcion para reproducir la proxima cancion
function nextMusic() {
    const source = document.getElementById('source');
    var musicaActual = Number(indiceActual[0]);
    if (canciones.length == (musicaActual + 1)) {
        var siguiente = 0
    } else {
        var siguiente = musicaActual + 1
    }
    removeActive()
    var item = document.getElementById(siguiente)
    item.classList.add("active");
    loadMusic(canciones[siguiente].url);
    player.play()
    indiceActual[0] = siguiente
    reproduccionActual("Reproduciendo: " + canciones[siguiente].name)
    classIconPlay()
}

//Funcion para reproducir la cancion anterior
function prevMusic() {
    const source = document.getElementById('source');
    var musicaActual = Number(indiceActual[0]);
    if (musicaActual == 0) {
        var anterior = canciones.length - 1
    } else {
        var anterior = musicaActual - 1
    }
    removeActive()
    var item = document.getElementById(anterior)
    item.classList.add("active");
    loadMusic(canciones[anterior].url);
    player.play()
    indiceActual[0] = anterior
    reproduccionActual("Reproduciendo: " + canciones[anterior])
    classIconPlay()
}

//Funcion para convertir segundos a minutos y horas
function secondsToString(seconds) {
    var hour = "";
    if (seconds > 3600) {
        hour = Math.floor(seconds / 3600);
        hour = (hour < 10) ? '0' + hour : hour;
        hour += ":"
    }
    var minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    var second = seconds % 60;
    second = (second < 10) ? '0' + second : second;
    return hour + minute + ':' + second;
}

//Funcion para pausar o darle play 
function togglePlay() {
    if (player.paused) {
        toggleIcon();
        return player.play();
    } else {
        toggleIcon();
        return player.pause();
    }
}
//Funcion para cambiar el icono play o pause
function toggleIcon() {
    var element = document.getElementById("iconPlay");
    element.classList.toggle("fa-pause-circle");
    element.classList.toggle("fa-play-circle");
}

function setMusicForDefault() {
    var list = document.querySelectorAll("ol > li")
    if (list.length != 0) {
        list[0].click()
    }
}