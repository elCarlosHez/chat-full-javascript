

(function(){
    const socket = io();

    //Shorthand of getElementById
    var $ = function(id){
        return document.getElementById(id);
    }

    // Getting DOM elements from the interface
    const messageForm = $('message-form');
    const messageBox = $('message');
    const chat = $('chat');
    
    // Getting DOM elements from the nicknameForm
    const nickForm = $('nickForm');
    const nickError = $('nickError');
    const nickName = $('nickname');

    const users = $('usernames');

    const usersNick = new Array();
    const actualNick = {};


    nickForm.onsubmit = e =>{
        e.preventDefault();
        socket.emit('new user', nickName.value, data => {
            if(data === 3){
                $('nickWrap').style.display = 'none';
                $('contentWrap').classList.remove('invisible');
            }else if(data == 2){
                nickError.style.display = 'block';
                nickError.innerHTML = `<i class="fas fa-times-circle"></i>  The username cannot contain spaces or more than 11 letters`;
            }else if(data == 1){
                nickError.style.display = 'block';
                nickError.innerHTML = `<i class="fas fa-times-circle"></i>  Empty username`;
            }else if(data === 0){
                nickError.style.display = 'block';
                nickError.innerHTML = `<i class="fas fa-times-circle"></i>  That username already exits!`;
            }
            nickName.value = '';
        });
    }

    //Events
    messageForm.onsubmit = e =>{
        e.preventDefault();
        socket.emit('send message', messageBox.value, data =>{
            chat.innerHTML += `<p class="error"><i class="fas fa-times-circle"></i> ${data} </p>`;
        });
        messageBox.value = "";
    }

    socket.on('new message', data => {
        chat.innerHTML += `<p class="chat-message"><span class="user-nick"> ${data.nick} : </span> ${data.msg} </p>`; 
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
            newLiUser.setAttribute('id',`user-${data[i]}`);
            newLiUser.setAttribute('class','ed-item user');
            newLiUser.innerHTML += '<i class="fas fa-user">  </i>';
            newLiUser.appendChild(document.createTextNode(`  ${data[i]}`));

            users.appendChild(newLiUser);
        }

        // Set actual user state
        $('user-'+actualNick.nick).classList.add('actualUser');
    });

    socket.on('whisper',data => {
        chat.innerHTML +=`<p class="chat-message whisper"><span class="user-nick"> ${data.nick} : </span> ${data.msg} </p>`;
    })

    socket.on('scream',data =>{
        chat.innerHTML +=`<p class="chat-message scream"><span class="user-nick"> ${data.nick} : </span> ${data.msg} </p>`;
    })

    socket.on('load old msgs', msgs => {
        for(let i = msgs.length - 1; i >= 0; --i){
            displayMsg(msgs[i]);
        }
    })

    socket.on('load all msgs',msgs =>{
        // clean chat box
        cleanChat();

        for(let i = msgs.length - 1; i >= 0; --i){
            displayMsg(msgs[i]);
        } 
    })

    socket.on('clean messages', e => {
        cleanChat();
    });

    function displayMsg(data){
        chat.innerHTML += `<p class="chat-message"><span class="user-nick"> ${data.nick} : </span> ${data.msg} </p>`;
    }

    function cleanChat(){
        while(chat.firstChild){
            chat.removeChild(chat.firstChild);
        }
    }

}());