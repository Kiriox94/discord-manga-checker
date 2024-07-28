const { Client, GatewayIntentBits, Partials, ChannelType, time, TimestampStyles, hyperlink, hideLinkEmbed } = require('discord.js');
const axios = require("axios")
const fs = require("fs");
const { channel } = require('diagnostics_channel');
require('dotenv').config();

if (!fs.existsSync("./config.json")) fs.writeFileSync("./config.json", "{}")
const config = require('./config.json');

const euroFormatter = new Intl.NumberFormat('fr-FR', {
   style: 'currency',
   currency: 'EUR',
});

const client = new Client({
   partials: [
      Partials.Channel,
      Partials.Message,
      Partials.Reaction
   ],
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.DirectMessages,
   ]
});

client.on("ready", () => {
   console.log(`Logged in as ${client.user.tag}!`)

   if (!config.booksChannelId) {
      client.guilds.cache.get(process.env.GUILD_ID).channels.create({name: "Livres", type: ChannelType.GuildForum}).then(channel => {
         channel.setAvailableTags([{name: "Lu", emoji: {name: "✅"}}])
         config.booksChannelId = channel.id;
         fs.writeFileSync("./config.json", JSON.stringify(config))
      })
   }
});

client.on('interactionCreate', async interaction => {
   // if (!interaction.isChatInputCommand()) return;

   const { commandName } = interaction;

   if (commandName === 'addbook') {
      if (interaction.isChatInputCommand()) {
         axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(interaction.options.getString("book"))}&sort=rating&limit=1&lang=fr`)
         .then(async function (response) {
            let manga = response.data.docs[0]
            let channel = client.channels.cache.get(config.booksChannelId)

            channel.threads.create({ name: manga.title, message: { 
                  content: `Écris par ${manga.author_name[0]} et publié par ${manga.publisher[0]} pour la première fois le ${time(new Date(manga.publish_date[0]), TimestampStyles.LongDate)}.\nIl a été acheté au prix de ${euroFormatter.format(interaction.options.getNumber("price"))}.\n${hyperlink("Voir sur Open Library.", hideLinkEmbed(`https://openlibrary.org/olid/${manga.cover_edition_key}`))}`,
                  files: [{
                     attachment: `https://covers.openlibrary.org/b/olid/${manga.cover_edition_key}-M.jpg`,
                     name: `${manga.title}.png`
                  }],
               },
               appliedTags: interaction.options.getBoolean("read") ? [channel.availableTags[0].id]: null
            }).then(async thread => 
               await interaction.reply({content: `https://discord.com/channels/${channel.id}/${thread.id}`, ephemeral: true})
            )
         })
      }else if(interaction.isAutocomplete()) {
         const focusedValue = interaction.options.getFocused();
         axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(focusedValue.replace(/\s+/g, '+'))}&fields=title,cover_edition_key&sort=rating&limit=25&lang=fr`)
         .then(async function (response) {
            await interaction.respond(
               response.data.docs.map(manga => ({ name: manga.title, value: manga.cover_edition_key ? manga.cover_edition_key : manga.title}))
            );
         })
         .catch(function (error) {
            console.log(error);
         })
      }
   }
});

client.login(process.env.TOKEN)
