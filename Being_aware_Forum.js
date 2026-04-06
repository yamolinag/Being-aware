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
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const textInput = document.getElementById('textInput');
    const texto = textInput.value;

    if (!texto.trim()) {
        alert('Por favor, ingresa un mensaje antes de enviar.');
        return;
    }

    if (texto.length > 500) {
        alert('El mensaje es demasiado largo. Por favor, limita tu mensaje a 500 caracteres.');
        return;
    }

    const usuarioActivo = await Getuserdata();
    if (!usuarioActivo) {
        alert('Debes iniciar sesión para enviar un mensaje.');
        return;
    }

    let fileUrl = null;

    if (file) {
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
        const lowercaseName = file.name.toLowerCase();
        const hasAllowedExt = allowedExtensions.some(ext => lowercaseName.endsWith(ext));

        if (!allowedMimeTypes.includes(file.type) && !hasAllowedExt) {
            alert('Tipo de archivo no soportado. Usa imágenes o documentos de Office (.docx, .xlsx, .pptx).');
            return;
        }

        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Archivos')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Error al subir el archivo:', uploadError);
            alert('Error al subir el archivo. Por favor, intenta nuevamente.');
            return;
        }

        console.log('Archivo subido exitosamente:', uploadData);

        const { data: urlData, error: urlError } = await supabase.storage
            .from('Archivos')
            .getPublicUrl(fileName);


        fileUrl = urlData.publicUrl;
        console.log('URL pública del archivo:', fileUrl);
    } else {
        console.log('No se ha seleccionado ningún archivo, enviando solo el mensaje de texto.');
    }

    const { error } = await supabase
        .from('mensajes')
        .insert([{
            text: texto,
            user: usuarioActivo.user_metadata.display_name,
            date: new Date().toISOString(),
            fileurl: fileUrl,
        }]);

    if (error) {
        console.error('Error al enviar:', error);
    } else {
        textInput.value = '';
        fileInput.value = '';
        obtenerMensajes();
    }
}

async function obtenerMensajes() {
    const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .order('date', { ascending: false }); 

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

        const isImageFile = msg.fileurl && msg.fileurl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
        const fileHtml = msg.fileurl ? (isImageFile
            ? `\n                <a href="${msg.fileurl}" target="_blank"><img src="${msg.fileurl}" alt="Imagen adjunta" class="message-image" loading="lazy" /></a>\n            `
            : `\n                <a href="${msg.fileurl}" target="_blank" download class="btn-descargar">\n                    <span class="material-symbols-outlined">download</span> Descargar documento\n                </a>\n            `)
            : '';
        messageElement.innerHTML = `
            <h3>${msg.user}</h3>
            <p>${msg.text}</p>
            <h5>${fechaLegible}</h5>
            ${fileHtml}
            ${msg.user === miNombre ? `<button onclick="eliminarMensaje('${msg.id}','${msg.user}')" id="eliminarMensaje"><span class="material-symbols-outlined" id="deleteico">delete</span></button>` : ''}
            <hr>
        `;

        messageContainer.prepend(messageElement);
    });
    window.scrollTo(0, document.body.scrollHeight);
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

document.getElementById('fileInput').addEventListener('change', function() {
    const label = document.querySelector('.custom-file-upload');
    if (this.files && this.files.length > 0) {
        label.style.backgroundColor = "#28a745"; // Cambia a verde si hay foto
        label.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Foto lista`;
    } else {
        label.style.backgroundColor = "#5f8fd7";
        label.innerHTML = `<span class="material-symbols-outlined">image</span> Adjuntar`;
    }
});

window.changeSection = changeSection;
window.enviarMensaje = enviarMensaje;
obtenerMensajes();
window.eliminarMensaje = eliminarMensaje;