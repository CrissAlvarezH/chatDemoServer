const net = require('net');
const express = require('express');
app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var puerto = 6000;
server.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${ puerto }`);
});

let dispositivo;

io.on('connection', (cliente) => {
    console.log(`Cliente conectado a io ${ cliente.id }`);

    cliente.on('nuevoUsuario', (data) => {
        

        dispositivo = cliente;// lo hacemos el dispositivo que va a recibir lo que trae el tracker

        // Le avisamos que fue añadido
        cliente.emit('usuarioAdd', {
            'mensaje' : 'usuario_add',
            'usuarios' : []
        });

    });

    cliente.on('disconnect', () =>{
        dispositivo = undefined;

        console.log(`Cliente desconectado de io`);
    });
});


// Para los trackers
net.createServer( (cliente) => {
    console.log('Cliente conectado');

    cliente.on('end', () => {
        console.log('Cliente desconectado');
    });

    cliente.on('data', (data) => {
        console.log("datos recibidos del cliente\n", data.toString());

        let arrayData = data.toString().split(",");// dividimos por coma

        switch( arrayData.length ){
            case 1:
                cliente.write("ON");
                break;
            case 3:
                if(arrayData[0] == "##"){
                    cliente.write("LOAD");
                }
                break;
            case 13:
                if(dispositivo){
                    console.log(`Se envió mensaje`);

                    dispositivo.emit('nuevoTexto', {'texto':data.toString(),  'de': 'Tracker'});
                }else{
                    console.log(`Dispositivo undefined`);
                }
                break;
        }
    });



})
.listen(4000, () => {
    console.log("Servidor net conectado en el puerto 4000");
});