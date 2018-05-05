const Chat = require('./models/Chat');

module.exports = function(io){

    let users = {};

    io.on('connection',async socket => {
        console.log('new user connected');

        let messages = await Chat.find({})
                // Que irán desde el ultimo creado
                .sort({ created_at: -1} )
                // Mostramos sólo 9 mensaje
                .limit(8);
        
        socket.emit('load old msgs', messages);

        socket.on('new user',(data, cb) => {
            console.log(data);
            if(data in users){
                cb(false);
            }else{
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;

                let userNick = socket.nickname;
                users[socket.nickname].emit('set actualNick',userNick);
                updateNicknames();
            }
        });

        socket.on('disconnect',data =>{
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
        });
        
        function updateNicknames(){
            io.sockets.emit('usernames', Object.keys(users));
        }


        socket.on('send message', async (data, cb) => {

            // /w <user> <msg>

            var msg = data.trim();

            // Vemos si el mensaje empezo con un arroba
            if(msg.substr(0,1) == '@'){
                msg = msg.substr(1);

                const index = msg.indexOf(' ');
                if(index != -1){
                    var name = msg.substring(0,index);
                    var msg = msg.substring(index + 1);

                    if(name in users){
                        users[name].emit('whisper', {
                            // El mensaje
                            msg,
                            // El nombre
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error! Please enter a Valid User')
                    }
                } else{
                    cb('Error! Please enter your message!')
                }
            }else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });
                await newMsg.save();

                io.sockets.emit('new message',{
                    msg: data,
                    nick: socket.nickname
                });
            }
        });
    });
}