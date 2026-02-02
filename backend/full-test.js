const axios = require('axios');

const appId = '1596025668076914';
const appSecret = 'b47ef916c821344dff83c3ed82f3c881';
const shortToken = 'EAAWrk67ZChXIBQbOnkVXKGQvj81hJOfCDXeTcUq0XWycRX9MMMiBHOFQd6njKdmNR7x26RMCOdP4mw4h9Xft1BMKceYs1AA2im66ZA3sU9pJOMZBFHZBd3Th3cJw2VbrumP3pKH37Njaha15H2b64LHFWonUwGWzNm1XGPwtZBZA0uk2IKIciIefPBqZCLF9te4p8yf4CKN1hpAjYpLGJhwcrAurAWrnpcLJ5QZC96lTjZCUmakNFFp4TIgzR3NuervoTqjtiJxC3OzOUBLW02wSruZAck';
const wabaId = '15786370731618';

const API_VERSION = 'v19.0';

async function test() {
    try {
        console.log('1. Exchanging token...');
        const resToken = await axios.get(
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
        const longLivedToken = resToken.data.access_token;
        console.log('Long Token (first 20 chars):', longLivedToken.substring(0, 20));

        console.log('2. Fetching numbers...');
        const resNums = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`,
            {
                headers: {
                    Authorization: `Bearer ${longLivedToken}`
                }
            }
        );
        console.log('Numbers found:', resNums.data.data.map(n => n.display_phone_number));
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
