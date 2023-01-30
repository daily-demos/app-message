export function setupCreateCallHandler(handler: Function) {
  assignHandler('createRoomBtn', handler);
}

type JoinRoomHandlerFunc = (url: string) => void;

export function setupJoinRoomHander(handler: JoinRoomHandlerFunc) {
  const form = <HTMLButtonElement>document.getElementById('enterCall');
  form.onsubmit = (ev) => {
    ev.preventDefault();

    const roomURLEle = <HTMLInputElement>document.getElementById('roomURL');
    const url = roomURLEle.value;

    handler(url);
  };
}

export function setupClientMsgHandler(handler: Function) {
  assignHandler('clientBtn', handler);
}

export function setupServerMsgHandler(handler: Function) {
  assignHandler('serverBtn', handler);
}

export function getSelectedRecipients(): string {
  const p = getParticipantSelectionEle();
  return p.value;
}

export function populateInviteURL(roomURL: string) {
  const input = <HTMLInputElement>document.getElementById('inviteURL');
  const inviteURL = new URL(window.location.origin);
  inviteURL.searchParams.append('roomURL', roomURL);
  input.value = inviteURL.toString();
}

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

export function removeAllRecipients() {
  const p = getParticipantSelectionEle();
  const allOptions = p.getElementsByTagName('option');
  while (allOptions.length > 1) {
    const opt = allOptions[1];
    opt.remove();
  }
}

function getParticipantSelectionEle(): HTMLSelectElement {
  return <HTMLSelectElement>document.getElementById('participants');
}

function assignHandler(btnID: string, h: Function) {
  const btn = <HTMLButtonElement>document.getElementById(btnID);
  btn.onclick = (ev) => {
    ev.preventDefault();
    h();
  };
}
