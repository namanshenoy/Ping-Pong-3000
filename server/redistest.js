const redis = require('redis')
const fetch = require('node-fetch')
var client = redis.createClient()
const playerRedisKey = 'players_'

client.hset(playerRedisKey, 'test key', '{"test": "val"}', redis.print)

const updateList = async () => {

    const playersObj = { "players" : [ ] }
	const val = await client.hgetall(playerRedisKey, (err, players) => {
		if(!players) {
            console.log('Using cache')

            for(let player in players) {
                let pPlayer = JSON.parse(players[player])
                playersObj.players.push({"name":pPlayer['name'], "rank":pPlayer['rank']})
            }
            return playersObj
		} else {
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
            fetchPlayers().then(x=> console.log('logging after fetchPlayer ',x))

		}
	}

	)

	if(val) {
		console.log('I have value!')
	} else {
		console.log('Darn, there\'s nothing here!')
	}
	return val
}

console.log('return value for uL ' , updateList().then(x => console.log(x)))
