const axios = require('axios')
const qs = require('qs')
const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' }
}

axios(options)


axios.defaults.headers.post['Content-Type'] = 'application/json';

async function callEndpoint(endpoint, data) {
    try {
        await axios
            .post(endpoint,
                data
            )
            .then(resp => {
                try {

                    console.log('recieving response')
                    console.log('DATA: ', resp.data)
                } catch (e) {
                    console.log(e)
                }
            })
    } catch (e) {
        try {

            if (e.response && e.response.data) {
                console.log("ERROR: ", e.response.data)
            } else {
                console.log(e)
            }
        }
        catch (e) {
            console.log(e)
        }
    }
}

// add players
async function test() {
    try {
        const url = "http://localhost:4000"


        await callEndpoint(url + '/deletePlayer', { email: 'test1@oracle.com' })
        await callEndpoint(url + '/deletePlayer', { email: 'test2@oracle.com' })
        await callEndpoint(url + '/deletePlayer', { email: 'test3@oracle.com' })

        await callEndpoint(url + "/addPlayer", { player: "test1", email: "test1@oracle.com", password: "1234" })
        await callEndpoint(url + "/addPlayer", { player: "test2", email: "test2@oracle.com", password: "1234" })
        await callEndpoint(url + "/addPlayer", { player: "test3", email: "test3@oracle.com", password: "1234" })

        await callEndpoint(url + '/challengePlayer', { email: 'test2@oracle.com', password: "1234" })
        await callEndpoint(url + '/concludeMatch', { email: 'test2@oracle.com', password: "1234" })

        await callEndpoint(url + '/challengePlayer', { email: 'test1@oracle.com', password: "1234" })
        await callEndpoint(url + '/concludeMatch', { email: 'test1@oracle.com', password: "1234" })
        // await callEndpoint(url + '/deletePlayer', { email: 'test1@oracle.com' })
        // await callEndpoint(url + '/deletePlayer', { email: 'test2@oracle.com' })

        // callEndpoint(url + '/deletePlayer', { email: 'test3@oracle.com' })
        // callEndpoint(url + '/deletePlayer', { email: 'test4@oracle.com' })
    } catch (e) {
        console.log('CATCHING TEST ERR: ', e)
    }
}

test()