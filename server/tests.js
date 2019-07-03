const axios = require('axios')
const url = "http://localhost:4000"



axios.defaults.headers.post['Content-Type'] = 'application/json';

async function callEndpoint(endpoint, data) {
    try {
        await axios({
            url: url + endpoint,
            method: 'post',
            data: data
        })
            .then(resp => {
                    console.log('DATA: ', resp.data)
            })
    } catch (e) {
            if (e.response && e.response.data) {
                console.log("ERROR: ", e.response.data)
            } else {
                console.log("ERROR: " + e)
            }
    }
}
async function deletePlayer(data){
    try {
        await axios({
            url: 'http://localhost:4000/deletePlayer', 
            method: 'post',
            data: data

        }).then((resp) => {
            console.log('DATA: ', resp.data)
        })
    } catch (e) {
        console.log('ERRORS ', e.response.data)
    }
}

// add players
async function test() {
    try {

        await callEndpoint('/deletePlayer', { email: 'test1@oracle.com' })
        await callEndpoint('/deletePlayer', { email: 'test2@oracle.com' })
        await callEndpoint('/deletePlayer', { email: 'test3@oracle.com' })
        // await callEndpoint('/deletePlayer', { email: 'test4@oracle.com' })
        // await callEndpoint('/deletePlayer', { email: 'test5@oracle.com' })
        // await callEndpoint('/deletePlayer', { email: 'test6@oracle.com' })

        await callEndpoint("/addPlayer", { player: "test1", email: "test1@oracle.com", password: "1234" })
        await callEndpoint("/addPlayer", { player: "test2", email: "test2@oracle.com", password: "1234" })
        await callEndpoint("/addPlayer", { player: "test3", email: "test3@oracle.com", password: "1234" })
        // await callEndpoint(url + "/addPlayer", { player: "test4", email: "test4@oracle.com", password: "1234" })
        // await callEndpoint(url + "/addPlayer", { player: "test5", email: "test5@oracle.com", password: "1234" })
        // await callEndpoint(url + "/addPlayer", { player: "test6", email: "test6@oracle.com", password: "1234" })

        await callEndpoint( '/challengePlayer', { email: 'test2@oracle.com', password: "1234" })
        await callEndpoint( '/concludeMatch', { email: 'test1@oracle.com', password: "1234" })

        // await callEndpoint(url + '/challengePlayer', { email: 'test2@oracle.com', password: "1234" })
        // await callEndpoint(url + '/challengePlayer', { email: 'test4@oracle.com', password: "1234" })
        // await callEndpoint(url + '/challengePlayer', { email: 'test6@oracle.com', password: "1234" })
        // await callEndpoint(url + '/challengePlayer', { email: 'test1@oracle.com', password: "1234" })
        // await callEndpoint(url + '/deletePlayer', {email:'test5@oracle.com'})
        // await callEndpoint(url + '/challengePlayer', { email: 'test6@oracle.com', password: "1234" })
        // await callEndpoint(url + '/concludeMatch', { email: 'test1@oracle.com', password: "1234" })

        // await callEndpoint(url + '/deletePlayer', { email: 'test1@oracle.com' })
        // await callEndpoint(url + '/deletePlayer', { email: 'test2@oracle.com' })

        // callEndpoint(url + '/deletePlayer', { email: 'test3@oracle.com' })
        // callEndpoint(url + '/deletePlayer', { email: 'test4@oracle.com' })
    } catch (e) {
        console.log('CATCHING TEST ERR: ', e)
    }
}

test()