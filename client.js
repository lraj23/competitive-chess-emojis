import bolt from "@slack/bolt";
// import { log } from "./datahandler.js";
const { App } = bolt;

const startTime = Date.now();

const isSocketMode = (process.env.CEMOJIS_SOCKET_MODE === "true"); // only true in development
const app = new App({
	"token": process.env.CEMOJIS_BOT_TOKEN,
	"signingSecret": process.env.CEMOJIS_SIGNING_SECRET,
	"socketMode": isSocketMode,
	"appToken": process.env.CEMOJIS_APP_TOKEN,
	// "endpoints": "/slack/grubwars/events",
});

console.log(isSocketMode ? "Starting in Socket Mode!" : "Starting in Request URL Mode!");

await app.start(process.env.CEMOJIS_PORT || 5040);
console.log(`⚡ Slack bot ready in ${Date.now() - startTime}ms.`);

export default app;