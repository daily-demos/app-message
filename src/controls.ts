// RoomOutputHandlerFunc defines a function to be used
// for any handler that will accept and use a room URL.
type RoomOutputHandlerFunc = (url: string) => void;

// setupCreateCallHandler() sets up the given handler to run
// when the call creation button is clicked in the lobby.
export function setupCreateCallHandler(handler: Function) {
  assignHandler('createRoomBtn', () => {
    toggleLobbyButtons(false);
    handler();
  });
}

// setupJoinRoomHander() sets up the given handler to run
// when the call join button is clicked in the lobby.
export function setupJoinRoomHander(handler: RoomOutputHandlerFunc) {
  const form = <HTMLFormElement>document.getElementById('enterCall');

  // Handler already registered, skip
  if (form.onsubmit) return;
  form.onsubmit = (ev) => {
    ev.preventDefault();
    toggleLobbyButtons(false);
    const roomURLEle = <HTMLInputElement>document.getElementById('roomURL');
    const url = roomURLEle.value;

    handler(url);
  };
}

// setupClientMsgHandler() sets up the given handler to run
// when a user clicks the button to send a client-side message.
export function setupClientMsgHandler(handler: RoomOutputHandlerFunc) {
  assignHandler('clientBtn', handler);
}

// setupServerMsgHandler() sets up the given handler to run
// when a user clicks the button to send a server-side message.
export function setupServerMsgHandler(handler: Function) {
  assignHandler('serverBtn', handler);
}

// toggleLobbyButtons() enables or disables the call create
// and join buttons, as specified by the caller.
export function toggleLobbyButtons(enabled: boolean) {
  const joinBtn = getJoinRoomBtn();
  const createBtn = getCreateRoomBtn();
  joinBtn.disabled = !enabled;
  createBtn.disabled = !enabled;
}

// getSelectedRecipients() returns the currently selected
// option value from the message recipients dropdown.
export function getSelectedRecipients(): string {
  const p = getParticipantSelectionEle();
  return p.value;
}

// addSelectableRecipient() adds the given recipient's name or ID
// to the message recipient dropdown.
export function addSelectableRecipient(name: string, id: string) {
  let participantName = name;
  if (participantName === '') {
    participantName = id;
  }
  const p = getParticipantSelectionEle();
  const opt = document.createElement('option');
  opt.value = id;
  opt.text = participantName;
  p.add(opt);
}

// updateSelectableRecipient() updates the name of a user in the
// message recipient dropdown. This is to support someone changing
// or adding their name after they join the call.
export function updateSelectableRecipient(name: string, id: string) {
  const p = getParticipantSelectionEle();
  const allOptions = p.getElementsByTagName('option');
  for (let i = 0; i < allOptions.length; i += 1) {
    const opt = allOptions[i];
    if (opt.value === id) {
      if (opt.innerText !== name) {
        opt.innerText = name;
      }
      return;
    }
  }
}

// removeSelectableRecipient() removes the given recipient
// from the message recipient dropdown, such as when they
// leave the call.
export function removeSelectableRecipient(id: string) {
  const p = getParticipantSelectionEle();
  const allOptions = p.getElementsByTagName('option');
  for (let i = 0; i < allOptions.length; i += 1) {
    const opt = allOptions[i];
    if (opt.value === id) {
      opt.remove();
      return;
    }
  }
}

// removeAllSelectableRecipients() removes all options
// from the recipient dropdown, such as when the local
// participant leaves the call.
export function removeAllSelectableRecipients() {
  const p = getParticipantSelectionEle();
  const allOptions = p.getElementsByTagName('option');
  while (allOptions.length > 1) {
    const opt = allOptions[1];
    opt.remove();
  }
}

export function populateInviteURL(roomURL: string) {
  const input = <HTMLInputElement>document.getElementById('inviteURL');
  const inviteURL = new URL(window.location.origin);
  inviteURL.searchParams.append('roomURL', roomURL);
  input.value = inviteURL.toString();
}

function assignHandler(btnID: string, h: Function) {
  const btn = <HTMLButtonElement>document.getElementById(btnID);

  // In this implementation, the handler should
  // not be overwritten if it already exists.
  if (btn.onclick) return;
  btn.onclick = (ev) => {
    ev.preventDefault();
    h();
  };
}

function getParticipantSelectionEle(): HTMLSelectElement {
  return <HTMLSelectElement>document.getElementById('participants');
}

function getJoinRoomBtn(): HTMLButtonElement {
  return <HTMLButtonElement>document.getElementById('joinRoomBtn');
}

function getCreateRoomBtn(): HTMLButtonElement {
  return <HTMLButtonElement>document.getElementById('createRoomBtn');
}
