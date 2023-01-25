
const hiddenClassName = "hidden"

export function showLobby() {
    console.debug("showing lobby")
    const lobby = getLobbyEle();
    const call = getCallEle();
    lobby.classList.remove(hiddenClassName);
    call.classList.add(hiddenClassName);
}

export function showCall() {
    const lobby = getLobbyEle();
    const call = getCallEle();
    lobby.classList.add(hiddenClassName);
    call.classList.remove(hiddenClassName);
}

function getLobbyEle(): HTMLElement {
    return <HTMLElement>document.getElementById("lobby")
}

function getCallEle(): HTMLElement {
    return <HTMLElement>document.getElementById("incall")
}
