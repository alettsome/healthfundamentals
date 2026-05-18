const { BotFrameworkAdapter, ActivityHandler } = require('botbuilder');
const express = require('express');

const app = express();
const port = 3978;

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

const bot = new ActivityHandler();
bot.onMessage(async (context, next) => {
    const text = context.activity.text.toLowerCase();
    if (text.includes('hello')) {
        await context.sendActivity('Hi there! How can I help you today?');
    } else {
        await context.sendActivity(`You said: ${context.activity.text}`);
    }
    await next();
});

app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

app.listen(port, () => {
    console.log(`Bot is running at http://localhost:${port}/api/messages`);
});