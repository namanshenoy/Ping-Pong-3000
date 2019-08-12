const request = require('request')
const axios = require('axios')

const clientID = '683414152146.721420977238'
const clientSecret = '96e31a3fbb708d92180c9427f0d8afa7'
const appToken = 'xoxb-683414152146-721539568566-TcBSm9u1VNcU3c6kXhR3xW6K'
const username = 'challenger'

const instance = axios.create({
    baseURL: 'https://slack.com/api/',
    headers: {'Content-Type':'application/json; charset=utf-8'}
})


async function emailLookup(email) {
    await instance.get(`users.lookupByEmail?token=${appToken}&email=${email}`).then(jo=> {
        console.log('recieved response')
        try {
            let userid = jo.data.user.id
            console.log(`user id is ${jo.data.user.id}`)
            console.log('sending message')
            sendMessage(userid)
        } catch (e) {
            console.log(`ERROR: ${e}`)
        }
    })
}
async function sendMessage(userID) {
    const message = `Hey! You were challenged to a ping pong match by <@${userID}>`;
    const params = `token=${appToken}&channel=${userID}&link_names=true&text=${message}&as_user=true&username=${username}`
    try {
        await instance.post(`chat.postMessage?${params}`,
        {
        }).then(jo => console.log(jo.data))
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}


const userid = emailLookup('cameron.r.durham@gmail.com')
