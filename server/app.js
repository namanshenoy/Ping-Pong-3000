/*jshint esversion: 8 */
require('dotenv').config();
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const redis = require("redis");

const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
axios.defaults.headers.post['Content-Type'] = 'application/json';
const auth = require('./auth');

const port = process.env.PORT || 4000;

// console.log(process.env.HOSTNAME === 'nashenoy-linux')
// access redis mini-database
const client = process.env.HOSTNAME === 'localhost' ? redis.createClient({ password: process.env.REDIS_PASS }) : redis.createClient("redis://localhost:6379", { password: process.env.REDIS_PASS });

if (process.env.HOSTNAME === 'localhost' && client) {
  console.log('created connection to redis instance locally')
} else {
  console.log('created connection to redis instance on server')
}

const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const server = http.createServer(app);

const io = socketio(server);

const playerRedisKey = "players_";

// initialize redis
setPlayerNum(true);

/*
 *                                      BEGIN SOCKET CONNECTIONS
 */

async function fetchPlayers() {
  const playersObj = { data: [] };
  // console.log('GETTING PLAYER')
  const res = await axios
    .get(`http://${process.env.HOSTNAME}:8080/getPlayers`)
    .then(players => {
      // console.log("players : ", players.data.players);
      players.data.players.forEach(e => {
        // let playerRatio = e.losses === 0 ? e.wins : e.wins / e.losses;
        playersObj.data.push({
          name: e.firstName,
          rank: e.rank,
          score: e.score,
          email: auth.encrypt(e.email),
        });
        console.log('Saving to redis:', e)
        setPlayerRedis(e);
      });

      const len = players.players ? players.players.length : 0;
      client.set("numPlayers", len);
      return playersObj;
    })
    .catch(e => console.log('GETTING PLAYERS ERROR\n',e))
  return res;
}

async function updateList(useCache) {
  const playersObj = { data: [] };

  const thisNumPlayers = await getNumPlayersAPI();

  const data = await client.hgetall(playerRedisKey, (err, players) => {
    if (players && Object.keys(players).length === thisNumPlayers && useCache) {
      for (let player in players) {
        let pPlayer = JSON.parse(players[player]);
        // let pRatio = pPlayer.losses === 0 ? pPlayer.wins : pPlayer.wins / pPlayer.losses;
        // console.log('player wins : ' + pPlayer.wins + ' player losses ' + pPlayer.losses + ' ratio will be ' + pRatio)
        console.log(pPlayer)
        playersObj.data.push({
          name: pPlayer.firstName,
          rank: pPlayer.rank,
          email: auth.encrypt(pPlayer.email),
          score: pPlayer.score
        });
      }
      playersObj.data.sort((x, y) => {
        return x.rank - y.rank;
      });

      io.emit("updateList", playersObj);
    } else {
      console.log('Fetching players')
      fetchPlayers()
        .then(data => {
          // console.log(data)
          playersObj.data.sort((x, y) => {
            return x.rank - y.rank;
          });
          io.emit("updateList", data);
        })
        .catch(error => {
          console.log('FETCHPLAYERS ERROR', error)
        })
      ;
    }
  });
  return data;
}

io.on("connection", socket => {
  // console.log("New client connected");
  updateList(true);
  socket.on("disconnect", () => console.log("Client disconnected"));
});


client.on("error", () => {
});

/*
 *                                      END SOCKET CONNECTIONS
 */

/*
 *                                      BEGIN ENDPOINTS
 */

app.post("/addPlayer", async (req, res) => {
  // if (await authHelper(req, res) === false) {
  //   return;
  // } else if (await auth.deauth(req.body.token, req.body.email) === false) {
  //   return;
  // }
  addPlayerCall(req, res);
});

app.post("/updatePlayer", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  } else if (await auth.deauth(req.body.token, req.body.email) === false) {
    return;
  }
  updatePlayerCall(req, res);
});

app.post("/login", (req, res) => {
  loginPlayerCall(req, res);
});

app.post("/deletePlayer", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  } else if (await auth.deauth(req.body.token, req.body.email) === false) {
    return;
  }
  console.log('DELETEING PLAYER', req.body)
  delPlayerCall(req, res);
});

app.post("/challengePlayer", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  }
  challengePlayerCall(req, res);
});

app.get('/getPlayers', async (req, res) => {
  try {
    await axios.get(`http://${process.env.HOSTNAME}:8080/getPlayers`).then(resp => {
      // console.log(resp.data.)
      const out = resp.data.players.map(player => ( { ...player, email: auth.encrypt(player.email) } ));
      // console.log(out)
      res.status(200).json({ players: out })
    })
  } catch (e) {
    console.log('ERRGETPLAYERS:', e)
    res.status(400)
  }
})

app.get('/getRedisPlayers', async (req, res) => {
  try {
    // console.log('Getting players from redis')
    await client.hgetall(playerRedisKey, (err, players) => {
      res.status(200).json(players)
    })
  }
  catch (e) {
    console.log('ERR:', e);
    res.status(400);
  }
})

app.post("/concludeMatch", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  }
  concludeMatch(req, res);
});

app.post("/isChallenged", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  }

  res.json({ inMatch: true, logout: false });
});

app.post("/inMatch", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  }
  forwardInMatch(req, res)
})

app.post('/getRedisPlayers', (req, res) => {
  getRedisPlayers(res)
})

//TODO
app.post("/manageScores", async (req, res) => {
  if (await authHelper(req, res) === false) {
    return;
  } else if (await auth.deauth(req.body.token, req.body.email) === false) {
    return;
  }
  manageScoresCall(req, res);
});

async function getRedisPlayers(res) {
  await client.hgetall(playerRedisKey, (err, resp) => {
    res.status(200).json(resp);
  });
}
async function forwardInMatch(req, res) {
  try {
    await axios.post(`http://${process.env.HOSTNAME}:8080/inMatch`, req.body).then(resp => {
      resp.data.logout = false;
      res.status(200).json(resp.data)
    })
  } catch (e) {
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }

}

async function addPlayerCall(req, res) {
  try {
    // ensure numPlayers is set
    await checkNumPlayers();

    await axios.post(`http://${process.env.HOSTNAME}:8080/addPlayer`, req.body)
      .then(async resp => {
        // authenticate new user to log in immediately
        const token = await auth.login(req.body.email);
        resp.data.token = token;
        console.log(token)
        res.status(200).json(resp.data);
        client.get("numPlayers", (err, val) => {
          addPlayerToRedis(req.body, parseInt(val) + 1)
            .then(() => console.log('Added ' + req.body.email))
          if (err) {
            console.log("err", err);
          }
          numPlayersIncr();
        });
      })
      .catch(e => {
        console.log('ADDPLAYERERROR:', e.response.data)
        res.json(e.response.data.error).status(400);
      })
  } catch (e) {
    console.log("ERROR123: ", e.response.data);
    e.response.data.logout = false;
    res.json(e.response.data).status(400);
  }
}
async function updatePlayerCall(req, res) {
  try {

    // ensure numPlayers is set
    await checkNumPlayers();
    const reqDecrypted = req.body;
    reqDecrypted.email = auth.decrypt(req.body.email);

    // console.log(reqDecrypted);

    await axios.post(`http://${process.env.HOSTNAME}:8080/updatePlayer`, reqDecrypted).then(async resp => {
      // authenticate new user to log in immediately
      const token = await auth.login(reqDecrypted.email);
      resp.data.token = token;
      res.status(200).json(resp.data);
      client.get("numPlayers", (err, val) => {
        addPlayerToRedis(reqDecrypted, parseInt(val) + 1);
        if (err) {
          console.log("err33", err);
        }
        numPlayersIncr();
      });
    });
  } catch (e) {
    console.log("ERROR123: ", e.response.data);
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }
}

//TODO
async function manageScoresCall(req, res) {
  try {

    // ensure numPlayers is set - making sure the table isn't empty
    await checkNumPlayers();
    const reqDecrypted = req.body;
    // We have to decrypt the email address in order to be able to use it to index into the table
    reqDecrypted.email = auth.decrypt(req.body.email);



  } catch (e) {

  }
}

//TODO
async function manageScoresInRedis(jsonBody, updated_wins, updated_losses) {

}

async function delPlayerCall(req, res) {
  try {
    // ensure numPlayers is set
    await checkNumPlayers();

    const reqDecrypted = req.body;
    reqDecrypted.email = auth.decrypt(req.body.email);

    // console.log(reqDecrypted);
    await axios
      .post(`http://${process.env.HOSTNAME}:8080/deletePlayer`, reqDecrypted)
      .then(async resp => {
        resp.data.logout = true;
        res.status(200).json(resp.data);
        await deletePlayerFromRedis(reqDecrypted);
        await numPlayersDecr();
        await auth.deauth(reqDecrypted.token, reqDecrypted.email);
      })
      .then(() => {
        // force reload of new player challenge status
        updateList(false);
      });
  } catch (e) {
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }
}

async function numPlayersDecr() {
  await client.decr("numPlayers", () => {
  });
}

async function numPlayersIncr() {
  await client.incr("numPlayers", () => {
  });
}

async function checkNumPlayers() {
  await setPlayerNum(false);
}

// input: boolean to hard-reset playerNum
async function setPlayerNum(reset) {
  await client.get("numPlayers", (err, resp) => {
    if (resp && !reset) {
      return;
    } else {
    }
  });
  const numPlayers = await getNumPlayersAPI();
  await client.set("numPlayers", numPlayers, () => {
  });
}

async function getNumPlayersAPI() {
  return await axios.get(`http://${process.env.HOSTNAME}:8080/getPlayers`).then(players => {
    const numPlayers = parseInt(players.data.players.length);
    return numPlayers;
  });
}

async function deletePlayerFromRedis(jsonBody) {
  await client.hget(playerRedisKey, jsonBody.email, (err, resp) => {
    if (resp) {
      const json = JSON.parse(resp);
      const targetRank = parseInt(json.rank);
      updateRanks(targetRank);
    }
  });
  await client.hdel(playerRedisKey, jsonBody.email, () => {
  });
}

async function updateRanks(target) {
  await client.hgetall(playerRedisKey, async (err, players) => {
    if (players) {
      for (let player in players) {
        let pPlayer = JSON.parse(players[player]);
        let rank = parseInt(pPlayer.rank);

        if (rank > target) {
          pPlayer.rank = rank - 1;
          setPlayerRedis(pPlayer)
        }
      }
      updateList(true);
    }
  });
}

// set player from json
async function addPlayerToRedis(jsonBody, rank) {
  console.log('Adding/Updating Player:', jsonBody)
  jsonBody["rank"] = rank;
  // jsonBody["inMatch"] = false;
  // jsonBody["wins"] = 0;
  // jsonBody["losses"] = 0;
  // jsonBody["winStreak"] = 0;
  // jsonBody["ratio"] = 0;
  setPlayerRedis(jsonBody);
  updateList(true);
}

async function loginPlayerCall(req, res) {
  try {
    await axios.post(`http://${process.env.HOSTNAME}:8080/login`, req.body).then(async (resp) => {
      console.log('removing old hashes', resp.data)
      await auth.deauthEmail(req.body.email)
      console.log('response data', resp.data, 'adding user to redis')
      const token = await auth.login(req.body.email)
      resp.data.token = token
      res.status(200).json(resp.data);
    });

  } catch (e) {
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }
}

async function challengePlayerCall(req, res) {
  try {
    await axios
      .post(`http://${process.env.HOSTNAME}:8080/challengePlayer`, req.body)
      .then(resp => {
        resp.data.logout = false;
        res.status(200).json(resp.data);
      });

    await client.hget(playerRedisKey, req.body.email, (err, res) => {
      const targetRank = parseInt(JSON.parse(res).rank) - 1;
      setInMatchRank(targetRank);
    });
    await setInMatch(req.body.email);
    updateList(true);
  } catch (e) {
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }
}


async function concludeMatch(req, res) {
  try {
    console.log('*************concluding match************');
    await axios
      .post(`http://${process.env.HOSTNAME}:8080/concludeMatch`, req.body)
      .then(resp => {
        console.log("concluded match -- data is : ", resp.data);
        console.log('success message ' + resp.data.success)
        if (resp.data && resp.data.success.includes('swap')) {
          // update ranks
          swapPlayerRanks(req)
        } else {
          unsetPlayerChallenge(req)
        }
        resp.data.logout = false;
        res.status(200).json(resp.data)
      });
  } catch (e) {
    console.log('ERROR WITHOUT DATA: ', e)
    console.log('ERROR: ', e.response.data)
    e.response.data.logout = false;
    res.status(400).json(e.response.data);
  }
}

/*
 *                                      END ENDPOINTS
 */

/*
 *                            BEGIN HELPER FUNCTIONS
 */


// winner on top
async function unsetPlayerChallenge(req) {
  if (req.body.email) {
    await client.hget(playerRedisKey, req.body.email, (err, res) => {
      console.log('unsetting player ', req.body.email)
      if (res) {
        const loserRank = parseInt(JSON.parse(res).rank) + 1

        // do not swap player ranks
        setLoserByRank(loserRank, false)
        setWinnerByEmail(req.body.email, false)

      }
      updateList(true)
    })
  } else {
    console.log('ERROR: no player email provided')
  }
}

async function swapPlayerRanks(req) {

  await client.hget(playerRedisKey, req.body.email, async (err, res) => {
    console.log('SWAPPING PLAYERS RANKS given winner email ', req.body.email, ' response here is ', res)
    if (res) {
      const targetRank = parseInt(JSON.parse(res).rank) - 1;

      // won
      await setWinnerByEmail(req.body.email, true)

      // lost
      await setLoserByRank(targetRank, true)

    }
    updateList(true);
  });
}

async function setLoserByRank(targetRank, swap) {
  await client.hgetall(playerRedisKey, (err, players) => {
    for (let player in players) {
      let playerObj = JSON.parse(players[player]);
      let rank = parseInt(playerObj.rank);
      if (rank === targetRank) {
        console.log('SETTING LOSER EMAIL ', playerObj.email)
        let losses = parseInt(playerObj.losses) + 1;
        let wins = parseInt(playerObj.wins);
        let ratioVal = losses === 0 ? wins : wins / losses;
        if (swap) {
          const newRank = parseInt(playerObj.rank) + 1;
          console.log('RATIO VALUE IS ', ratioVal, ' WINS ', wins, ' LOSSES ', losses, ' DIV IS ', (losses === 0 ? wins : wins / losses))
          setPlayerState(playerObj, { losses: losses, winStreak: 0, inMatch: false, rank: newRank, ratio: ratioVal })
        } else {
          const newRank = parseInt(playerObj.rank);
          console.log('RATIO VALUE IS ', ratioVal, ' WINS ', wins, ' LOSSES ', losses, ' DIV IS ', (losses === 0 ? wins : wins / losses))
          setPlayerState(playerObj, { losses: losses, winStreak: 0, inMatch: false, rank: newRank, ratio: ratioVal })
        }
      }
    }
  })
}

async function setWinnerByEmail(email, swap) {
  await client.hget(playerRedisKey, email, (err, player) => {
    console.log('SETTING WINNER EMAIL ', email, ' PLAYER OBJECT : ', player, ' email ', JSON.parse(player).email)
    let wins = parseInt(JSON.parse(player).wins) + 1;
    let losses = parseInt(JSON.parse(player).losses);
    let wsVal = parseInt(JSON.parse(player).winStreak) + 1;
    console.log('WINSTREAK VALUE IS ', wsVal)
    let ratioVal = losses === 0 ? wins : wins / losses;
    if (swap) {
      console.log('RATIO VALUE IS ', ratioVal, ' WINS ', wins, ' LOSSES ', losses, ' DIV IS ', (losses === 0 ? wins : wins / losses))
      const newRank = parseInt(JSON.parse(player).rank) - 1
      setPlayerState(JSON.parse(player), { wins: wins, winStreak: wsVal, inMatch: false, rank: newRank, ratio: ratioVal })
    } else {
      console.log('RATIO VALUE IS ', ratioVal, ' WINS ', wins, ' LOSSES ', losses, ' DIV IS ', (losses === 0 ? wins : wins / losses))
      const newRank = parseInt(JSON.parse(player).rank)
      setPlayerState(JSON.parse(player), { wins: wins, winStreak: wsVal, inMatch: false, rank: newRank, ratio: ratioVal })
    }

  })
}



// TODO
async function setInMatchRank(rank) {
  await setPlayerByRank(rank, { "inMatch": true });
}

async function setPlayerByRank(rank, state) {
  console.log("setting player with rank ", rank, ' to state ', state);
  await client.hgetall(playerRedisKey, async (err, players) => {
    for (let player in players) {
      let pPlayer = JSON.parse(players[player]);
      let rRank = parseInt(pPlayer["rank"]);
      if (rRank === rank) {
        console.log('CHANGING DATA --- EMAIL:  ', pPlayer.email, pPlayer['email'], ' to ', state)
        setPlayerState(pPlayer, state)
      }
    }
  });
}

async function setPlayerRedis(playerObj) {
  await client.hset(
    playerRedisKey,
    playerObj.email,
    JSON.stringify(playerObj),
    (err, res) => {
      console.log("RES: ", res, "ERR: ", err);
    }
  );
}

async function setPlayerState(jsonBody, state) {
  console.log("setting player ", jsonBody["email"]);
  Object.keys(state).forEach(key => {
    // change each element in state to new value
    console.log('changing field ' + key + ' ' + jsonBody[key] + ' => ' + state[key])
    jsonBody[key] = state[key]
  })
  console.log('FINAL SET PLAYER STATE ', jsonBody)
  setPlayerRedis(jsonBody)
}

async function setInMatch(email) {
  await client.hget(playerRedisKey, email, (err, resp) => {
    const json = JSON.parse(resp);

    setPlayerState(json, { "inMatch": true })
  });
}

async function authHelper(req, res) {
  if (req.body.token === undefined || req.body.email === undefined) {
    console.log('NO TOKEN')
    res.status(400).json({ 'error': 'Email or Token not provided. Please provide User ID and Token' })
    return false;

  } else if (req.body.token.length < 10 || req.body.token.length > 100) {
    console.log('Invalid token length')
    res.status(400).json({ 'error': 'Invalid token length' })
    return false
  } 
  else if (req.body.token === process.env.ADMIN_TOKEN) {
    return true;
  }
  else if (await auth.auth(req.body.token, req.body.email) === false) {
    console.log('Invalid token')

    const data = {
      'error': 'Invalid token, please log in again',
      'logout': true
    }

    res.status(200).json(data)
    return false;
  }
  return true;
}

/*
 *                             END HELPER FUNCTIONS 
 */


/*
 *                             START SERVER
 */

server.listen(port, () => {
  console.log(`Socket listening on port ${port}`);
});