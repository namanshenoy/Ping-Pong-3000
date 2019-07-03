const express = require('express')

const app = express()

app.get('/getPlayers', (req, res) => {
    const cameronSamplePlayers = { "players" : [ 
        {
            "name" : "joe",
            "id" : 1,
            "rank" : 1,
            "email" : "max.bartnitski@oracle.com",
            "password": "abcd",
            "challenged":false,
            "challenger":false
        },

        {
            "name" : "sal",
            "id" : 0,
            "rank" : 0,
            "email" : "sal.verduzco@oracle.com",
            "password": "abcd",
            "challenged":false,
            "challenger":false
        },
        

        {
            "name" : "cam",
            "id" : 2,
            "rank" : 2,
            "email" : "cameron.durham@oracle.com",
            "password": "abcd",
            "challenged":false,
            "challenger":false
        },


        {
            "name" : "john",
            "id" : 3,
            "rank" : 3,
            "email" : "cameron.durham@oracle.com",
            "password": "abcd",
            "challenged":false,
            "challenger":false
        }

    ]}

    const samplePlayers = {
        "players" : [
            {"name":"cam", "id":2},
            {"name": "max", "id":1},
            {"name":"sal", "id":0}
        ]
    }
    res.json(cameronSamplePlayers)
})

app.listen(8080)