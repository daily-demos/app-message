// These imports ensure relevant assets are bundled
// with the rest of the build
import './index.html';
import './css/header.css';
import './css/style.css';
import './assets/daily.svg';
import './assets/favicon.ico';
import './assets/github.png';
import './assets/new-tab-icon.png';
import './daily';
import { setupCreateCallHandler, setupJoinRoomHander } from './controls';
import { joinRoom } from './daily';
import { showCall } from './views';

window.addEventListener('DOMContentLoaded', () => {
    const usp = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(usp.entries());

    if (params.roomURL) {
        joinRoom(params.roomURL);
        showCall();
        return;
    }

    setupCallCreation();
});

function setupCallCreation() {
    setupJoinRoomHander((url) => {
        joinRoom(url);
        showCall();
    });

    setupCreateCallHandler(() => {
        createRoom().then(roomURL => {
            joinRoom(roomURL);
            showCall();
        })
    });
}

export async function createRoom(): Promise<string> {
    console.debug("creating room");
    const url = `/.netlify/functions/room`;
    const errMsg = 'failed to create room';
    try {
      const res = await fetch(url);
      // Something went wrong
      if (res.status !== 200) {
        const body = await res.text();
        throw new Error(`${errMsg}. Status code: ${res.status}, body: ${body}`);
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