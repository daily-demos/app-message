import { Handler } from '@netlify/functions';
import axios from 'axios';
import { dailyAPIUrl } from './util';


// This handler retrieves the latest ongoing meeting session
// data, if any.
// https://docs.daily.co/reference/rest-api/meetings
const handler: Handler = async (event, _context) => {
  console.log("sending appmessage")
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    console.error('Daily API key is missing');
    return {
      statusCode: 500,
      body: 'An internal server error occurred',
    };
  }

   // We expect a room name to have been passed as a query parameter
   const params = event.queryStringParameters;
   const roomName = params?.roomName;
   if (!roomName) {
     return {
       statusCode: 400,
       body: 'Query parameters must contain a Daily room name',
     };
   }

  const recipient = params?.to;


  // Send app message to given room
  try {
    await sendAppMessage(apiKey, roomName, recipient);
    return {
      statusCode: 200,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: String(e),
    }
  }
};

// sendAppMessage() uses Daily's REST API to send an `"app-message"`
// event to one or all Daily participant clients.
// Docs: https://docs.daily.co/reference/rest-api/rooms/send-app-message
async function sendAppMessage(
  apiKey: string,
  roomName: string,
  recipient: string = "*"
) {
  // Prepare request body.
  // We include the recipient twice because the property 
  // in "data" will be accessible through the `"app-message"` 
  // event payload. The recipient can use it to can tailor 
  // their message handling based on whether
  // they were the only recipient.
  const req = {
    data: {
      recipient,
    },
    recipient,
  };
  const data = JSON.stringify(req);

  // Prepare headers, containing Daily API key
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const url = `${dailyAPIUrl}/rooms/${roomName}/send-app-message`;

  const errMsg = "failed to send app message";
  const res = await axios.post(url, data, { headers });
  if (res.status !== 200 || !res.data) {
    console.log("unexpected app message endpoint response:", res.status, res.data);
    throw new Error(errMsg);
  }
}
// eslint-disable-next-line import/prefer-default-export
export { handler };
