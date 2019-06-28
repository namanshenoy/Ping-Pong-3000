const fetch = require('node-fetch')
const axios = require('axios')

function checkStatus(res) {
    if(res.ok){
        console.log('No error!')
        return res
    } else {
        console.log('Error!!!')
        return res
    }
}

function makeFetchRequest(url, type, jsonBody) {
    fetch(url, { method: type , body: JSON.stringify(jsonBody), headers: {'Content-Type' : 'application/json'} })
    .then(checkStatus)
    .then(data => console.log(data))
}

function makeGetRequest(url, jsonBody){
    makeFetchRequest(url, 'GET', jsonBody)
}

function makePostRequest(url, jsonBody){
    makeFetchRequest(url, 'POST', jsonBody)
}


// console.log('logging fetch', fetch('http://localhost:8080/addPlayer', {method: 'POST', body: JSON.stringify({"player": "camerond", "email": "cdurhammm@oracle.com", "password":"02390r932r"}), headers: {'Content-Type':'application/json'} }).
// then(checkStatus).then(res => res.json()).then(data => console.log(data)))

let myUrl = 'http://localhost:8080/addPlayer'

// makePostRequest(myUrl, {"player": "naman", "email":"nshenoy@oracle.com", "password": "1234"})

async function addPlayer(data) {
    try {
        console.log('awaiting add player')
        // await axios({
        //     method: 'post', 
        //     url: 'http://localhost:8080/addPlayer',
        //     body: {
        //         "name" : "joseph", 
        //         "email": "joseph@oracle.com",
        //         "password" : "123123"
        //     }
        // }).then( (data) => console.log(data, 'the body', data.data))

        await axios.post('http://localhost:4001/addPlayer',
             {
                "name" : "johnny", 
                "email": "johnny@oracle.com",
                "password" : "123123"
            }

        ).then( (data) => console.log(data, '**************\nthe body', data.body))
        console.log('addedPlayer')
    } catch (e) {
        console.log('Error in addPlayer!!', e)
    }
}

async function getPlayer() {
    try {
        await axios.get('http://localhost:8080/getPlayers').then((data) => console.log(data.data))
    } catch (err) {
        console.log('error ', err)
    }
}
getPlayer()
addPlayer()