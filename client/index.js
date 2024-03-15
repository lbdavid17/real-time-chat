import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket=io({
    auth:{
        serverOffset: 0
    }
});

const form= document.getElementById('form');
const message= document.getElementById('message');
const allMessages= document.getElementById('all');


socket.on('chat message', (msg, serverOffset)=>{
    const item= `<li>${msg}</li>`
    allMessages.insertAdjacentHTML('beforeend',item);
    socket.auth.serverOffset= serverOffset;
});

form.addEventListener('submit', (e) =>{
    e.preventDefault();
    if (message.value){
        socket.emit('chat message', message.value);
        message.value='';
    }
});
