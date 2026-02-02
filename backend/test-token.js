const axios = require('axios');

const appId = '1596025668076914';
const appSecret = 'b47ef916c821344dff83c3ed82f3c881';
const shortToken = 'EAAWrk67ZChXIBQbOnkVXKGQvj81hJOfCDXeTcUq0XWycRX9MMMiBHOFQd6njKdmNR7x26RMCOdP4mw4h9Xft1BMKceYs1AA2im66ZA3sU9pJOMZBFHZBd3Th3cJw2VbrumP3pKH37Njaha15H2b64LHFWonUwGWzNm1XGPwtZBZA0uk2IKIciIefPBqZCLF9te4p8yf4CKN1hpAjYpLGJhwcrAurAWrnpcLJ5QZC96lTjZCUmakNFFp4TIgzR3NuervoTqjtiJxC3OzOUBLW02wSruZAck';

const API_VERSION = 'v19.0';

async function test() {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/oauth/access_token`,
            {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: appId,
                    client_secret: appSecret,
                    fb_exchange_token: shortToken
                }
            }
        );
        console.log('Success:', response.data);
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
