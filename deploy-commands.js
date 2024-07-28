const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();

const commands = [
	new SlashCommandBuilder().setName('addbook').setDescription('Ajoute un livre dans la liste')
	.addStringOption(option => option
		.setName('book')
		.setDescription('Le nom du livre')
		.setRequired(true)
		.setAutocomplete(true)
	)
	.addNumberOption(o => o
		.setName("price")
		.setDescription("Le prix au quel le livre a été acheté")
		.setRequired(true)
	)
	.addBooleanOption(o => o
		.setName("read")
		.setDescription("Si le livre est déjà lu ou non")
		.setRequired(false)
	)
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);