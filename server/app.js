const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const fetch = require('node-fetch')
const redis = require('redis')

const port = process.env.PORT || 4001

// access redis mini-database
client = redis.createClient()

const app = express()

const server = http.createServer(app)

const io = socketio(server)

const updatePlayerList = 'todo function'

