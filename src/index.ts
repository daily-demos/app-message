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
import { setupCreateCallHandler, setupJoinRoomHander } from './controls';
import { showCall } from './views';

window.addEventListener('DOMContentLoaded', () => {
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());
  setupCallCreation();

  if (params.roomURL) {
    joinRoom(params.roomURL);
    showCall();
  }
});

function setupCallCreation() {
  setupJoinRoomHander((roomURL) => {
    goToJoin(roomURL);
  });

  setupCreateCallHandler(() => {
    createRoom().then((roomURL) => {
      goToJoin(roomURL);
    });
  });
}

function goToJoin(roomURL: string) {
  const url = `${window.location.origin}?roomURL=${roomURL}`;
  window.location.href = url;
}

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

    // Return what we expect to be a token (additional validation to come)
    const data = await res.text();
    return data;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`${errMsg}: ${e.toString()}`);
    }
    throw new Error(errMsg);
  }
}
