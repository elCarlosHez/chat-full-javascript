

(function(){
    const socket = io();

    //Shorthand of getElementById
    var byId = function(id){
        return document.getElementById(id);
    }

    // Getting DOM elements from the interface
    const messageForm = byId('message-form');
    const messageBox = byId('message');
    const chat = byId('chat');
    
    // Getting DOM elements from the nicknameForm
    const nickForm = byId('nickForm');
    const nickError = byId('nickError');
    const nickName = byId('nickname');

    const users = byId('usernames');

    const usersNick = new Array();
    const actualNick = {};


    nickForm.onsubmit = e =>{
        e.preventDefault();
        socket.emit('new user', nickName.value, data => {
            if(data){
                byId('nickWrap').style.display = 'none';
                byId('contentWrap').classList.remove("invisible");
            }else{
                nickError.style.display = 'block';
                nickError.innerHTML = '<i class="fas fa-times-circle"></i>  That username already exits';
            }
            nickName.value = '';
        });
    }

    //Events
    messageForm.onsubmit = e =>{
        e.preventDefault();
        socket.emit('send message', messageBox.value, data =>{
            chat.innerHTML += '<p class="error">' + data + "</p>";
        });
        messageBox.value = "";
    }

    socket.on('new message', data => {
        chat.innerHTML += '<p class="chat-message"><span class="user-nick">' + data.nick + ': </span>' + data.msg + '</p>';/* '<b>' + data.nick + '</b>: ' + data.msg + '<br/>'; */
        
    });

    // Assign actual user
    socket.on('set actualNick', nick =>{
        actualNick.nick = nick;
    })

    socket.on('usernames', data =>{
        while(users.firstChild){
            users.removeChild(users.firstChild);
        }
        for(let i = 0; i < data.length; i++){
            let newLiUser = document.createElement('li');
            // Assign an id
            newLiUser.setAttribute('id','user-'+data[i]);
            newLiUser.setAttribute('class','ed-item user');
            newLiUser.innerHTML += '<i class="fas fa-user">  </i>';
            newLiUser.appendChild(document.createTextNode('  ' + data[i]));

            users.appendChild(newLiUser);
        }

        // Set actual user state
        byId('user-'+actualNick.nick).classList.add('actualUser');
    });

    socket.on('whisper',data => {
        chat.innerHTML +='<p class="chat-message whisper"><span class="user-nick">' + data.nick + ': </span>' + data.msg + '</p>';
    })

    socket.on('load old msgs', msgs => {
        for(let i = msgs.length - 1; i >= 0; --i){
            displayMsg(msgs[i]);
        }
    })

    function displayMsg(data){
        chat.innerHTML += '<p class="chat-message"><span class="user-nick">' + data.nick + ': </span>' + data.msg + '</p>';
    }

}());