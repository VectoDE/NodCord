const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'rps',
        description: 'Spielt eine Runde Schere-Stein-Papier.',
        options: [
            {
                type: 3, // STRING type
                name: 'choice',
                description: 'Wähle zwischen Schere, Stein und Papier',
                required: true,
                choices: [
                    { name: 'Schere', value: 'schere' },
                    { name: 'Stein', value: 'stein' },
                    { name: 'Papier', value: 'papier' },
                ],
            },
        ],
        category: 'Games',
    },
    async execute(interaction) {
        const userChoice = interaction.options.getString('choice');
        const choices = ['schere', 'stein', 'papier'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result;
        if (userChoice === botChoice) {
            result = 'Es ist ein Unentschieden!';
        } else if (
            (userChoice === 'schere' && botChoice === 'papier') ||
            (userChoice === 'stein' && botChoice === 'schere') ||
            (userChoice === 'papier' && botChoice === 'stein')
        ) {
            result = 'Du hast gewonnen!';
        } else {
            result = 'Du hast verloren!';
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('✂️ Schere-Stein-Papier')
            .setDescription(`Du hast **${userChoice}** gewählt.\nDer Bot hat **${botChoice}** gewählt.\n\n${result}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};