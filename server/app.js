/*jshint esversion: 6 */
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
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

// initialize redis
setPlayerNum(true)


/*
 *                                      BEGIN SOCKET CONNECTIONS
*/

const fetchPlayers = async () => {

    const playersObj = { "data": [] }
    const res = await axios.get('http://localhost:8080/getPlayers')
        .then(players => {
            console.log('players : ' , players, players.data.players)
            players.data.players.forEach(e => {
                playersObj.data.push({ "name": e.name, "rank": e.rank, "inMatch": e.inMatch })
                client.hset(playerRedisKey, e.email, JSON.stringify(e))
            })

            client.set('numPlayers', players.players.length)
            return playersObj
        })
    return res
}



const updateList = async () => {
    console.log('updating list');
    const playersObj = { "data": [] };

    const thisNumPlayers = await getNumPlayersAPI()

    const data = await client.hgetall(playerRedisKey, (err, players) => {
        if (players && Object.keys(players).length === thisNumPlayers ) {
        console.log('players length is ', Object.keys(players).length, 'this num players is ', thisNumPlayers)
            console.log('Using cache')
            for (let player in players) {
                let pPlayer = JSON.parse(players[player])
                playersObj.data.push({ "name": pPlayer['name'], "rank": pPlayer['rank'], "inMatch": pPlayer['inMatch'], 'email': pPlayer['email'] })
            }
            playersObj.data.sort((x, y) => { return x.rank - y.rank })
            console.log('returning playersObj ', playersObj)
            io.emit('updateList', playersObj)
        } else {
            fetchPlayers().then(data => {
                console.log('sending data', playersObj)

                playersObj.data.sort((x, y) => { return x.rank - y.rank })
                io.emit('updateList', playersObj)

            })
        }
    })
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
    const resp = addPlayerCall(req, res)

})

app.post('/login', (req, res) => {
    console.log('logging in player', req.body)

})

app.post('/deletePlayer', (req, res) => {
    console.log('deleting player', req.body)
    delPlayerCall(req, res)

})

app.post('/challengePlayer', (req, res) => {
    console.log('inMatch player ', req.body)
    res.json({ "return": "value" })
})


app.post('/concludeMatch', (req, res) => {
    console.log('concluding match', req.body)
    res.json({ "return": "value" })
})

app.post('/isChallenged', (req, res) => {
    console.log('checking if player ', req.body.email, 'is inMatch')

    res.json({ "inMatch": true })
})

async function addPlayerCall(req, res) {
    try {
        // ensure numPlayers is set
        await checkNumPlayers()

        await axios.post('http://localhost:8080/addPlayer',
            req.body
        ).then((resp) => {
            console.log('added player')
            res.status(200).json(resp.data)
            client.get('numPlayers', (err, val) => {
                console.log('player num is ', val)
                addPlayerToRedis(req.body, parseInt(val) + 1)
                if (err) {
                    console.log('err', err)
                } 
                numPlayersIncr()
            })
        })
    } catch (e) {
        console.log('ERROR: ', e.response.data)
        res.status(400).json(e.response.data)
    }
}

async function delPlayerCall(req, res) {
    try {
        // ensure numPlayers is set
        await checkNumPlayers()

        await axios.post('http://localhost:8080/deletePlayer',
            req.body
            ).then( (resp) => {
                console.log('deleted player')
                res.status(200).json(resp.data)
                deletePlayerFromRedis(req.body)
                numPlayersDecr()
            }).then(() => {
                console.log('starting to update list')
                updateList()
            })
    } catch (e) {
        console.log('ERROR: ', e.response.data)
        res.status(400).json(e.response.data)
    }
}

async function numPlayersDecr() {
    await client.decr('numPlayers', (err, resp) => {
        console.log('numPlayersDecr response: ', resp, ' errors: ', err)
    })
}

async function numPlayersIncr() {
    await client.incr('numPlayers', (err, resp) => {
        console.log('numPlayersIncr response: ', resp, ' errors: ', err)
    })
}

async function checkNumPlayers() {
    await setPlayerNum(false)
}

async function resetPlayerNum() {
    await setPlayerNum(true)
}

// input: boolean to hard-reset playerNum
async function setPlayerNum(reset) {
    await client.get('numPlayers', (err, resp) => {
        if(resp && !reset) {
            console.log('numPlayers already set to ', resp)
            return;
        } else {
            console.log('Resetting numPlayers ')
        }
    })
    const numPlayers = await getNumPlayersAPI()
    await client.set('numPlayers', numPlayers, (err, resp) => {
        console.log('errors: ', err, 'reply: ', resp )
    })
}

async function getNumPlayersAPI() {
    return await axios.get('http://localhost:8080/getPlayers')
    .then((players) => {
        const numPlayers = parseInt( players.data.players.length )
        return numPlayers
    })
}

async function deletePlayerFromRedis(jsonBody) {
    console.log('deleting player with email ', jsonBody, 'target email address ', jsonBody.email)
    await client.hget(playerRedisKey, jsonBody.email, (err, resp) => {
        const json = JSON.parse(resp)
        console.log('getting player rank from ', json)
        const targetRank = parseInt(json.rank)
        console.log('target rank is ', targetRank)
        updateRanks(targetRank)
    })
    await client.hdel(playerRedisKey, jsonBody.email, (err, resp) => {
        console.log('DELETING PLAYER FROM REDIS RESP: ', resp, 'ERR: ', err)
    })
}

async function updateRanks(target) {
    console.log('updating ranks after value ', target)
    await client.hgetall(playerRedisKey, async (err, players) => {
        if(players) {
            for( let player in players) {
                let pPlayer = JSON.parse(players[player])
                let rank = parseInt(pPlayer['rank'])
                
                if(rank > target){
                    pPlayer['rank'] = rank - 1
                    await client.hset(playerRedisKey, pPlayer['email'],  JSON.stringify(pPlayer), (err, resp) => {
                        console.log('updateRanks client hset: ', resp, 'errs: ', err)
                    })
                } 
            }
            console.log('Finished upating ranks and updating list')
            updateList()
        }
    })
}

// set player from json 
async function addPlayerToRedis(jsonBody, rank) {
    jsonBody['rank'] = rank
    jsonBody['name'] = jsonBody['player']
    console.log('adding player', jsonBody, 'key is ', jsonBody.email)
    await client.hset(playerRedisKey, jsonBody.email, JSON.stringify(jsonBody), (err, resp) => {
        console.log('ADDING PLAYER TO REDIS RESP: ', resp, 'ERR: ', err)
    })
    updateList()
}

/*
 *                                      END ENDPOINTS
*/

// start server
server.listen(port, () => {
    console.log(`Socket listening on port ${port}`)
})