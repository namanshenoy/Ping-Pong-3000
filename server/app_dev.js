/*jshint esversion: 8 */
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const redis = require("redis");

const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
axios.defaults.headers.post['Content-Type'] = 'application/json';

const port = process.env.PORT || 4000;


// access redis mini-database
const client = redis.createClient();
// const client = redis.createClient("redis://redis:6379");

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
  const res = await axios
    .get("http://localhost:8080/getPlayers")
    .then(players => {
      console.log("players : ", players.data.players);
      players.data.players.forEach(e => {
        let playerRatio = e.losses === 0 ? e.wins : e.wins / e.losses;
        playersObj.data.push({
          name: e.name,
          rank: e.rank,
          inMatch: e.inMatch,
          email: e.email,
          wins: e.wins,
          losses: e.losses,
          winStreak: e.winStreak,
          ratio: playerRatio
        });
        setPlayerRedis(e);
      });

      const len = players.players ? players.players.length : 0;
      client.set("numPlayers", len);
      return playersObj;
    });
  return res;
}

async function updateList(useCache) {
  const playersObj = { data: [] };

  const thisNumPlayers = await getNumPlayersAPI();

  const data = await client.hgetall(playerRedisKey, (err, players) => {
    if (players && Object.keys(players).length === thisNumPlayers && useCache) {
      for (let player in players) {
        let pPlayer = JSON.parse(players[player]);
        let pRatio = pPlayer.losses === 0 ? pPlayer.wins : pPlayer.wins / pPlayer.losses;
        console.log('player wins : ' + pPlayer.wins + ' player losses ' + pPlayer.losses + ' ratio will be ' + pRatio)
        playersObj.data.push({
          name: pPlayer.name,
          rank: pPlayer.rank,
          inMatch: pPlayer.inMatch,
          email: pPlayer.email,
          wins: pPlayer.wins,
          losses: pPlayer.losses,
          winStreak: pPlayer.winStreak,
          ratio: pRatio
        });
      }
      playersObj.data.sort((x, y) => {
        return x.rank - y.rank;
      });

      io.emit("updateList", playersObj);
    } else {
      fetchPlayers().then(data => {
        playersObj.data.sort((x, y) => {
          return x.rank - y.rank;
        });
        io.emit("updateList", data);
      });
    }
  });
  return data;
}

io.on("connection", socket => {
  console.log("New client connected");
  updateList(true);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

async function updatePlayerListJson(players, playersObj) {
  for (let player in players) {
    let pPlayer = JSON.parse(players[player]);
    let pRatio = pPlayer.losses === 0 ? pPlayer.wins : pPlayer.wins / pPlayer.losses;
    console.log('player wins : ' + pPlayer.wins + ' player losses ' + pPlayer.losses + ' ratio will be ' + pRatio)
    playersObj.data.push({
      name: pPlayer.name,
      rank: pPlayer.rank,
      inMatch: pPlayer.inMatch,
      email: pPlayer.email,
      wins: pPlayer.wins,
      losses: pPlayer.losses,
      winStreak: pPlayer.winStreak,
      ratio: pRatio
    });
  }
  playersObj.data.sort((x, y) => {
    return x.rank - y.rank;
  });
  // return playersObj
}

client.on("error", err => {
});

/*
 *                                      END SOCKET CONNECTIONS
 */

/*
 *                                      BEGIN ENDPOINTS
 */

app.post("/addPlayer", (req, res) => {
  addPlayerCall(req, res);
});

app.post("/login", (req, res) => {
  loginPlayerCall(req, res);
});

app.post("/deletePlayer", (req, res) => {
  delPlayerCall(req, res);
});

app.post("/challengePlayer", (req, res) => {
  challengePlayerCall(req, res);
});

app.get('/getPlayers', async (req, res) => {
  try {

    console.log('getting players from redis cache')

    const thisNumPlayers = await getNumPlayersAPI();

    const playersObj = { data: [] };

    const data = await client.hgetall(playerRedisKey, (err, players) => {
      if (players && Object.keys(players).length === thisNumPlayers) {
        for (let player in players) {
          let pPlayer = JSON.parse(players[player]);
          let pRatio = pPlayer.losses === 0 ? pPlayer.wins : pPlayer.wins / pPlayer.losses;
          console.log('player wins : ' + pPlayer.wins + ' player losses ' + pPlayer.losses + ' ratio will be ' + pRatio)
          playersObj.data.push({
            name: pPlayer.name,
            rank: pPlayer.rank,
            inMatch: pPlayer.inMatch,
            email: pPlayer.email,
            wins: pPlayer.wins,
            losses: pPlayer.losses,
            winStreak: pPlayer.winStreak,
            ratio: pRatio
          });
        }
        playersObj.data.sort((x, y) => {
          return x.rank - y.rank;
        });
        res.status(200).json(playersObj);
      } else {
        fetchPlayers().then(data => {
          playersObj.data.sort((x, y) => {
            return x.rank - y.rank;
          });
        });

        res.status(200).json(playersObj);
      }
    });
    return data;
  }

  // await axios.get('http://localhost:8080/getPlayers').then(resp => {
  //   res.status(200).json(resp.data);
  // });
  catch (e) {
    console.log('ERR:', e);
    res.status(400);
  }
})

app.get('/getRedisPlayers', async (req, res) => {
  try {
    console.log('Getting players from redis')
    await client.hgetall(playerRedisKey, (err, players) => {
      res.status(200).json(players)
    })
  }
  catch (e) {
    console.log('ERR:', e);
    res.status(400);
  }
})

app.post("/concludeMatch", (req, res) => {
  concludeMatch(req, res);
});

app.post("/isChallenged", (req, res) => {

  res.json({ inMatch: true });
});

app.post("/inMatch", (req, res) => {
  forwardInMatch(req, res)
})

app.post('/getRedisPlayers', (req, res) => {
  getRedisPlayers(req, res)
})

app.post('/deleteAllRedisPlayers', (req, res) => {
  deleteAllPlayersFromRedis(res)
})

async function deleteAllPlayersFromRedis(res) {
  await client.del(playerRedisKey, (err, resp) => {
    console.log('deleting players');
    res.status(200).json(resp)
  })
}

async function getRedisPlayers(req, res) {
  await client.hgetall(playerRedisKey, (err, resp) => {
    res.status(200).json(resp);
  });
}
async function forwardInMatch(req, res) {
  try {
    await axios.post('http://localhost:8080/inMatch', req.body).then(resp => {
      res.status(200).json(resp.data)
    })
  } catch (e) {
    res.status(400).json(e.response.data);
  }

}

async function addPlayerCall(req, res) {
  try {
    // ensure numPlayers is set
    await checkNumPlayers();

    await axios.post("http://localhost:8080/addPlayer", req.body).then(resp => {
      res.status(200).json(resp.data);
      client.get("numPlayers", (err, val) => {
        addPlayerToRedis(req.body, parseInt(val) + 1);
        if (err) {
          console.log("err", err);
        }
        numPlayersIncr();
      });
    });
  } catch (e) {
    console.log("ERROR: ", e.response.data);
    res.status(400).json(e.response.data);
  }
}

async function delPlayerCall(req, res) {
  try {
    // ensure numPlayers is set
    await checkNumPlayers();

    await axios
      .post("http://localhost:8080/deletePlayer", req.body)
      .then(async resp => {
        res.status(200).json(resp.data);
        await deletePlayerFromRedis(req.body);
        await numPlayersDecr();
      })
      .then(() => {
        // force reload of new player challenge status
        updateList(false);
      });
  } catch (e) {
    res.status(400).json(e.response.data);
  }
}

async function numPlayersDecr() {
  await client.decr("numPlayers", (err, resp) => {
  });
}

async function numPlayersIncr() {
  await client.incr("numPlayers", (err, resp) => {
  });
}

async function checkNumPlayers() {
  await setPlayerNum(false);
}

// async function resetPlayerNum() {
//   await setPlayerNum(true);
// }

// input: boolean to hard-reset playerNum
async function setPlayerNum(reset) {
  await client.get("numPlayers", (err, resp) => {
    if (resp && !reset) {
      return;
    } else {
    }
  });
  const numPlayers = await getNumPlayersAPI();
  await client.set("numPlayers", numPlayers, (err, resp) => {
  });
}

async function getNumPlayersAPI() {
  return await axios.get("http://localhost:8080/getPlayers").then(players => {
    const numPlayers = parseInt(players.data.players.length);
    return numPlayers;
  });
}

// async function deleteAllPlayersFromRedis() {
//   await client.del(playerRedisKey);
// }


async function deletePlayerFromRedis(jsonBody) {
  await client.hget(playerRedisKey, jsonBody.email, (err, resp) => {
    if (resp) {
      const json = JSON.parse(resp);
      const targetRank = parseInt(json.rank);
      updateRanks(targetRank);
    }
  });
  await client.hdel(playerRedisKey, jsonBody.email, (err, resp) => {
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
  jsonBody["rank"] = rank;
  jsonBody["name"] = jsonBody["player"];
  jsonBody["inMatch"] = false;
  jsonBody["wins"] = 0;
  jsonBody["losses"] = 0;
  jsonBody["winStreak"] = 0;
  jsonBody["ratio"] = 0;
  setPlayerRedis(jsonBody);
  updateList(true);
}

async function loginPlayerCall(req, res) {
  try {
    await axios.post("http://localhost:8080/login", req.body).then(resp => {
      res.status(200).json(resp.data);
    });
  } catch (e) {
    res.status(400).json(e.response.data);
  }
}

async function challengePlayerCall(req, res) {
  try {
    await axios
      .post("http://localhost:8080/challengePlayer", req.body)
      .then(resp => {
        res.status(200).json(resp.data);
      });

    await client.hget(playerRedisKey, req.body.email, (err, res) => {
      const targetRank = parseInt(JSON.parse(res).rank) - 1;
      setInMatchRank(targetRank);
    });
    await setInMatch(req.body.email);
    updateList(true);
  } catch (e) {
    res.status(400).json(e.response.data);
  }
}


async function concludeMatch(req, res) {
  try {
    console.log('*************concluding match************');
    await axios
      .post("http://localhost:8080/concludeMatch", req.body)
      .then(resp => {
        console.log("concluded match -- data is : ", resp.data);
        console.log('success message ' + resp.data.success)
        if (resp.data && resp.data.success.includes('swap')) {
          // update ranks
          swapPlayerRanks(req)
        } else {
          unsetPlayerChallenge(req)
        }
        res.status(200).json(resp.data)
      });
  } catch (e) {
    console.log('ERROR WITHOUT DATA: ', e)
    console.log('ERROR: ', e.response.data)
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
      // await setOutMatchSetRank(req.body.email, targetRank);
      // await incrementWinsByRank(targetRank)

      // lost
      // setOutMatchRankSetRank(targetRank, targetRank + 1);
      // await setPlayerByRank(targetRank, {"inMatch":false, "rank": targetRank + 1})
      await setLoserByRank(targetRank, true)
      // await incrementLossesByRank(targetRank + 1)


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
        const ratioVal = losses === 0 ? wins : wins / losses;
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
    const ratioVal = losses === 0 ? wins : wins / losses;
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

// TODO
// async function setOutMatchRankSetRank(rank, target) {
//   await setPlayerByRank(rank, { "rank": target, "inMatch": false });
// }

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
    // setMatchSetRank(json, true, null);
    setPlayerState(json, { "inMatch": true })
  });
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
