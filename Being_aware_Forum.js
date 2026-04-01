import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);
const messageContainer = document.getElementById('messagecontainer');

async function Getuserdata(){
const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;;
}


async function enviarMensaje() {
    const textInput = document.getElementById('textInput'); 
    const texto = textInput.value;
    if (!texto.trim()) {
        alert('Por favor, ingresa un mensaje antes de enviar.');
        return;
    } if (texto.length > 500) {
        alert('El mensaje es demasiado largo. Por favor, limita tu mensaje a 500 caracteres.');
        return;
    }
 const usuarioActivo = await Getuserdata();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para enviar un mensaje.");
        return;
    }   

    const {error} = await supabase
        .from('mensajes')
        .insert([{ 
            text: texto, 
            user: usuarioActivo.user_metadata.display_name, 
            date: new Date().toISOString() 
        }]);
    

    if (error) {
        console.error('Error al enviar:', error);
    } else {
        textInput.value = '';
        obtenerMensajes();
    }

}

async function obtenerMensajes() {
    const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .order('date', { ascending: true }); 

    if (error) {
        console.error('Error al obtener:', error);
    } else {
        renderMessages(data);
    }
}

async function renderMessages(mensajes) {
    messageContainer.innerHTML = '';
    const usuarioActivo = await Getuserdata();
    const miNombre = usuarioActivo ? usuarioActivo.user_metadata.display_name : null;

    mensajes.forEach((msg) => {
        const messageElement = document.createElement('div');
        const fechaLegible = new Date(msg.date).toLocaleString();

        if (msg.user === miNombre) {
            messageElement.className = 'messageown';
        } else {
            messageElement.className = 'message';
        }

        messageElement.innerHTML = `
            <h3>${msg.user}</h3>
            <p>${msg.text}</p>
            <h5>${fechaLegible}</h5>
            ${msg.user === miNombre ? `<button onclick="eliminarMensaje('${msg.id}','${msg.user}')" id="eliminarMensaje"><span class="material-symbols-outlined"id="deleteico">delete</span></button>` : ''}
            <hr>
        `;

        messageContainer.appendChild(messageElement);
    });
}

async function eliminarMensaje(params,usuarioMensaje) {
    const usuarioActivo = await Getuserdata();
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para eliminar un mensaje");
        return;
    }
    if (usuarioMensaje === usuarioActivo.user_metadata.display_name) {
        const { error } = await supabase
            .from('mensajes')
            .delete()
            .eq('id', params);
        obtenerMensajes();
        window.alert('El mensaje ha sido eliminado, Recuerda que los mensajes eliminados no se pueden recuperar, por lo que debes estar seguro antes de eliminar un mensaje.');
        if (error) {
            console.error('Error al eliminar:', error);
        } else {
            console.log('Mensaje eliminado');
        }
    }
    if (usuarioMensaje !== usuarioActivo.user_metadata.display_name) {
        window.alert('No puedes eliminar un mensaje que no es tuyo, Recuerda que los mensajes eliminados no se pueden recuperar, por lo que debes estar seguro antes de eliminar un mensaje.');
    }
}
const canalMensajes = supabase
  .channel('cambios-en-mensajes') 
  .on(
    'postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'mensajes' 
    }, 
    (payload) => {
      console.log('¡Cambio detectado en la base de datos!', payload);
      obtenerMensajes(); 
    }
  )
  .subscribe();
async function changeSection(section) {
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
window.enviarMensaje = enviarMensaje;
obtenerMensajes();
window.eliminarMensaje = eliminarMensaje;