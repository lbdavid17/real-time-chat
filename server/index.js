import express from 'express';
import logger from 'morgan';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();
const port= process.env.port ?? 3000;

const app= express();
const server= createServer(app);
const io= new Server(server);

const db= createClient({
    url: "libsql://chatdb-david.turso.io",
    authToken: process.env.DB_TOKEN
});

await db.execute(
    `CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT)`
)


io.on('connection',async (socket)=>{
    console.log('a new user is connected');

    socket.on('disconnect',()=>{
        console.log('a user has disconnected');
    });

    socket.on('chat message', async (msg) =>{
        let result;
        try{
            result= await db.execute({
                sql:`INSERT INTO messages (content) VALUES (?)`,
                args: [msg]
            } );
        }catch(e){
            console.error(e);
        }

        io.emit('chat message',msg, result.lastInsertRowid.toString())
    });

    if (!socket.recovered) {
        try {
          const results = await db.execute({
            sql: `SELECT id, content FROM messages WHERE id > ?`,
            args: [socket.handshake.auth.serverOffset ?? 0]
          })
    
          results.rows.forEach(row => {
            socket.emit('chat message', row.content, row.id)
          })
        } catch (e) {
          console.error(e)
        }
      }
});


app.use(logger('dev'));

app.get('/', (req,res) => {
    //res.send('<h1>This is the chat</h1>')
    res.sendFile(process.cwd()+'/client/index.html');
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})