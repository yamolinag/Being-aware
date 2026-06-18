import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function Getuserdata() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

async function verificarSesion() {
    const userdata = await Getuserdata();
    const authForms = document.getElementById('auth-forms');
    const userInfo = document.getElementById('user-info');
    const activeUserMsg = document.getElementById('active-user-msg');

    if (!userdata) {
        authForms.style.display = 'flex';
        userInfo.style.display = 'none';
    } else {
        authForms.style.display = 'none';
        userInfo.style.display = 'block';
        activeUserMsg.textContent = `${userdata.user_metadata.display_name || userdata.email}`;
    }
}

async function login() {
    const Username = document.getElementById('User').value;
    const EMail = document.getElementById('E-mail').value;
    const Password = document.getElementById('Password').value;

    if (Password.length < 6) {
        window.alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email: EMail,
        password: Password,
        options: {
            data: { display_name: Username }
        }
    });

    if (error) {
        window.alert("Error al registrarse: " + error.message);
    } else {
        window.alert("Te has registrado exitosamente. Ahora puedes iniciar sesión.");
        location.reload();
    }
}

async function entrar() {
    const EMail = document.getElementById('E-mailsesion').value;
    const Password = document.getElementById('Passwordsesion').value;

    if (!EMail.trim() || !Password.trim()) {
        window.alert("Por favor, ingresa tanto el correo como la contraseña.");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: EMail,
        password: Password,
    });

    if (error) {
        window.alert("Error al iniciar sesión: " + error.message);
    } else {
        window.alert("Has iniciado sesión exitosamente.");
        location.reload();
    }
}

async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error al salir:", error.message);
    } else {
        window.alert("Has cerrado sesión exitosamente.");
        location.reload();
    }
}

function editarPerfil() {
    const updateForm = document.getElementById('update-form');
    updateForm.style.display = 'block';
}

function cancelar(){
    const updateForm = document.getElementById('update-form');
    updateForm.style.display = 'none';
}

async function actualizarPerfil() {
    const newEmail = document.getElementById('E-mailupdate').value;
    const newUsername = document.getElementById('Userupdate').value;
        const userdata = await Getuserdata();
    if (!userdata) {
        window.alert("No hay usuario activo.");
        return;
    }
    const fileInput = document.getElementById('fileInputupdate');
    const file = fileInput.files[0];
    if (file) {
        const filename = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Archivos')
            .upload(filename, file);
            
        if (uploadError) {
            console.error("Error al subir la imagen:", uploadError.message);
            return;
        }

        const { data: urlData } = supabase.storage
            .from('Archivos')
            .getPublicUrl(filename);
            
        const publicUrl = urlData.publicUrl;

        
        const { data: existingProfile, error: fetchError } = await supabase
            .from('perfiles')
            .select('id')
            .eq('userid', userdata.id)
            .single();
            
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 significa "no se encontraron filas"
            console.error("Error al verificar perfil existente:", fetchError.message);
            return;
        }

        let dbError = null; 

        if (existingProfile) {
            const { error: updateErr } = await supabase
                .from('perfiles')
                .update({ imageulr: publicUrl })
                .eq('userid', userdata.id); 
            dbError = updateErr;
        } else {
            
            const fotePerfil = [{ userid: userdata.id, imageulr: publicUrl }];
            const { error: insertErr } = await supabase
                .from('perfiles')
                .insert(fotePerfil);
            dbError = insertErr;
        }
        if (dbError) {
            console.error("Error al guardar/actualizar la URL en la base de datos:", dbError.message);
            return;
        }
        fileInput.value = '';
    }
    if(newUsername) {
        const{error:updateError} = await supabase.auth.updateUser({
            data: { display_name: newUsername }
        })
        if(updateError) {
            console.error("Error al actualizar el nombre de usuario:", updateError.message);
            return;
        }
        if(newEmail) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: newEmail
            }); 
            if(emailError) {
                console.error("Error al actualizar el correo electrónico:", emailError.message);
                return;
            }
        }
    }
}

async function changeSection(section) {
    const usuarioActivo = await Getuserdata();
    if (section === 'index.html' || section === 'cuenta.html') {
        window.location.href = section;
        return;
    }
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a esta sección.");
        window.location.href = 'cuenta.html';
        return;
    }
    window.location.href = section;
}
async function renderAvatar(){
    const avatarImg = document.getElementById('useravatar');
    const userdata = await Getuserdata();
    if (!userdata) {
        avatarImg.innerHTML = `<p id="acountcircul"><span class="material-symbols-outlined">account_circle</span></p>`;
        return;
    }
    const { data, error: fetchError } = await supabase
        .from('perfiles')
        .select('imageulr')
        .eq('userid', userdata.id)
        .maybeSingle();
    if (fetchError) {
        console.error("Error al obtener la URL del avatar:", fetchError.message);
        return;
    }
    const url = data?.imageulr ?? null;
    if (!url) {
        avatarImg.innerHTML = `<p id="acountcircul"><span class="material-symbols-outlined">account_circle</span></p>`;
    } else {
        avatarImg.innerHTML = `<img id="acountavatar" src="${url}" alt="Avatar">`;
    }
}
window.login = login;
window.entrar = entrar;
window.cerrarSesion = cerrarSesion;
window.changeSection = changeSection;
window.Getuserdata = Getuserdata;
window.editarPerfil = editarPerfil;
window.actualizarPerfil = actualizarPerfil;
window.cancelar = cancelar;
window.renderAvatar = renderAvatar;

verificarSesion();
renderAvatar();