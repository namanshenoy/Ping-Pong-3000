require('dotenv').config();

const redis = require('redis');
const client = process.env.HOSTNAME === 'nashenoy-linux' ? redis.createClient({password: process.env.REDIS_PASS}) :  redis.createClient("redis://localhost:6379", {password: process.env.REDIS_PASS});

const bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = crypto.createHash('sha256').update(String(process.env.PASSWORD)).digest('base64').substr(0, 32);
    iv  = Buffer.from('26ae5cc854e36b6bdfca366848dea6bb', 'hex');

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    const decipher = crypto.createCipheriv(algorithm, password, iv);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

async function login(email) {
    try {
        const ts = Date.now().toString();

        const hashed = email.length > 4 ? await encrypt(email.substr(2, 2) + ts + email.substr(0, 2)) : await encrypt(ts);
        const hashString = `$hash_${hashed}$`;
        await client.set(hashString, email, 'EX', 3600, (err, res) => {
            console.log({ err, res });
        });
        return hashed;

    } catch (e) {
        console.log(`ERROR:${e}`);
    }
}

async function auth(token, user_id) {
    const keystring = `$hash_${token}$`;
    return await client.getAsync(keystring).then((resp) => {
        if (resp && resp === user_id) {
            console.log('Valid token');
            return true;
        } else if (resp) {
            console.error('Invalid username');
            return false;
        } else {
            // console.error('No such token');
            return false;
        }
    })
}

async function deauth(token, user_id) {
    const keystring = `$hash_${token}$`;
    return await client.del(keystring, (resp) => {
        if (resp && resp === user_id) {
            console.log('Valid token');
            deauthUser(keystring)
            return true;
        } else if (resp) {
            console.error('Invalid username');
            return false;
        } else {
            // console.error('No such token');
            return false;
        }
    })
}

async function deauthEmail(email) {
    client.keys('$hash_*', (err, resp) => {
        resp.forEach(e => {
            client.get(e, (err, resp) => {
                if (resp === email) {
                    client.del(e, (err, resp) => {
                        console.log({ err, resp })
                    })
                }
            })
        })
    })
}

async function deauthUser(deauthHash) {
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

module.exports = {
    decrypt, encrypt, login, auth, deauth, deauthEmail
}