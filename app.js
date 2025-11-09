import app from "./client.js";
import { getCCEmojis, logInteraction, saveState } from "./datahandler.js";
const aiApiUrl = "https://ai.hackclub.com/chat/completions";
const headers = {
	"Content-Type": "application/json"
};
const mainEmojis = [
	"brilliant-move",
	"great-move",
	"best-move",
	"alternative-move",
	"excellent-move",
	"good-move",
	"forced-move",
	"book-move",
	"inaccuracy-move",
	"mistake-move",
	"miss-move",
	"missed-win-move",
	"blunder-move"
];
const sideEmojis = [
	"checkmate-move",
	"draw-black-move",
	"fast-win-move",
	"critical-move",
	"free-piece-move"
];
const systemMessage = `The user message consists of a message that is sent in a conversation. Your job, as the Competitive Chess Emojis bot, is to analyze the message sent and determine how it might correspond as some chess move categories. For example, just like in a chess game, commonly known starting "moves," or messages, that are used at the beginning of a conversation are book moves (book-move). If a message is, based on the context, the most reasonable and most expectable message to send, it would be considered the best move (best-move). If the message is, based on the context, just as reasonable as the expected best move, but less expected, it would be considered an alternative best move (alternative-move). If a message is, based on the context, very reasonable and rather expectable, but maybe not the BEST response, it should be an excellent move (excellent-move). If a message is, based on the context, not bad, though not really the most expected and not really the best response, it should be a good move (good-move). If a message is, based on the context, BETTER than the most expected reasonable "best move," and a little unexpected while bringing a little extra information to the conversation, it should be a great move (great-move). If a message is, based on the context, much BETTER than a great move, very unexpected, provides a lot of new and radical information, and changes the direction of the conversation, it should be a brilliant move (brilliant-move). If a message is, based on the context, the ONLY message that could possibly make sense, to the extent where it's basically just forced (for example if someone asks "Can you help me?" answering with "yes" or "ok" is forced), it should be a forced move (forced-move). If a message is, based on the context, not really optimal, and not as good as maybe a good move, but still kind of ok, it should be an inaccuracy (inaccuracy-move). If a message is, based on the context, kind of bad, but not SUPER bad, yet still worse than an inaccuracy, it should be a mistake (mistake-move). If a message is, based on the context, really bad, unreasonable, but still expectably the worst response, it should be a blunder (blunder-move). If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is not any of them, instead being a simply acceptable message, the message should be considered a missed win (missed-win-move). `
	+ `If, based on the context, there are many expected and pretty clear best and excellent moves, but the message sent is a different move that should be fine, but loses much of the "advantage" that could have been had, it should be considered an incorrect move (miss-move). You need to choose EXACTLY ONE of the following strings, separated by a space: ${mainEmojis.join(", ")}. Additionally, you need to choose up to two of the other possible types of categories. If a message, based on the context, is also either the best move, great, or brilliant, as well as being something that doesn't really have a good reponse because it's kind of a conversational "checkmate," the move should be a checkmate (checkmate-move). If a message, based on the context, is not a bad move, and basically results in no good response because nobody is like completely winning, and it's kind of like a stalemate of some sort, the move should be a draw (draw-black-move). If, based on the context, it appears as though the conversation is very short, maybe within six to two to three messages, and the message could be classified as a checkmate, classify it instead as fast win (fast-win-move). If a message is, based on the context, classifiable as any really good move (brilliant, great, or best), it should be classified as critical (critical-move). If a message is, based on the context, a pretty bad move (mistake or blunder), and the move seems to give something away, like an opportunity or other advantage, it should be classified as a free piece (free-piece-move). You need to choose anywhere from ZERO TO TWO of the following strings, separated by spaces: ${sideEmojis.join(", ")}. Your final output MUST be EXACTLY the list of all the strings you chose (the original classification as well as the secondary classifications), separated with EXACTLY a space in between each string and nothing else.

Finally, this is the context of the conversation. Do consider, however, that it may be incomplete (missing some users). Just so you know, it's currently `;
const competitiveEmojis = {
	"fast-win-move": 10,
	"checkmate-move": 8,
	"brilliant-move": 5,
	"great-move": 4,
	"best-move": 3,
	"alternative-move": 3,
	"excellent-move": 2,
	"good-move": 1,
	"forced-move": 0,
	"book-move": 0,
	"draw-black-move": 0,
	"inaccuracy-move": -1,
	"mistake-move": -2,
	"miss-move": -3,
	"missed-win-move": -3,
	"blunder-move": -4
};
const competitiveSideEmojis = {
	"critical-move": 3,
	"free-piece-move": -3,
	"checkmate-white-move": 8,
	"checkmate-black-move": 8,
	"draw-white-move": 0
};
const competitiveSystemMessage = `The user message consists of a message that is sent in a conversation between two users. Your job, as the Competitive Chess Emojis bot, is to analyze the message sent and determine how it corresponds as a chess move categories. For example, just like in a chess game, the first few messages, as long as they are pretty common and well known, as well as starting the conversation, are book moves (book-move). If a message is, based on the conversation, the most reasonable and most expectable message to send, it would be considered the best move (best-move). If the message is, based on the conversation, just as reasonable as the expected best move, but less expected, it would be considered an alternative best move (alternative-move). If a message is, based on the conversation, very reasonable and rather expectable, but maybe not the BEST response, it should be an excellent move (excellent-move). If a message is, based on the conversation, not bad, though not really the most expected and not really the best response, it should be a good move (good-move). If a message is, based on the conversation, BETTER than the most expected reasonable "best move," and a little unexpected while bringing a little extra information to the conversation, it should be a great move (great-move). If a message is, based on the conversation, MUCH better than the great move, very unexpected, provides a lot of new and radical information, and changes the direction of the conversation, it should be a brilliant move (brilliant-move). If a message is, based on the conversation, the ONLY message that could possibly make sense, to the extent where it's basically just forced (for example if someone asks "Can you help me?" answering with "yes" or "ok" is forced), it should be a forced move (forced-move). If a message is, based on the conversation, not really optimal, and not as good as maybe a good move, but still kind of ok, it should be an inaccuracy (inaccuracy-move). If a message is, based on the conversation, kind of bad, but not SUPER bad, yet still worse than an inaccuracy, it should be a mistake (mistake-move). If a message is, based on the conversation, really bad, unreasonable, but still expectably the worst response, it should be a blunder (blunder-move). `
	+ `If, based on the conversation, there are many expected and pretty clear best and excellent moves, but the message sent is not any of them, instead of being a simply acceptable message, the message should be considered a missed win (missed-win-move). If, based on the conversation, there are many expected and pretty clear best and excellent moves, but the message sent is a different move that should be fine, but loses much of the "advantage" that could have been had, it should be considered a miss (miss-move). If a message, based on the conversation, could have been the best move, great, or brilliant, as well as being something that doesn't really have a good response becaues it's kind of a conversational "checkmate," the move should be a checkmate (checkmate-move). Note that this should only be possible if the conversation appears to have ended with this message signifying the clear "winner" of the conversation. If a message, based on the conversation, is not a bad move, and basically results in the conversation ending, but without any sort of "winner" because the conversation reaches some sort of "stalemate," the move should be considered a draw (draw-black-move). If the conversation is underneath six or seven messages long and the message would be classified as a checkmate, classify it instead as fast win (fast-win-move). What you HAVE to do is choose EXACTLY ONE of the following strings, separated by a space: ${Object.keys(competitiveEmojis).join(", ")}. Additionally, you need to choose up to one of the other possible reactions. If a message is, based on the conversation, classifiable as any really good move (brilliant, great, or best), while it changes the course of the conversation, it should be classified as critical (critical-move). If a message is, based on the conversation, a pretty bad move (mistake or blunder), and the move seems to give something away, like an opportunity or other advantage, it should be classified as a free piece (free-piece-move). You need to choose anywhere from ZERO TO ONE of the following strings, separated by a space: ${Object.keys(competitiveSideEmojis).join(", ")}. Your final output MUST be EXACTLY the list of all the strings you chose (the main classification as well as the secondary reaction if applicable), separated with EXACTLY a space in between each string and nothing else.

Finally, this is the entire conversation so far. Just so you know, it's currently `;
const lraj23BotTestingId = "C09GR27104V";
const lraj23UserId = "U0947SL6AKB";
const gPortfolioDmId = "D09RTN8GH9Q";
const commands = {};

const isInConversation = (userId, CCEmojis) => !CCEmojis.conversations.map(convo => [convo.white, convo.black]).flat().reduce((product, id) => product * (+!(id === userId)), 1);
const convoIsIn = (userId, CCEmojis) => CCEmojis.conversations.find(convo => [convo.white, convo.black].includes(userId));

app.message('', async ({ message }) => {
	if ((message.channel_type === "im") && (message.channel === gPortfolioDmId)) {
		const info = message.text.split(";");
		console.log(info[0], commands[info[0]]);
		return commands[info[0]]({
			ack: _ => _,
			body: {
				user_id: info[1],
				channel_id: info[2]
			},
			respond: (response) => {
				if (typeof response === "string") return app.client.chat.postEphemeral({
					channel: info[2],
					user: info[1],
					text: response
				});
				if (!response.channel) response.channel = info[2];
				if (!response.user) response.user = info[1];
				app.client.chat.postEphemeral(response);
			}
		});
	}
	let CCEmojis = getCCEmojis();
	if (!Object.keys(CCEmojis.whiteListedChannels).includes(message.channel)) return;
	let userId = message.user;
	let isInConvo = isInConversation(userId, CCEmojis) && convoIsIn(userId, CCEmojis).channel === message.channel;
	if (!CCEmojis.gameOptedIn.includes(userId)) {
		if (message.channel === lraj23BotTestingId) await app.client.chat.postEphemeral({
			channel: lraj23BotTestingId,
			user: userId,
			blocks: [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `You aren't opted in to Competitive Chess Emojis! Opt in with /ccemojis-game-opt-in`
					}
				}
			],
			text: `You aren't opted in to Competitive Chess Emojis! Opt in with /ccemojis-game-opt-in`,
			thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
		});
		return;
	}
	if (message.text.toLowerCase().includes("secret button") && !isInConvo) {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": mainEmojis[0],
			"timestamp": message.ts
		});
		return;
	}
	if (message.ts - CCEmojis.apiRequests[userId] < 1) {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": "you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit",
			"timestamp": message.ts
		});
		if (CCEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: `Your message was not reacted to because, in order to avoid getting rate limited, there is a cooldown of 5 seconds per user. :you-sent-a-message-too-fast-so-no-ai-request-to-avoid-rate-limit:`,
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	} else CCEmojis.apiRequests[userId] = message.ts;
	saveState(CCEmojis);
	let pastMessages = (isInConvo ? convoIsIn(userId, CCEmojis).messages : (await app.client.conversations.history({
		token: process.env.CEMOJIS_BOT_TOKEN,
		channel: message.channel,
		latest: message.ts * 1000,
		limit: 30
	})).messages.filter((msg, i) => (CCEmojis.dataOptedIn.includes(msg.user) && i)).reverse());
	console.log(message.text);
	const response = await fetch(aiApiUrl, {
		method: "POST",
		headers,
		body: JSON.stringify({
			"model": "openai/gpt-oss-120b",
			"messages": [
				{
					"role": "system",
					"content": (isInConvo ? competitiveSystemMessage : systemMessage) + new Date(Date.now()).toString() + ":\n" + pastMessages.map(msg => "User " + msg.user + " said (on " + new Date(1000 * msg.ts).toString() + "): " + msg.text).join("\n")
				},
				{
					"role": "user",
					"content": message.text
				}
			]
		})
	});
	const data = await response.json();
	if (data.error) if (data.error.message) if (data.error.message.split(":")[0] === "Rate limit exceeded") {
		await app.client.reactions.add({
			"channel": message.channel,
			"name": "sorry-my-ai-api-got-rate-limited",
			"timestamp": message.ts
		});
		if (CCEmojis.explanationOptedIn.includes(userId))
			await app.client.chat.postEphemeral({
				channel: message.channel,
				user: userId,
				text: `Your message was not reacted to because my AI API got rate limited. :sorry-my-ai-api-got-rate-limited:`,
				thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
			});
		return;
	}
	console.log(data.choices[0].message);
	let reactions = data.choices[0].message.content.split(" ");
	if (isInConvo) {
		let isPlayingBlack = Object.values(convoIsIn(userId, CCEmojis)).indexOf(userId);
		convoIsIn(userId, CCEmojis).messages.push(message);
		reactions.forEach(async reaction => {
			if ([...Object.keys(competitiveEmojis), ...Object.keys(competitiveSideEmojis)].includes(reaction))
				CCEmojis.coins[userId] += competitiveEmojis[reaction] !== undefined ? competitiveEmojis[reaction] : competitiveSideEmojis[reaction];
			switch (reaction) {
				case "fast-win-move":
					CCEmojis.coins[convoIsIn(userId, CCEmojis)[isPlayingBlack ? "white" : "black"]] -= competitiveEmojis["fast-win-move"];
					break;
				case "checkmate-move":
					CCEmojis.coins[convoIsIn(userId, CCEmojis)[isPlayingBlack ? "white" : "black"]] -= competitiveEmojis["checkmate-move"];
					break;
			}
			await app.client.reactions.add({
				channel: message.channel,
				name: [...Object.keys(competitiveEmojis), ...Object.keys(competitiveSideEmojis)].includes(reaction) ? (reaction === "checkmate-move" ? "checkmate-" + (isPlayingBlack ? "black" : "white") + "-move" : (reaction === "draw-black-move" ? "draw-" + (isPlayingBlack ? "black" : "white") + "-move" : reaction)) : "error_web",
				timestamp: message.ts
			});
		});
	} else {
		reactions.forEach(async reaction => await app.client.reactions.add({
			"channel": message.channel,
			"name": [...mainEmojis, ...sideEmojis].includes(reaction) ? reaction : "error_web",
			"timestamp": message.ts
		}));
	}
	if (CCEmojis.explanationOptedIn.includes(userId)) await app.client.chat.postEphemeral({
		channel: message.channel,
		user: userId,
		text: data.choices[0].message.reasoning || ":error_web:",
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
	saveState(CCEmojis);
});

commands["data-opt-in"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.dataOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis bot's data collection! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emoji bot's data collection!! :${mainEmojis[4]}:`);
	CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
};
app.command('/ccemojis-data-opt-in', commands["data-opt-in"]);

commands["game-opt-in"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.gameOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis game! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emojis game!! :${sideEmojis[3]}: This also opts you into the bot's data collection.`);
	CCEmojis.gameOptedIn.push(userId);
	if (!CCEmojis.coins[userId]) CCEmojis.coins[userId] = 0;
	if (!CCEmojis.dataOptedIn.includes(userId)) CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
};
app.command('/ccemojis-game-opt-in', commands["game-opt-in"]);

commands["explain-opt-in"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.explanationOptedIn.includes(userId))
		return await interaction.respond(`You have already opted into the Competitive Chess Emojis bot's explanations! :${mainEmojis[8]}:`);

	await interaction.respond(`You opted into the Competitive Chess Emoji bot's explanations!! :${mainEmojis[1]}: This also opts you into the game and data collection.`);
	CCEmojis.explanationOptedIn.push(userId);
	if (!CCEmojis.gameOptedIn.includes(userId)) CCEmojis.gameOptedIn.push(userId);
	if (!CCEmojis.dataOptedIn.includes(userId)) CCEmojis.dataOptedIn.push(userId);
	saveState(CCEmojis);
};
app.command('/ccemojis-explain-opt-in', commands["explain-opt-in"]);

commands["data-opt-out"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.dataOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emoji bot's data collection. :${mainEmojis[9]}: This also opts you out of the game and explanations.`);
		CCEmojis.dataOptedIn.splice(CCEmojis.dataOptedIn.indexOf(userId), 1);
		if (CCEmojis.gameOptedIn.includes(userId)) CCEmojis.gameOptedIn.splice(CCEmojis.gameOptedIn.indexOf(userId), 1);
		if (CCEmojis.explanationOptedIn.includes(userId)) CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis bot's data collection! :${sideEmojis[4]}:`);
};
app.command('/ccemojis-data-opt-out', commands["data-opt-out"]);

commands["game-opt-out"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.gameOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emojis game. :${sideEmojis[0]}: This also opts you out of the bot's explanations.`);
		CCEmojis.gameOptedIn.splice(CCEmojis.gameOptedIn.indexOf(userId), 1);
		if (CCEmojis.explanationOptedIn.includes(userId)) CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis game! :${sideEmojis[4]}:`);
};
app.command('/ccemojis-game-opt-out', commands["game-opt-out"]);

commands["explain-opt-out"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	let userId = interaction.body.user_id;
	let CCEmojis = getCCEmojis();

	if (CCEmojis.explanationOptedIn.includes(userId)) {
		await interaction.respond(`You opted out of the Competitive Chess Emoji bot's explanations. :${mainEmojis[11]}:`);
		CCEmojis.explanationOptedIn.splice(CCEmojis.explanationOptedIn.indexOf(userId), 1);
		saveState(CCEmojis);
		return;
	}

	await interaction.respond(`You can't opt out because you aren't opted into the Competitive Chess Emojis bot's explanations! :${sideEmojis[4]}:`);
};
app.command('/ccemojis-explain-opt-out', commands["explain-opt-out"]);

commands["start-game"] = async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let userId = interaction.body.user_id;
	if (!CCEmojis.gameOptedIn.includes(userId))
		return await interaction.respond(`You aren't opted into the Competitive Chess Emojis game! :${mainEmojis[11]}: Opt in first with /ccemojis-game-opt-in before trying to play!`);
	if (isInConversation(userId, CCEmojis))
		return await interaction.respond(`You can't start a game if you are currently in a game! If you finished your last game already, try running <command that doesn't work yet> and trying again.`);
	await app.client.chat.postEphemeral({
		"channel": interaction.body.channel_id,
		"user": userId,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Choose someone to play against:`
				},
				"accessory": {
					"type": "users_select",
					"placeholder": {
						"type": "plain_text",
						"text": "Default: yourself",
						"emoji": true
					},
					"action_id": "ignore-start-black"
				},
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":x: Cancel",
							"emoji": true
						},
						"value": "cancel",
						"action_id": "cancel"
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":white_check_mark: Go!",
							"emoji": true
						},
						"value": "confirm",
						"action_id": "confirm"
					}
				]
			}
		],
		"text": `Choose someone to play against:`
	});
};
app.command('/ccemojis-start-game', commands["start-game"]);

app.action(/^ignore-.+$/, async interaction => await interaction.ack());

app.action('cancel', async interaction => [await interaction.ack(), await interaction.respond({ "delete_original": true })]);

app.action('confirm', async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let whiteId = interaction.body.user.id;
	let blackId = interaction.body.state.values[Object.keys(interaction.body.state.values)[0]]["ignore-start-black"].selected_user || whiteId;

	if (isInConversation(blackId, CCEmojis))
		return await interaction.respond(`You can't start a game if <@${blackId}> is currently in a game! Try asking <@${blackId}> if they are done with their game.`);

	if (!CCEmojis.gameOptedIn.includes(blackId))
		return await interaction.respond(`<@${blackId}> isn't opted into the Competitive Chess Emojis game! They need to opt in first with /ccemojis-game-opt-in before they can play!`);

	CCEmojis.conversations.push({
		white: whiteId,
		black: blackId,
		channel: interaction.body.channel.id,
		initiated: Date.now(),
		messages: []
	});
	await interaction.respond(`<@${whiteId}> has started a game against <@${blackId}>. You are playing as White!`);
	await app.client.chat.postMessage({
		channel: blackId,
		text: `<@${whiteId}> has started a Competitive Chess Emojis game against you in <#${interaction.body.channel.id}>. Head over there now to talk to them and earn some :siege-coin:! You are playing as Black.`
	});
	saveState(CCEmojis);
});

commands["resign-game"] = async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let userId = interaction.body.user_id;

	await interaction.respond(`The resign feature works now! Until October 7, 8:30 PM Eastern Time, you couldn't resign.`);

	if (!isInConversation(userId, CCEmojis))
		return await interaction.respond(`You can't resign if you aren't playing one! Try starting a game with /ccemojis-start-game first!`);

	await app.client.chat.postEphemeral({
		"channel": interaction.body.channel_id,
		"user": userId,
		"blocks": [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Are you SURE you want to resign? :resign-move: You will lose 6-7 :siege-coin:!`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":x: No!",
							"emoji": true
						},
						"value": "cancel",
						"action_id": "cancel"
					},
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":resign-move: Yes",
							"emoji": true
						},
						"value": "resign",
						"action_id": "resign"
					}
				]
			}
		],
		"text": `Are you SURE you want to resign? :resign-move: You will lose 6-7 :siege-coin:!`
	});
	app.command('/ccemojis-resign-game', commands["resign-game"]);
};

app.action('resign', async interaction => {
	await interaction.ack();
	let CCEmojis = getCCEmojis();
	let resignId = interaction.body.user.id;
	let conversation = convoIsIn(resignId, CCEmojis);
	let winnerId = conversation.black === resignId ? conversation.white : conversation.black;

	let coinsLost = Math.floor(Math.random() * -2) - 5;
	CCEmojis.coins[resignId] += coinsLost;
	await interaction.respond(`<@${resignId}> has resigned their game against <@${winnerId}>. Your coin balance has changed by ${coinsLost} :siege-coin:`);
	await app.client.chat.postMessage({
		channel: winnerId,
		text: `<@${resignId}> has resigned their Competitive Chess Emojis game against you in <#${interaction.body.channel.id}>. They lost ${-coinsLost} :siege-coin: for resigning.`
	});
	CCEmojis.conversations.splice(CCEmojis.conversations.indexOf(conversation), 1);
	saveState(CCEmojis);
});

commands.leaderboard = async interaction => [await interaction.ack(), await interaction.respond(`This is the Competitive Chess Emojis game leaderboard! :siege-coin:\n\n` + Object.entries(getCCEmojis().coins).sort((a, b) => b[1] - a[1]).map(user => `<@${user[0]}> has ${user[1]} :siege-coin:!`).join("\n"))];
app.command('/ccemojis-leaderboard', commands.leaderboard);

commands.help = async interaction => [await interaction.ack(), await interaction.respond(`This is the Competitive Chess Emojis bot! The point of this is to earn coins through conversations worth coins against other people. Your coins are based on how each message is rated as a chess move. Since this uses AI to determine how good a message is, you have to opt IN for it to work.\nFor more information, check out the readme at https://github.com/lraj23/competitive-chess-emojis`), interaction.body.user_id === lraj23UserId ? await interaction.respond(`Test but only for <@${lraj23UserId}>. If you aren't him and you see this message, DM him IMMEDIATELY! about it.`) : null];
app.command('/ccemojis-help', commands.help);

commands["channel-opt-in"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.body.channel_id;
	const userId = interaction.body.user_id;
	const channelInfo = await app.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond(`You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /ccemojis-game-opt-in instead`);

	const channelName = channelInfo.channel.name;
	let CCEmojis = getCCEmojis();
	if (Object.keys(CCEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond(`You have already opted <#${channelId}> into this bot! :${mainEmojis[8]}:`);
	await app.client.chat.postMessage({ channel: channelId, text: `<@${userId}> opted <#${channelId}> into this bot! :${sideEmojis[3]}:` });
	CCEmojis.whiteListedChannels[channelId] = channelName;
	saveState(CCEmojis);
};
app.command('/ccemojis-channel-opt-in', commands["channel-opt-in"]);

commands["channel-opt-out"] = async interaction => {
	await interaction.ack();
	await logInteraction(interaction);
	const channelId = interaction.body.channel_id;
	const userId = interaction.body.user_id;
	const channelInfo = await app.client.conversations.info({
		channel: channelId,
		include_full_members: true
	});
	console.log(channelInfo.channel.creator);
	if (!(channelInfo.channel.creator === userId)) return await interaction.respond(`You aren't the channel creator, so you can not opt this bot in or out of the channel. :resign-move: You may have meant to run /ccemojis-game-opt-out instead`);

	let CCEmojis = getCCEmojis();
	if (!Object.keys(CCEmojis.whiteListedChannels).includes(channelId))
		return await interaction.respond(`You can't opt <#${channelId}> out because it isn't opted in! :${sideEmojis[4]}:`);
	await app.client.chat.postMessage({ channel: channelId, text: `<@${userId}> opted <#${channelId}> out of this bot! :${mainEmojis[11]}:` });
	delete CCEmojis.whiteListedChannels[channelId];
	saveState(CCEmojis);
};
app.command('/ccemojis-channel-opt-out', commands["channel-opt-out"]);

app.message(/secret button/i, async ({ message }) => {
	await app.client.chat.postEphemeral({
		channel: message.channel,
		user: message.user,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `<@${message.user}> mentioned the secret button! Here it is:`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `<@${message.user}> mentioned the secret button! Here it is:`,
		thread_ts: ((message.thread_ts == message.ts) ? undefined : message.thread_ts)
	});
});

app.action('button_click', async ({ body, ack, respond }) => {
	// Acknowledge the action
	await ack();
	console.log(body.channel.id, body.user.id, body.container.message_ts, body.container, body.container.message);
	await app.client.chat.postEphemeral({
		channel: body.channel.id,
		user: body.user.id,
		blocks: [
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `You found the secret button :${mainEmojis[0]}: Here it is again.`
				}
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "Secret Button :" + mainEmojis[0] + ":"
						},
						"action_id": "button_click"
					}
				]
			}
		],
		text: `You found the secret button :${mainEmojis[0]}: Here it is again.`,
		thread_ts: body.container.thread_ts || undefined
	});
});