const axios = require('axios')
const url = "http://localhost:4000"

axios.defaults.headers.post['Content-Type'] = 'application/json';

async function callEndpoint(endpoint, data) {
    try {
        await axios({
            url: url + endpoint,
            method: 'post',
            data: data
        })
            .then(resp => {
                    console.log('DATA: ', resp.data)
                    return resp.data
            })
    } catch (e) {
            if (e.response && e.response.data) {
                console.log("ERROR: ", e.response.data)
                return e.response.data
            } else {
                console.log("ERROR: " + e)
                return e
            }
    }
}


test('add two players and incr rank', async () => {
    const retVal = await callEndpoint('/addPlayer', { player: 'test1', email:'test1@oracle.com', password:'1234'});
    console.log('the return val is ', retVal);
    expect(retVal).not.toBe(null);
})