const axios = require('axios');

const appId = '1596025668076914';
const appSecret = 'b47ef916c821344dff83c3ed82f3c881';
const token = 'EAAWrk67ZChXIBQbOnkVXKGQvj81hJOfCDXeTcUq0XWycRX9MMMiBHOFQd6njKdmNR7x26RMCOdP4mw4h9Xft1BMKceYs1AA2im66ZA3sU9pJOMZBFHZBd3Th3cJw2VbrumP3pKH37Njaha15H2b64LHFWonUwGWzNm1XGPwtZBZA0uk2IKIciIefPBqZCLF9te4p8yf4CKN1hpAjYpLGJhwcrAurAWrnpcLJ5QZC96lTjZCUmakNFFp4TIgzR3NuervoTqjtiJxC3OzOUBLW02wSruZAck';

const API_VERSION = 'v19.0';

async function test() {
    try {
        console.log('Inspecting token...');
        const response = await axios.get(
            `https://graph.facebook.com/debug_token`,
            {
                params: {
                    input_token: token,
                    access_token: `${appId}|${appSecret}`
                }
            }
        );
        console.log('Token Info:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
