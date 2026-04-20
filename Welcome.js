import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mtdblkrntsoeilwmhzgn.supabase.co';
const supabaseKey = 'sb_publishable_GKCUvPhh26exHDuzbRtaAg_i2dulF0-'; 
const supabase = createClient(supabaseUrl, supabaseKey);
const loginContainer = document.getElementById('logincontainer');
var usuario = null;
        document.getElementById('login').style.display = 'none';
        document.getElementById('cerrassession').style.display = 'none';

function cancelar() {
    loginContainer.style.display = 'none';
}

async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error al salir:", error.message);
    } else {
        location.reload();
        window.alert("Has cerrado sesión exitosamente.");
    }
}
function registrarse(){
    login()
}

async function Getuserdata(){
const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;;
}

async function verificarSesion() {
    const userdata = await Getuserdata();
    if(!userdata){
        console.log("No hay usuario activo");
        document.getElementById('login').style.display = 'block';
        document.getElementById('cerrassession').style.display = 'none';
    }else if (userdata) {
        console.log("Usuario activo:", userdata);
        document.getElementById('login').style.display = 'none';
        document.getElementById('cerrassession').style.display = 'block';
        const welcomeMsg = document.getElementById('welcome-msg');
        welcomeMsg.textContent = `¡Bienvenido a Being aware, ${userdata.user_metadata.display_name}! esperamos disfrutes compartiendo con nosotro`;  
    }
}


verificarSesion();
async function login() {
    const Username = document.getElementById('User').value;
    const EMail = document.getElementById('E-mail').value;
    const Password = document.getElementById('Password').value;
    loginContainer.style.display = 'block';
    if(Password.length < 6){
        window.alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }   
const {data, error} = await supabase.auth.signUp({
    email: EMail,
    password: Password,
    options: {
        data: {
            display_name: Username,
        }
    }
});
    if (error) {
        console.error('Error al registrarse:', error);
        window.alert("Error al registrarse: " + error.message);
        } else {
            console.log('Usuario registrado:', data);
            location.reload();
            window.alert("Has registrado exitosamente, ahora puedes iniciar sesión.");
        }

    } 
    
    async function entrar() {
        const EMail = document.getElementById('E-mailsesion').value;
        const Password = document.getElementById('Passwordsesion').value;
        const {data, error} = await supabase.auth.signInWithPassword({
            email: EMail,
            password: Password,
        });
        if (data.user){
            loginContainer.style.display = 'none';
        }
        if (error) {
            console.error('Error al iniciar sesión:', error);
            window.alert("Error al iniciar sesión: " + error.message);
        } else {
            console.log('Usuario conectado:', data);
            location.reload();
            window.alert("Has iniciado sesión exitosamente.");
        }
    }

async function changeSection(section) {
    const usuarioActivo = await Getuserdata();
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para acceder a esta sección.");
        return;
    }else{
        window.location.href = section;
    }
}

// Exponer todas las funciones al window
window.changeSection = changeSection;
window.registrarse = registrarse;
window.entrar = entrar;
window.login = login;   
window.cerrarSesion = cerrarSesion;
window.cancelar = cancelar;
window.Getuserdata = Getuserdata;