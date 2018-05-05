const express = require('express');
app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

// Variables para los eventos del socket
const nuevoTexto = "nuevoTexto";
const nuevoUsuario = "nuevoUsuario";
const listarUsuarios = "listarUsuarios";

var puerto = 3000;

server.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${ puerto }`);
});

// Rutas
app.use(express.static( path.join( __dirname, 'public' ) ));// armamos la ruta al los archivos publicos

// Mapa para guardar los usuarios conectados
var usuarios = new Map();

io.on('connection', (socket) => {
    console.log(`Nuevo dispositivo conectado ${ socket.id }`);

    socket.on(nuevoTexto, (data) => {
        console.log(`Nuevo texto: ${ data }`);

        var jsonData = JSON.parse(data);

        var socketUsuario = usuarios.get(jsonData.para);

        if(socketUsuario){
            socketUsuario.emit(nuevoTexto, {'texto':jsonData.texto});
        }else{
            console.log(`Socket de  ${ jsonData.para } esta indefinido`);
        }

    });

    socket.on(nuevoUsuario, (nombre) => {
        console.log(`Nuevo usuario ${ nombre }`);
        usuarios.set(nombre, socket);

        socket.emit('usuarioAdd', {
            'mensaje' : 'usuario_add',
            'usuarios' : Array.from( usuarios.keys() )
        });

        console.log(`Usuarios`, Array.from( usuarios.keys() ));

        socket.broadcast.emit(listarUsuarios, Array.from( usuarios.keys() ));
    });

    socket.on('disconnect', () => {
        console.log(`Socket desconectado ${ socket.id }`);

        // Buscamos el socket en el mapa y lo borramos 
        for(let [clave, valor] of usuarios){
            if(valor === socket){
                usuarios.delete(clave);

                console.log(`Usuario borrado ${ clave }`);
                break;
            }
        }

        console.log(`Usuarios`, Array.from( usuarios.keys() ));

        socket.broadcast.emit(listarUsuarios, Array.from( usuarios.keys() ));
    });

    
});