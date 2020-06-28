const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } =require('../utilidades/utilidades')

const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if ( !data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }
        client.join(data.sala);
        usuarios.agregarPersona( client.id ,data.nombre, data.sala );
        let personas = usuarios.getPersonasPorSala(data.sala);
        client.broadcast.to(data.sala).emit( 'listaPersonas', personas );
        return  callback(personas);
    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona( client.id );
        client.broadcast.to(personaBorrada.sala).emit( 'crearMensaje', crearMensaje('Administrador',`${ personaBorrada.nombre } abandonó el chat`));
        client.broadcast.to(personaBorrada.sala).emit( 'listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala) );
    });

    client.on('crearMensaje', data => {

        let persona = usuarios.getPersona(client.id);

        const mensaje=crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit( 'crearMensaje', mensaje);
    })
   
    client.on('crearPrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit( 'crearMensaje', crearMensaje(persona.nombre, data.mensaje));

    });
   
});