const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const fetch = require('node-fetch')
const redis = require('redis')


const axios = require('axios')
const bodyParser = require('body-parser')
 
const port = process.env.PORT || 4000


// access redis mini-database
const client = redis.createClient("redis://redis:6379")

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const server = http.createServer(app)

const io = socketio(server)

const playerRedisKey = 'players_'


/*
 *                                      BEGIN SOCKET CONNECTIONS
*/

const fetchPlayers = async () => {

				const playersObj = {"players":[]}
				const res = await fetch('http://localhost:8080/getPlayers')
					.then(response => response.json())
					.then(players => { 
						players.players.forEach(e => {
							playersObj.players.push( { "name": e.name, "rank": e.rank} )            
							client.hset(playerRedisKey , e.name, JSON.stringify(e) )
						})
						return playersObj
                    })
                    return res
}


const updateList = async () => {
    console.log('updating list')
    const playersObj = {"data" : [ ] }

    const data = await client.hgetall(playerRedisKey, (err, players) => {

		if(players) {
            console.log('Using cache')

            for(let player in players) {
                let pPlayer = JSON.parse(players[player])
                playersObj.data.push({"name":pPlayer['name'], "rank":pPlayer['rank'], "challenged":pPlayer['challenged']})
            }

            console.log('returning playersObj ' , playersObj)
            io.emit('updateList', playersObj)
            return playersObj
		} else {
            fetchPlayers().then(data=> { 
                console.log('sending data',playersObj)
                io.emit('updateList', playersObj)
        })
		}
    } )
    console.log('data in update list is ' , data)
    return data
}


io.on('connection', socket => {
    console.log('New client connected')  
    updateList()

    socket.on('disconnect', () => console.log('Client disconnected'))
})


client.on('error', (err) => {
    console.log('Error ' + err)
})


/*
 *                                      END SOCKET CONNECTIONS
*/

/*
 *                                      BEGIN ENDPOINTS
*/

app.post('/addPlayer', (req, res) => {
    console.log('adding player')
    const resp = addPlayerCall( req )

})

app.post('/login', (req, res) => {
    console.log('logging in player', req.body)
    
})

app.post('/deletePlayer', (req, res) => {
    console.log('deleting player', req.body)
})

app.post('/challengePlayer', (req, res) => {
    console.log('challenged player ' , req.body)
    res.json({"return":"value"})
})


app.post('/concludeMatch', (req, res) => {
    console.log('concluding match' , req.body)
    res.json({"return":"value"})
})

app.post('/isChallenged', (req, res) => {
    console.log('checking if player ', req.body.email , 'is challenged')

    res.json({"challenged":true})
})

async function addPlayerCall(req , res) {
    console.log('ADDING PLAYER',req,  req.body)
    try {
    const response = await axios.post('http://localhost:8080/addPlayer',
            req.body
        ).then( (resp) => {
            console.log('RESPONSE IS ' , resp)
            if(resp.status >= 300) {
                console.log('ERROR!!!')
            } else {
                console.log('VALID')
            }
            res.json({"test":"response"})
        }).catch((e) => {
            console.log('error is ' , e)
            res.json({"error": e.body})
        })
    } catch (e) {
        console.log('catching in catch block error: ', e)
    }
}

/*
 *                                      END ENDPOINTS
*/

// start server
server.listen(port, () => {
    console.log(`Socket listening on port ${port}`)
})