import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function Getuserdata(){
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

// Exponer función al window
window.Getuserdata = Getuserdata;

// Inicializar después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    obtenerNoticias();
});


const ventana = document.getElementById("ventana");
    ventana.style.display = "none";

function cancelar() {
    ventana.style.display = "none";
}

function mostrarventana(){

    ventana.style.display = "block";
}

async function guardarNoticia() {
    const FileInput = document.getElementById('fileInput');
    const file = FileInput.files?.[0];
    let fileUrl = null;

    if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Archivos')
            .upload(fileName, file);
        if (uploadError) {
            console.error('Error al subir archivo:', uploadError);
            window.alert("Error al subir el archivo. Por favor, inténtalo de nuevo.");
            return;
        }
        console.log('Archivo subido:', uploadData);
        const {data: ulrData, error: urlError} = await supabase.storage
            .from('Archivos')
            .getPublicUrl(fileName);
        if (urlError) {
            console.error('Error al obtener URL pública:', urlError);
            window.alert("Error al obtener la URL de la imagen. Por favor, inténtalo de nuevo.");
            return;
        }
        console.log('URL pública obtenida:', ulrData);
        fileUrl = ulrData.publicUrl;
    }
    
    const nuevaNoticia = [{ 
        titulo: document.getElementById('titulonoticia').value,
        noticia: document.getElementById('noticia').value,
        date: new Date().toISOString(),
        autor: (await Getuserdata()).user_metadata.display_name,
        imagen: fileUrl
     }];
     (nuevaNoticia[0].titulo === '' || nuevaNoticia[0].noticia === '') ? window.alert("Por favor, completa todos los campos antes de guardar."): null;
        if (nuevaNoticia[0].titulo === '' || nuevaNoticia[0].noticia === '') return;
    const { error } = await supabase 
    .from('noticias')
    .insert(nuevaNoticia);

     if (error) {
        console.error('Error al guardar:', error);
        window.alert("Error al guardar la noticia. Por favor, inténtalo de nuevo.");
    } else {
        alert('Noticia guardada exitosamente');
        document.getElementById('titulonoticia').value = '';
        document.getElementById('noticia').value = '';
        ventana.style.display = "none";
        obtenerNoticias();
        FileInput.value = '';
        const label = document.querySelector('.custom-file-upload');
        if (label) {
            label.style.backgroundColor = "#5f8fd7";
            label.innerHTML = `<span class="material-symbols-outlined">image</span> Añadir foto de la noticia`;
        }
    };
}
async function obtenerNoticias() {
    const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('date', { ascending: false });
        if (error) {
            console.error('Error al obtener noticias:', error);
        }else{
            console.log('Noticias obtenidas:', data);
            rennderNews(data);
        }
}
function rennderNews(news) {
    if (!news || news.length === 0) {
        const newsContainer = document.getElementById('contenedornoticias');
        newsContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
        obtenerNoticias();
        return;
    }
    const newsContainer = document.getElementById('contenedornoticias');
    newsContainer.innerHTML = '';
    news.forEach(noticia => {
        const noticiaElement = document.createElement('div');
        noticiaElement.classList.add('noticia');
        noticiaElement.innerHTML = `
        <div class="noticias">
        ${noticia.imagen ? `<img src="${noticia.imagen}" alt="Imagen de la noticia" class="noticia-imagen">` : ''} 
            <h3>${noticia.titulo}</h3>
            <p>${noticia.noticia}</p>
            <p><em>Publicado por ${noticia.autor} el ${new Date(noticia.date).toLocaleString()}</em></p>
         </div>   
        `;
        newsContainer.appendChild(noticiaElement);
    });
}async function changeSection(section) {
    const paginasPublicas = [
        'index.html',
        'Being_aware_Forum.html',
        'news.html'
    ];

    if (paginasPublicas.includes(section)) {
        window.location.href = section;
        return;
    }

    const usuarioActivo = await Getuserdata();
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a esta sección.");
        return;
    }

    window.location.href = section;
}
document.getElementById('fileInput').addEventListener('change', function() {
    const label = document.querySelector('.custom-file-upload');
    if (this.files && this.files.length > 0) {
        label.style.backgroundColor = "#28a745"; // Cambia a verde si hay foto
        label.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Foto lista`;
    } else {
        label.style.backgroundColor = "#5f8fd7";
        label.innerHTML = `<span class="material-symbols-outlined">image</span> Añadir foto de la noticia`;
    }
});

async function searchnews(){
    const search = document.getElementById('mondongo').value.toLowerCase();
    const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('date', { ascending: false });
    if (error) {
        console.error('Error al obtener noticias:', error);
        Window.alert("Error al buscar noticias. Por favor, inténtalo de nuevo.");
        return;
    }
    const filteredNews = data.filter(noticia =>
        noticia.titulo.toLowerCase().includes(search) ||
        noticia.noticia.toLowerCase().includes(search) ||
        noticia.autor.toLowerCase().includes(search)
    );
    rennderNews(filteredNews);
}
function limpiarBusqueda() {
    document.getElementById('mondongo').value = '';
    obtenerNoticias();
}
window.limpiarBusqueda = limpiarBusqueda;
window.searchnews = searchnews;
window.changeSection = changeSection;
window.mostrarventana = mostrarventana;
window.guardarNoticia = guardarNoticia;
window.cancelar = cancelar;
window.obtenerNoticias = obtenerNoticias;
