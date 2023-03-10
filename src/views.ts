import { toggleLobbyButtons } from './controls';

const hiddenClassName = 'hidden';

export function showLobby() {
  toggleLobbyButtons(true);
  const lobby = getLobbyEle();
  const call = getCallEle();
  lobby.classList.remove(hiddenClassName);
  call.classList.add(hiddenClassName);
}

export function showCall() {
  toggleLobbyButtons(false);
  const lobby = getLobbyEle();
  const call = getCallEle();
  lobby.classList.add(hiddenClassName);
  call.classList.remove(hiddenClassName);
}

function getLobbyEle(): HTMLElement {
  return <HTMLElement>document.getElementById('lobby');
}

function getCallEle(): HTMLElement {
  return <HTMLElement>document.getElementById('incall');
}
