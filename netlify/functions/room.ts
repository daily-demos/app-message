import { Handler } from '@netlify/functions';
import axios from 'axios';
import { dailyAPIUrl } from './util';

// The data we'll expect to get from Daily on room creation.
// Daily actually returns much more data, but these are the only
// properties we'll be using.
interface DailyRoomData {
  id: string;
  name: string;
  url: string;
}

// This handler retrieves the latest ongoing meeting session
// data, if any.
// https://docs.daily.co/reference/rest-api/meetings
const handler: Handler = async (event, _context) => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    console.error('Daily API key is missing');
    return {
      statusCode: 500,
      body: 'An internal server error occurred',
    };
  }

  // Create the Daily room.
  try {
    const roomURL = await createRoom(apiKey);
    return {
      statusCode: 200,
      body: roomURL,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: String(e),
    }
  }
};

// getActiveMeetingSession() uses Daily's REST API to get information about the latest
// active meeting session in a given Daily room. It will return either an empty
// JSON object, or an object containing active session information.
async function createRoom(
  apiKey: string,
): Promise<string> {
  // Prepare room properties. Participants will start with
  // mics and cams off, and the room will expire in 24 hours.
  const req = {
    properties: {
      exp: Math.floor(Date.now() / 1000) + 86400,
      start_audio_off: true,
      start_video_off: true,
      enable_prejoin_ui: false,
    },
  };

  // Prepare headers, containing our Daily API key
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const url = `${dailyAPIUrl}/rooms/`;
  const data = JSON.stringify(req);

  const roomErrMsg = "failed to create room";

  const res = await axios.post(url, data, { headers }).catch((error) => {
    console.error(roomErrMsg, res);
    throw new Error(`${roomErrMsg}: ${error})`);
  });

  if (res.status !== 200 || !res.data) {
    console.error("unexpected room creation response:", res);
    throw new Error(roomErrMsg);
  }
  // Cast Daily's response to our room data interface.
  const roomData = <DailyRoomData>res.data;

  return roomData.url;
}
// eslint-disable-next-line import/prefer-default-export
export { handler };