const redis = require('redis')
const client = redis.createClient({ password: 'bear6metal6server' })


const deauthHash = 'test1@oracle.com';

async function deauth(deauthHash) {
    client.keys('$hash_*', (err, resp) => {
        resp.forEach(e => {
            console.log(e);
            client.get(e, (err, resp) => {
                console.log(resp)
                if (resp === deauthHash) {
                    client.del(e, (err, resp) => {
                        console.log({ err, resp })
                    })
                }
            })
        })
    })
}