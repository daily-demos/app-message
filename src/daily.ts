import DailyIframe, { DailyCall, DailyEventObjectAppMessage, DailyEventObjectParticipant, DailyEventObjectParticipantLeft, DailyParticipantsObject } from '@daily-co/daily-js';
import { addSelectableRecipient, getSelectedRecipients as getSelectedRecipient, populateInviteURL, removeAllRecipients, removeSelectableRecipient, setupClientMsgHandler, setupServerMsgHandler } from './controls';
import { showCall, showLobby } from './views';

export function joinRoom(roomURL: string) {
  console.debug("joining room", roomURL)
  const callContainer = <HTMLElement>document.getElementById('callframe');
  console.log("got ocntainer")
  const callFrame = DailyIframe.createFrame(callContainer, {
    showLeaveButton: true,
  }) 
  console.log("created call frame")
  callFrame
    .on("joined-meeting", () => {
      handleJoinedMeeting(callFrame, roomURL);
    })
    .on("left-meeting", handleLeftMeeting)
    .on("app-message", (ev) => {
      handleAppMessage(callFrame, ev)
    })
    .on("participant-joined", handleParticipantJoined)
    .on("participant-left", handleParticipantLeft)
    .on("error", (ev) => {
      console.error("Fatal error:", ev?.errorMsg);
    })
    .on("nonfatal-error", (ev) => {
      console.error("Nonfatal error:", ev?.errorMsg);
    })
  try {
    callFrame.join({ url: roomURL });
  } catch(e) {
    console.error("failed to join room", e);
    showLobby();
  }
};

function handleParticipantJoined(ev?: DailyEventObjectParticipant) {
  if (!ev) return;
  const p = ev.participant;
  addSelectableRecipient(p.user_name, p.session_id)
}

function handleParticipantLeft(ev?: DailyEventObjectParticipantLeft) {
  if (!ev) return;
  const p = ev.participant;
  removeSelectableRecipient(p.session_id)
}


function handleAppMessage(call: DailyCall, ev?: DailyEventObjectAppMessage) {
  if (!ev) return;
  const contentEle = <HTMLElement>document.getElementById("content");
  const msg = getMsg(call.participants(), ev.data.recipient, ev.fromId)
  const line = document.createElement("p");
  line.innerText = msg;
  contentEle.appendChild(line);
}

// getMsg() formats a message to display to the user based on the "app-message"
function getMsg(participants: DailyParticipantsObject, recipient: string, fromId: string): string {
  const date = new Date();
  const t = date.toLocaleTimeString();
  let msg = `[${t}] Hello, `

  // Customize message with the user's name or ID if it was sent
  // directly to them and not all participants.
  const recipientData = recipient;
  let name = "all"
  if (recipientData !== "*") {
    const lp = participants.local;
    if (lp.user_name) {
      name = lp.user_name;
    } else {
      name = lp.session_id
    }
  }

  // Customize who the message was from based on whether it
  // came from another participant or the API.
  msg += ` ${name}, from `
  if (fromId == "API") {
    msg += "the server!"
  } else {
    const from = fromId
    const p = participants[from]
    if (p?.user_name) {
      msg += p.user_name;
    } else {
      msg += from;
    }
  }

  return msg;
}

function handleJoinedMeeting(call: DailyCall, roomURL: string) {
  populateInviteURL(roomURL)
  setupClientMsgHandler(() => {
    console.log("sending client message");

    // Get recipients
    const recipient = getSelectedRecipient();
    call.sendAppMessage({
      data: {
        recipient: recipient,
      },
      to: recipient
    })
  });

  const roomName = roomURLToName(roomURL);
  setupServerMsgHandler(() => {
    sendServerAppMessage(roomName);
  });
}

function handleLeftMeeting() {
  showLobby();
  removeAllRecipients();
}

function roomURLToName(url: string): string {
  const idx = url.lastIndexOf("/")
  return url.substr(idx + 1);
}

export async function sendServerAppMessage(roomName: string): Promise<string> {
  const recipient = getSelectedRecipient();

  const url = `/.netlify/functions/appMessage?roomName=${roomName}&to=${recipient}`;
  const errMsg = 'failed to send server-side `"app-message"`';
  try {
    const res = await fetch(url);
    console.log("RES:", res)
    // Something went wrong
    if (res.status !== 200) {
      let msg = `${errMsg}. Status code: ${res.status}`
      if (res.bodyUsed) {
        const body = await res.text();
        msg += ` body: ${body}`
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