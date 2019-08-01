/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-console */

// #region testing
const app = {
  methods: {
    alert: (self, x) => () => { alert(`${x} ${self.players}`) },
    add: self => () => { self.count += 1 },
  },
  data() {
    return ({
      test: 'Test String in data',
      count: 0,
      players: [
        {
          name: 'naman',
          rank: 1,
          inMatch: false,
          email: 'n@oracle.com',
          wins: 10,
          losses: 3,
          winStreak: 0,
          ratio: 0,
        },
        {
          name: 'max',
          rank: 2,
          inMatch: false,
          email: 'n@oracle.com',
          wins: 1,
          losses: 1,
          winStreak: 0,
          ratio: 0,
        },
        {
          name: 'maxTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST',
          rank: 2,
          inMatch: false,
          email: 'n@oracle.com',
          wins: 1,
          losses: 1,
          winStreak: 0,
          ratio: 0,
        },
        {
          name: 'maxTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST',
          rank: 2,
          inMatch: false,
          email: 'n@oracle.com',
          wins: 1,
          losses: 0,
          winStreak: 0,
          ratio: 0,
        },
      ],
    })
  },
}

// namanjs('app', app)
// #endregion

const leaderboarItemRowTemplate = (rank, name, wins, losses, winLoss) => {
  const row = document.createElement('div')
  row.className = 'leaderboard-row'

  const elipsisName = name.length > 14 ? `${name.slice(0, 14)}...` : name
  row.innerHTML = `
    <div class="leaderboard-row-item">${rank}</div>
    <div class="leaderboard-row-item">${elipsisName}</div>
    <div class="leaderboard-row-item">${wins}</div>
    <div class="leaderboard-row-item">${losses}</div>
    <div class="leaderboard-row-item">${winLoss}</div>
  `
  return row
}

const updatePlayers = (players) => {
  players.forEach((player, rank) => {
    const { name, wins, losses } = player

    // Get winloss, and convert to decimal. If integer, convert to integer string
    const winLoss = losses === 0 ? wins : (wins / losses).toFixed(2).replace(/[.,]00$/, '')
    document.getElementById('leaderboard-items')
      .appendChild(leaderboarItemRowTemplate(rank + 1, name, wins, losses, winLoss))
  })
}

function updateList(players){
  document.getElementById('leaderboard-items').innerHTML = '';
   players.forEach((player, rank) => {
    const { name, wins, losses } = player

    // Get winloss, and convert to decimal. If integer, convert to integer string
    const winLoss = losses === 0 ? wins : (wins / losses).toFixed(2).replace(/[.,]00$/, '')
    document.getElementById('leaderboard-items')
      .appendChild(leaderboarItemRowTemplate(rank + 1, name, wins, losses, winLoss))
  })
}

// eslint-disable-next-line prefer-template

const players = new Observable()
players.subscribe([], 'players', x => updatePlayers(x))

// setEventListener('login-button', 'click', updateB)
// setEventListener('register-button', 'click', updateC)

players.set([
  {
    name: 'naman',
    rank: 1,
    inMatch: false,
    email: 'n@oracle.com',
    wins: 10,
    losses: 3,
    winStreak: 0,
    ratio: 0,
  },
  {
    name: 'max',
    rank: 2,
    inMatch: false,
    email: 'n@oracle.com',
    wins: 1,
    losses: 1,
    winStreak: 0,
    ratio: 0,
  },
  {
    name: 'maxTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST',
    rank: 2,
    inMatch: false,
    email: 'n@oracle.com',
    wins: 1,
    losses: 1,
    winStreak: 0,
    ratio: 0,
  },
  {
    name: 'maxTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST',
    rank: 2,
    inMatch: false,
    email: 'n@oracle.com',
    wins: 1,
    losses: 0,
    winStreak: 0,
    ratio: 0,
  },
])

