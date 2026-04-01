import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);
Getuserdata()
async function Getuserdata(){
const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;;
}
obtenerNoticias();


const ventana = document.getElementById("ventana");
    ventana.style.display = "none";

function cancelar() {
    ventana.style.display = "none";
}

function mostrarventana(){

    ventana.style.display = "block";
}

async function guardarNoticia() {
    const nuevaNoticia = [{ 
        titulo: document.getElementById('titulonoticia').value,
        noticia: document.getElementById('noticia').value,
        date: new Date().toISOString(),
        autor: (await Getuserdata()).user_metadata.display_name
     }];
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
            <h3>${noticia.titulo}</h3>
            <p>${noticia.noticia}</p>
            <p><em>Publicado por ${noticia.autor} el ${new Date(noticia.date).toLocaleString()}</em></p>
         </div>   
        `;
        newsContainer.appendChild(noticiaElement);
    });
}async function changeSection(section) {
    const paginasPublicas = [
        'Being_aware_welcome.html',
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

window.changeSection = changeSection;
window.mostrarventana = mostrarventana;
window.guardarNoticia = guardarNoticia;
window.cancelar = cancelar;
