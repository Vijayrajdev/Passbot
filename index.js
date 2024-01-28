require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const request = require("request");

const Pass_key = process.env.PASS_TOKEN;
const Pass_host = process.env.PASS_HOST;
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to the Passbot!");
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `You can use this bot to generate passwords. Here are the list of commands and usage:
  1. /start:- To start the bot.
  2. /help:- To open help menu.
  3. /password:- To generate passwords.`
  );
});

bot.onText(/\/password/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Select the length that you want", {
    reply_markup: {
      keyboard: [
        ["5", "10"],
        ["16", "32"],
        ["32", "64"],
      ],
    },
  });
});

bot.on("message", (msg) => {
  const messageText = msg.text;
  const chatId = msg.chat.id;
  var hi = "hi";
  if (messageText.toString().toLowerCase().indexOf(hi) === 0) {
    bot.sendMessage(
      msg.from.id,
      messageText + " " + msg.from.first_name + " !!"
    );
  }

  var bye = "bye";
  if (messageText.toString().toLowerCase().includes(bye)) {
    bot.sendMessage(chatId, "Hope to see you around again , Bye");
  }

  if (
    [5, 10, 16, 32, 32, 64].some((num) =>
      messageText.toString().includes(num.toString())
    )
  ) {
    const options = {
      method: "GET",
      url: "https://password-generator-by-api-ninjas.p.rapidapi.com/v1/passwordgenerator",
      qs: { length: messageText },
      headers: {
        "X-RapidAPI-Key": Pass_key,
        "X-RapidAPI-Host": Pass_host,
      },
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      const res = JSON.parse(body);
      const randomPassword = res.random_password;
      console.log(randomPassword);
      bot.sendMessage(chatId, `Your new password is "${randomPassword}"`);
    });
  }
});
