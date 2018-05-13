const Chat = require('./models/Chat');

module.exports = function(io){

    let users = {};
    const number_messages = 8;


    io.on('connection',async socket => {
        console.log('new user connected');

        let messages = await Chat.find({})
                // The order of the message would be from de last
                .sort({ created_at: -1} )
                // We just going to send a number o message from the data base
                .limit(number_messages);
        
        socket.emit('load old msgs', messages);

        socket.on('new user',(data, cb) => {
            data = data.trim();
            console.log(`Nick : ${data}`);
            //  0 = User already exist
            //  1 = Empty username
            //  2 = Username more than 11 letters or has spaces
            //  3 = Correct Username
            if(data in users){
                cb(0);
            }else if(!data){
                cb(1);
            }else if(data.length > 11 || data.indexOf(" ") != -1){
                cb(2);
            }else{
                cb(3);
                
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

        function save_message(_msg,_nick){
            var newMsg = new Chat({
                msg: _msg,
                nick: _nick
            });
            newMsg.save();
        }

        socket.on('send message', async (data, cb) => {

            // /w <user> <msg>

            var msg = data.trim();

            // If the message start with @, its a whisper message
            if(msg.substr(0,1) === '@'){
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
                        cb('Error! Please enter a Valid User');
                    }
                } else{
                    cb('Error! Please enter your message!');
                }
            }else if(msg.substr(0,2) === '/s'){
                msg = msg.substr(2);
                const index = msg.indexOf(' ');
                
                if(index != -1){
                    await save_message(msg,socket.nickname);
                    io.sockets.emit('scream',{
                        msg,
                        nick: socket.nickname
                    });
                }else{
                    cb('Error! Please enter your message!');
                }
            }else if(msg.substr(0,4) === '/all'){
                if(msg.length == 4){
                    // get all messages
                    let messages = await Chat.find({}).sort({ created_at: -1});
                    // send all messages
                    users[socket.nickname].emit('load all msgs',messages);
                }else{
                    cb(`Invalid command`);
                }
            }else if(msg.substr(0,6) == '/clean'){
                if(msg.length == 6){
                    users[socket.nickname].emit('clean messages');
                }else{
                    cb(`Invalid command`);
                }
            }else{
                await save_message(msg,socket.nickname);

                io.sockets.emit('new message',{
                    msg: data,
                    nick: socket.nickname
                });
            }
        });
    });
}