const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');

const token = 'MTM1MjY0NDE0Nzc4MTE3NzQxNw.GBZfV8.0TcorE79UIbAUsCXQYzf-utk8RBfD-KZuP4g98';
const clientId = '1352644147781177417';
const guildId = '1397384666369232977';

const webhooks = new Map(); // Temporary memory-based store

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Shows usage guide for the bot'),
  new SlashCommandBuilder()
    .setName('script')
    .setDescription('Sends the latest Vertex Z script'),
  new SlashCommandBuilder()
    .setName('api')
    .setDescription('Fetch or store your webhook')
    .addSubcommand(sub =>
      sub.setName('fetch')
        .setDescription('Store your webhook URL')
        .addStringOption(option =>
          option.setName('url')
            .setDescription('Your Discord Webhook URL')
            .setRequired(true)
        )
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Commands registered.');
  } catch (err) {
    console.error(err);
  }
})();

// Slash Command Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'panel') {
    await interaction.reply({
      content: `🛠 **Vertex Z Bot Usage**
Use:
• \`/script\` — to get the Roblox script  
• \`/api fetch <webhook>\` — to store your Discord webhook  
• \`!send <webhook> <message>\` — send a message to a webhook
`,
      ephemeral: true
    });

  } else if (commandName === 'script') {
    await interaction.reply({
      content: `\`\`\`lua
-- Vertex Z Script
loadstring(game:HttpGet("https://yourwebsite.com/vertexz.lua"))()
\`\`\``,
      ephemeral: true
    });

  } else if (commandName === 'api') {
    const url = interaction.options.getString('url');
    webhooks.set(interaction.user.id, url);
    await interaction.reply({ content: `✅ Webhook saved!`, ephemeral: true });
  }
});

// Message command (!send)
client.on('messageCreate', async message => {
  if (!message.content.startsWith('!send')) return;

  const args = message.content.split(' ').slice(1);
  const [url, ...msgParts] = args;
  const msg = msgParts.join(' ');

  if (!url || !msg) {
    return message.reply('Usage: `!send <webhook> <message>`');
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: msg })
    });
    message.reply('✅ Message sent to webhook.');
  } catch (err) {
    message.reply('❌ Failed to send webhook. Make sure it is valid.');
  }
});

client.login(token);
