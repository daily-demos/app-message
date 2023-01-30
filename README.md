# Daily App Message demo

This is a demo showing various ways to send data to video call participants with Daily's [`"app-message"` events](https://docs.daily.co/reference/daily-js/events/participant-events#app-message).

![Demo screenshot description](./screenshot.png)

## Prerequisites

- [Sign up for a free Daily account](https://dashboard.daily.co/signup).

## How the demo works

The demo allows you to either join an existing Daily room or create a new one at runtime. It then joins a video call using an embedded [Daily Prebuilt](https://www.daily.co/products/prebuilt-video-call-app/) iframe. Two custom controls are added to the right of the frame: one to broadcast an `"app-message"` event from the client, and one to do the same from the server.

- The client-side broadcasting of an `"app-message"` event is done using a [`sendAppMessage()`](https://docs.daily.co/reference/daily-js/instance-methods/send-app-message) Daily instance method.
- The server-side broadcasting of an `"app-message"` event is done using a POST request to Daily's [`/rooms/:name/send-app-message`](https://docs.daily.co/reference/rest-api/rooms/send-app-message) REST API endpoint.

The server-side POST request is made through a [Netlify function](https://docs.netlify.com/functions/overview/), but the logic of the request would be the same with other stateless functions (like AWS Lambda) or a more traditional server implementation.

## Running locally

1. `git clone REPO`
1. Copy `example.env` into a file called `.env``
1. Paste your [Daily API key](https://dashboard.daily.co/developers) into the `DAILY_API_KEY` variable in the `.env` file. Do _not_ commit this file to source control!
1. `cd app-message`
1. `npm i && npm run dev`

## Contributing and feedback

Let us know how experimenting with this demo goes! Feel free to reach out to us any time at `help@daily.co`.
