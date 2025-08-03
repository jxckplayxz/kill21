const fetch = require('node-fetch');
const { Client, GatewayIntentBits } = require('discord.js');

async function startBot() {
  const tokenUrl = 'https://voidy-script.neocities.org/gamepage';

  const res = await fetch(tokenUrl);
  if (!res.ok) {
    console.error('Failed to fetch token:', res.statusText);
    process.exit(1);
  }

  const token = (await res.text()).trim();

  if (!token) {
    console.error('Token is empty!');
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Store user replies here (userid -> reply message)
  const userReplies = new Map();

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command: !reply <UserId> <message>
    if (message.content.startsWith('!reply ')) {
      const args = message.content.split(' ').slice(1);
      const userId = args.shift();
      const replyMsg = args.join(' ');

      if (!userId || !replyMsg) {
        return message.reply('Usage: !reply <UserId> <message>');
      }

      userReplies.set(userId, replyMsg);
      message.reply(`✅ Stored reply for user ID ${userId}`);
      return;
    }

    // Command: !checkreply <UserId>  (optional, to check stored reply)
    if (message.content.startsWith('!checkreply ')) {
      const userId = message.content.split(' ')[1];
      if (!userId) {
        return message.reply('Usage: !checkreply <UserId>');
      }
      const reply = userReplies.get(userId);
      if (reply) {
        message.reply(`Reply for ${userId}: ${reply}`);
      } else {
        message.reply(`No reply stored for ${userId}`);
      }
      return;
    }
  });

  // Optional: simple HTTP server to allow Roblox to fetch replies
  const express = require('express');
  const app = express();
  app.use(express.json());

  app.get('/getreply/:userid', (req, res) => {
    const userid = req.params.userid;
    const reply = userReplies.get(userid);
    if (reply) {
      userReplies.delete(userid); // Remove once fetched
      res.json({ reply });
    } else {
      res.json({ reply: null });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Reply server running on port ${PORT}`);
  });

  await client.login(token);
}

startBot().catch(console.error);
