// These imports ensure relevant assets are bundled
// with the rest of the build
import './index.html';
import './css/header.css';
import './css/style.css';
import './assets/daily.svg';
import './assets/favicon.ico';
import './assets/github.png';
import './assets/new-tab-icon.png';
import { joinRoom } from './daily';
import { setupCreateCallHandler } from './controls';
import { showCall } from './views';

window.addEventListener('DOMContentLoaded', () => {
  // We set this up even if the user is joining a call,
  // because when they leave they'll be taken back to
  // the lobby to create one.
  setupCreateCallHandler(() => {
    createRoom().then((roomURL) => {
      goToJoin(roomURL);
    });
  });

  // Check if the query parameters contain a room URL
  // and join the call if so.
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());
  if (params.roomURL) {
    joinRoom(params.roomURL);
    showCall();
  }
});

// goToJoin() redirects the user to this page with the
// roomURL query parameter, which triggers a call join.
function goToJoin(roomURL: string) {
  const url = `${window.location.origin}?roomURL=${roomURL}`;
  window.location.href = url;
}

// createRoom() creates a Daily room in a Netlify function.
async function createRoom(): Promise<string> {
  const url = `/.netlify/functions/room`;
  const errMsg = 'failed to create room';
  try {
    const res = await fetch(url);
    // Something went wrong
    if (res.status !== 200) {
      let msg = `${errMsg}. Status code: ${res.status}`;
      if (res.bodyUsed) {
        const body = await res.text();
        msg += `; ${body}`;
      }
      throw new Error(msg);
    }

    const data = await res.text();
    return data;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`${errMsg}: ${e.toString()}`);
    }
    throw new Error(errMsg);
  }
}
