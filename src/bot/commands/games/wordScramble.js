const { EmbedBuilder } = require('discord.js');

const words = ['discord', 'bot', 'javascript', 'nodejs', 'mongoose'];

function scrambleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = {
    data: {
        name: 'wordscramble',
        description: 'Errate das durcheinandergebrachte Wort.',
        category: 'Games',
    },
    async execute(interaction) {
        const word = words[Math.floor(Math.random() * words.length)];
        const scrambledWord = scrambleWord(word);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔤 Wortwirrwarr')
            .setDescription(`Entschlüssle dieses Wort: **${scrambledWord}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const filter = response => response.content.toLowerCase() === word && response.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

        collector.on('collect', collected => {
            interaction.followUp({ content: `Richtig! Das Wort war **${word}**.` });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: `Zeit abgelaufen! Das Wort war **${word}**.` });
            }
        });
    },
};