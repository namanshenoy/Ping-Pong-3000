require('dotenv').config();
const request = require('request')
const axios = require('axios')

const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const appToken = process.env.APPTOKEN;
const legacyToken = process.env.LEGACYTOKEN;
const username = 'challenger';
const generalChannelID = 'CLEAKA85A';

const instance = axios.create({
    baseURL: 'https://slack.com/api/',
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
})


async function emailLookup(challenger_email, user_email) {
    await instance.get(`users.lookupByEmail?token=${appToken}&email=${email}`).then(jo => {
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


async function emailLookupAwait(email) {
    let v;
    try {
        v = await instance.get(`users.lookupByEmail?token=${appToken}&email=${email}`).then(jo => {
                console.log('recieved response')
                try {
                    let userid = jo.data.user.id
                    console.log(`user id is ${jo.data.user.id}`)
                    console.log('sending message')
                    return userid
                    // sendMessage(userid)
                } catch (e) {
                    console.log(`ERROR: ${e}`)
                }
            })
        return v;
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}
async function notify(emailFrom, emailTo) {
    let from = await emailLookupAwait(emailFrom)
    let to = await emailLookupAwait(emailTo)
    console.log(`EMAIL 1 ID: ${from} EMAIL 2 ID: ${to}`)
    await sendMessage(from, to)
}


async function sendMessage(from, to) {
    const message = `Hey! You were challenged to a ping pong match by <@${from}>`;
    const params = `token=${appToken}&channel=${to}&link_names=true&text=${message}&as_user=true&username=${username}`
    try {
        await instance.post(`chat.postMessage?${params}`,
            {
            }).then(jo => console.log(jo.data))
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}


// const userid = emailLookup('cameron.r.durham@gmail.com')
async function channel_info() {
    const params = `token=${appToken}`
    try {
        // await instance.get(`channels.list?${params}`)
        // .then( jo => console.log(jo.data))
        return await instance.get(`channels.list?${params}`)
            .then(jo => { console.log(jo); return jo })
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}

async function inviteUser(email, first_name) {
    const params = `token=${legacyToken}&email=${email}&first_name=${first_name}&channels=${generalChannelID}`
    try {
        await instance.post(`users.admin.invite?${params}`)
            .then(jo => console.log(jo.data))
    } catch (e) {
        console.log(`ERROR: ${e}`)
    }
}


// notify('oraclepingpong@gmail.com', 'cameron.r.durham@gmail.com')

module.exports = {
    inviteUser, channel_info, sendMessage, emailLookup, notify
}