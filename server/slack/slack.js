require('dotenv').config();
const request = require('request')
const axios = require('axios')

const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const appToken = process.env.APPTOKEN;
const botToken = process.env.BOTTOKEN;
const legacyToken = process.env.LEGACYTOKEN;
const username = 'challenger';
const generalChannelID = 'CLEAKA85A';

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


// const userid = emailLookup('cameron.r.durham@gmail.com')
async function channel_info(){
    const params = `token=${appToken}`
    try {
        await instance.get(`channels.list?${params}`)
        .then( jo => console.log(jo.data))
    } catch(e) {
        console.log(`ERROR: ${e}`)
    }
}

async function inviteUser(email, first_name) {
    const params = `token=${legacyToken}&email=${email}&first_name=${first_name}&channels=${generalChannelID}`
    try {
        await instance.post(`users.admin.invite?${params}`)
        .then( jo => console.log(jo.data))
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}

// inviteUser('max.bartnitski@oracle.com', 'Max')
// inviteUser('salvador.verduzco@oracle.com', 'Salvador')
// inviteUser('mattcoop27@gmail.com', 'Cameron')
// inviteUser('cameron.durham@oracle.com', 'Cameron')
// inviteUser('oraclepingpong@gmail.com', 'Ping')