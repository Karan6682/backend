const axios = require('axios');

async function testRoute() {
    try {
        const res = await axios.post('http://localhost:5000/api/wallet/create-order', {
            amount: 1
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.log("Error Status:", err.response ? err.response.status : "No Response");
        console.log("Error Data:", err.response ? err.response.data : err.message);
    }
}

testRoute();
