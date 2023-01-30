import DailyIframe from '@daily-co/daily-js';

window.addEventListener('DOMContentLoaded', () => {
  const container = <HTMLElement>document.getElementById('container');

  const callFrame = DailyIframe.createFrame(container, {
    showLeaveButton: true,
    iframeStyle: {
      position: 'fixed',
      width: 'calc(100% - 1rem)',
      height: 'calc(100% - 5rem)',
    },
  });
  // TODO: Replace the following URL with your own room URL.
  callFrame.join({ url: 'YOUR_DAILY_ROOM_URL' });
});
