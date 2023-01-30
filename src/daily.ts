import DailyIframe, {
  DailyCall,
  DailyEventObjectAppMessage,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyParticipantsObject,
} from '@daily-co/daily-js';
import {
  addSelectableRecipient,
  getSelectedRecipients as getSelectedRecipient,
  populateInviteURL,
  removeAllRecipients,
  removeSelectableRecipient,
  setupClientMsgHandler,
  setupServerMsgHandler,
} from './controls';
import { showLobby } from './views';

export function joinRoom(roomURL: string) {
  const callContainer = <HTMLElement>document.getElementById('callframe');
  const callFrame = DailyIframe.createFrame(callContainer, {
    showLeaveButton: true,
  });
  callFrame
    .on('joined-meeting', () => {
      handleJoinedMeeting(callFrame, roomURL);
    })
    .on('left-meeting', () => {
      handleLeftMeeting(callFrame);
    })
    .on('app-message', (ev) => {
      handleAppMessage(callFrame, ev);
    })
    .on('participant-joined', handleParticipantJoined)
    .on('participant-left', handleParticipantLeft)
    .on('error', (ev) => {
      console.error('Fatal error:', ev?.errorMsg);
    })
    .on('nonfatal-error', (ev) => {
      console.error('Nonfatal error:', ev?.errorMsg);
    });
  try {
    callFrame.join({ url: roomURL });
  } catch (e) {
    console.error('failed to join room', e);
    showLobby();
  }
}

function handleParticipantJoined(ev?: DailyEventObjectParticipant) {
  if (!ev) return;
  const p = ev.participant;
  addSelectableRecipient(p.user_name, p.session_id);
}

function handleParticipantLeft(ev?: DailyEventObjectParticipantLeft) {
  if (!ev) return;
  const p = ev.participant;
  removeSelectableRecipient(p.session_id);
}

function handleAppMessage(call: DailyCall, ev?: DailyEventObjectAppMessage) {
  if (!ev) return;
  const contentEle = <HTMLElement>document.getElementById('content');
  const line = getMsg(call.participants(), ev.data.recipient, ev.fromId);
  contentEle.appendChild(line);
}

// getMsg() formats a message to display to the user based on the "app-message"
function getMsg(
  participants: DailyParticipantsObject,
  recipient: string,
  fromId: string
): HTMLSpanElement {
  const line = document.createElement('span');
  const date = new Date();
  const t = date.toLocaleTimeString();
  let msg = `[${t}] Hello, `;

  // Customize message with the user's name or ID if it was sent
  // directly to them and not all participants.
  const recipientData = recipient;
  let name = 'all';
  if (recipientData !== '*') {
    const lp = participants.local;
    if (lp.user_name) {
      name = lp.user_name;
    } else {
      name = lp.session_id;
    }
  }

  // Customize who the message was from based on whether it
  // came from another participant or the API.
  msg += ` ${name}, from `;
  if (fromId === 'API') {
    msg += 'the server!';
    line.classList.add('serverMsg');
  } else {
    line.classList.add('clientMsg');
    const from = fromId;
    const p = participants[from];
    if (p?.user_name) {
      msg += p.user_name;
    } else {
      msg += from;
    }
  }
  line.innerText = msg;
  return line;
}

function handleJoinedMeeting(call: DailyCall, roomURL: string) {
  populateInviteURL(roomURL);
  setupClientMsgHandler(() => {
    const recipient = getSelectedRecipient();
    call.sendAppMessage({
      data: {
        recipient,
      },
      to: recipient,
    });
  });

  const roomName = roomURLToName(roomURL);
  setupServerMsgHandler(() => {
    sendServerAppMessage(roomName);
  });
}

function handleLeftMeeting(call: DailyCall) {
  removeAllRecipients();
  // Destroy the call frame to make sure we don't
  // get multiple call objects in the window.
  call.destroy().then(() => {
    showLobby();
  });
}

function roomURLToName(url: string): string {
  const idx = url.lastIndexOf('/');
  return url.substr(idx + 1);
}

export async function sendServerAppMessage(roomName: string): Promise<string> {
  const recipient = getSelectedRecipient();

  const url = `/.netlify/functions/appMessage?roomName=${roomName}&to=${recipient}`;
  const errMsg = 'failed to send server-side `"app-message"`';
  try {
    const res = await fetch(url);
    // Something went wrong
    if (res.status !== 200) {
      let msg = `${errMsg}. Status code: ${res.status}`;
      if (res.bodyUsed) {
        const body = await res.text();
        msg += ` body: ${body}`;
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
