const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const fetch = require('node-fetch')

const port = process.env.PORT || 4001
// const index = require('./routes/index')
 
client = redis.createClient()
 
// create express application instance
const app = express()

const server = http.createServer(app)

const io = socketio(server)

const updatePlayerList =  async socket => {
    try {

        playersObj = {"players":[]}
        const res = await 
            fetch('http://localhost:8080/getPlayers')
            .then(response => response.json())
            .then(players => { 
                players.players.forEach(e => {
                playersObj.players.push( { "name": e.name, "rank": e.rank} )            
            })
            return playersObj
        })
        socket.emit('updatePlayers', 
        res.players)
    } catch (error) {
        console.error(`Error: ${error} - ${error.code}`)
    }
}


io.on('connection', socket => {
    console.log('new client connected'), setInterval(
        () => updatePlayerList(socket),
        1000
    )
    socket.on('disconnect', () => console.log('client disconnected'))
})


server.listen(port, () => console.log(`Listening on port ${port}`))