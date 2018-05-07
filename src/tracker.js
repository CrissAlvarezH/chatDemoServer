const net = require('net');

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
                break;
        }
    });



})
.listen(5000, () => {
    console.log("Servidor net conectado en el puerto 5000");
});