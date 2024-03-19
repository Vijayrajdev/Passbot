require("dotenv").config();
const fs = require("fs");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const request = require("request");
const PNGReader = require("pngjs").PNGReader;

const app = express();
const PORT = process.env.PORT || 3030;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// Set the webhook for Telegram to send updates to
const webhookPath = "/telegram-webhook-path";
const webhookUrl = `https://pass-bot.onrender.com${webhookPath}`;
bot.setWebHook(webhookUrl);
app.use(express.json());
app.use(bodyParser.json());

// Respond only to POST requests at the webhook endpoint
app.post('/telegram-webhook-path', (req, res) => {
  // Handle incoming update from Telegram
  const update = req.body;
  
  // Process the update
  // For example, log the update to the console
  console.log('Received update:', update);
  
  // Generate a response
  const response = {
    // Your response payload here
    text: 'Hello from the bot!'
  };
  
  // Send the response back to Telegram as JSON
  res.setHeader('Content-Type', 'application/json');
  res.json(response);
});

// Respond with 404 for all other routes
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to the Passbot!");
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `You can use this bot to generate passwords. Here are the list of commands and usage:
-/start: Initiate interaction with Passbot.
-/help: Access the help menu to learn about available commands and usage guidelines.
-/password: Initiate the password generation process and select the desired length from predefined options.`
  );
});

bot.onText(/\/password/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Select the length that you want", {
    reply_markup: {
      keyboard: [["8", "14"], ["16", "18"], ["22"]],
    },
  });
});

bot.on("message", (msg) => {
  const messageText = msg.text;
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  const username = msg.from.username; // Get the username
  var hi = "hi";
  if (messageText.toString().toLowerCase().indexOf(hi) === 0) {
    bot.sendMessage(
      chatId,
      `Hi @${username} (${firstName}) !!` // Tag the user's profile and display the first name
    );
  }

  var bye = "bye";
  if (messageText.toString().toLowerCase().includes(bye)) {
    bot.sendMessage(
      chatId,
      `Hope to see you around again, @${username} (${firstName}). Bye`
    );
  }

  if (
    [8, 14, 16, 18, 22].some((num) =>
      messageText.toString().includes(num.toString())
    )
  ) {
    const loadWordsFromFile = (filename) => {
      try {
        const data = fs.readFileSync(filename, "utf8");
        return data
          .split("\n")
          .map((word) => word.trim())
          .filter((word) => word !== "");
      } catch (err) {
        console.error("Error reading words file:", err);
        return [];
      }
    };

    const words = loadWordsFromFile("words.txt");

    const symbols = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "{",
      "}",
      "/",
      "?",
      "<",
      ">",
      "|",
      "[",
      "]",
    ];

    const generatePassword = (length) => {
      let password = "";

      const numWords = Math.ceil(length / 6);

      for (let i = 0; i < numWords; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        password += words[randomIndex];

        if (i < numWords - 1) {
          password += symbols[Math.floor(Math.random() * symbols.length)];
          password += Math.floor(Math.random() * 10);
        }
      }

      password = password.slice(0, length);

      return password;
    };

    const length = messageText;
    const password = generatePassword(length);
    console.log(password);

    const img = `https://quickchart.io/qr?text=${password}`;
    bot.sendMessage(
      chatId,
      `Your new password is

<code>${password}</code>

${img}`,
      {
        parse_mode: "HTML",
      }
    );
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
