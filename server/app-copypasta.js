const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const fetch = require('node-fetch')
const redis = require('redis')

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
                // client.hset(playerRedisKey , e.name, JSON.stringify(e) , redis.print)
            })
            return playersObj
        })
        socket.emit('updatePlayers', 
        res.players)
    } catch (error) {
        console.error(`Error: ${error} - ${error.code}`)
    }
}

const updatePlayerLists = async socket => {
        
        client.hgetall(playerRedisKey, (err, players) => {
            const playersObj = { "players" : [ ] }
            const res = null
            
            if(players) {
                console.log('Using cache')

                for (player in players) {
                    let pPlayer = JSON.parse(players[player])
                    playersObj.players.push({"name": pPlayer["name"], "rank":pPlayer["rank"], "email":pPlayer["email"]})
                }

                res = playersObj
            } else {
                const res = 
                fetch('http://localhost:8080/getPlayers')
                    .then(response => response.json())
                    .then(players => {
                        players.players.forEach(e => {
                            playersObj.players.push({ "name": e.name, "rank": e.rank })
                            // client.hset(playerRedisKey , e.name, JSON.stringify(e) , redis.print)
                        })
                        return playersObj
                    })
            }


        socket.emit('updatePlayers', 
        res.players)
        })
}

io.on('connection', socket => {
    console.log('new client connected'), setInterval(
        () => updatePlayerLists(socket),
        1000
    )
    socket.on('disconnect', () => console.log('client disconnected'))
})



// set global redis key for players
const playerRedisKey = 'players_'

// create redis redis on default port 6379
// const redis = redis.createClient()

// echo redis errors on console
client.on('error', (err) => {
    console.log("Error " + err)
})

app.post('/swap', (req,res) => {
    console.log('Swapping players')
    // console.log('swapping player: ', req.body.name)
})


app.get('/players', (req, res) => {
    client.hgetall(playerRedisKey , (err, players) => {

        const playersObj = { "players" : [ ] }
        if(players) {
            console.log('using cache')

            for(player in players) {
                let pPlayer = JSON.parse(players[player])
                playersObj.players.push({"name":pPlayer['name'], "rank":pPlayer['rank']})
            }

            res.json(playersObj)
        } else {

            fetch('http://localhost:8080/getPlayers')
            .then(response => response.json())
            .then(players => { 
                players.players.forEach(e => {
                playersObj.players.push( { "name": e.name, "rank": e.rank} )            
                client.hset(playerRedisKey , e.name, JSON.stringify(e) , redis.print)
            })

            res.json(playersObj)
        })
            .catch(e => {console.log('error : ' + e)})
        }

    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))