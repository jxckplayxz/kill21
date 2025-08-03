const fetch = require('node-fetch');
const { Client, GatewayIntentBits } = require('discord.js');

async function startBot() {
  // URL where your token is stored as plain text or JSON
  const tokenUrl = 'https://voidy-script.neocities.org/gamepage'; // or JSON endpoint

  // Fetch token (adjust if JSON)
  const res = await fetch(tokenUrl);
  if (!res.ok) {
    console.error('Failed to fetch token:', res.statusText);
    process.exit(1);
  }

  // If raw text token
  const token = (await res.text()).trim();

  // Or if JSON response, e.g. { "token": "ABC" }
  // const data = await res.json();
  // const token = data.token;

  if (!token) {
    console.error('Token is empty!');
    process.exit(1);
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    // Your commands here
    if (message.content === '!ping') {
      message.channel.send('Pong!');
    }
  });

  await client.login(token);
}

startBot().catch(console.error);
