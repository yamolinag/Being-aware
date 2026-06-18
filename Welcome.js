import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function Getuserdata(){
const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

async function verificarSesion() {
    const userdata = await Getuserdata();
    if(!userdata){
        console.log("No hay usuario activo");
    }else if (userdata) {
        console.log("Usuario activo:", userdata);
        const welcomeMsg = document.getElementById('welcome-msg');
        welcomeMsg.textContent = `¡Bienvenido a Being aware, ${userdata.user_metadata.display_name}! esperamos disfrutes compartiendo con nosotro`;  
    }
}


verificarSesion();

async function changeSection(section) {
    if (section === 'index.html' || section === 'cuenta.html') {
        window.location.href = section;
        return;
    }
    const usuarioActivo = await Getuserdata();
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a esta sección.");
        window.location.href = 'cuenta.html';
        return;
    }
    window.location.href = section;
}

// Exponer todas las funciones al window
window.changeSection = changeSection;
window.Getuserdata = Getuserdata;