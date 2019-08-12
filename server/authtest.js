const auth = require('./auth')
const assert = require('assert')
// const hw = auth.encrypt('hello world')

// console.log(`encrypted: ${hw}`)
// console.log(`decrypted: ${auth.decrypt(hw)}`)

async function test() {
    const token = await auth.login('camerondurham@oracle.com')
    const token2 = await auth.login('cdurham@oracle.com')
    console.log({token, token2})

    assert(token && token2);

    const v1 = await auth.auth(token, 'camerondurham@oracle.com')
    assert(v1 === true)
    
    const v2 = await auth.auth(token, 'cameronduram@oracle.com')
    assert(v2 === false)

    const v3 = await auth.auth(token, 'cdurham@oracle.com')
    assert(v3 === false)

    const v4 = await auth.auth(token2, 'cdurham@oracle.com')
    assert(v4 === true)
    console.log({v1,v2,v3,v4})
}


try {
test()
} catch(e) {
    console.log('error!', e)
}


// console.log(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 25))