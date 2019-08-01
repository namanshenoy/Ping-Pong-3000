const axios = require('axios')
const url = "http://localhost:4000"

axios.defaults.headers.post['Content-Type'] = 'application/json';


async function getPlayers() {
    var players
    try {
        await axios({
            url: url + '/getPlayers',
            method: 'get',
            data: null
        })
            .then(async resp => {
                players = resp.data.players
            })
        return players
    } catch (e) {
        if (e.response && e.response.data) {
            console.log("ERROR: ", e.response.data)
            return e.response.data
        } else {
            console.log("ERROR: " + e)
            return e
        }
    }
}


async function callEndpoint(endpoint, data) {
    try {
        await axios({
            url: url + endpoint,
            method: 'post',
            data: data
        })
            .then(resp => {
                console.log('DATA: ', resp.data)
                return resp.data
            })
    } catch (e) {
        if (e.response && e.response.data) {
            console.log("ERROR: ", e.response.data)
            return e.response.data
        } else {
            console.log("ERROR: " + e)
            return e
        }
    }
}

async function clearPlayers() {

    const players = await getPlayers();

    players.forEach(async e => {
        await callEndpoint('/deletePlayer', { email: e.email })
    })
}

beforeEach( async () => {
    await clearPlayers()
})

// afterEach( async () => {
//     await clearPlayers()
// })

test('add two players and incr rank', async () => {
    var retVal = await callEndpoint('/addPlayer', { player: 'test1', email: 'test1@oracle.com', password: '1234' });
    expect(retVal).not.toBe(null);

    retVal = await callEndpoint('/addPlayer', { player: 'test1', email: 'test1@oracle.com', password: '1234' });

    expect(retVal).not.toBe(null);
})