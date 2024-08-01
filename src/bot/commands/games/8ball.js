const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: '8ball',
        description: 'Beantwortet eine Ja/Nein-Frage.',
        options: [
            {
                type: 3, // STRING type
                name: 'question',
                description: 'Deine Frage',
                required: true,
            },
        ],
        category: 'Fun',
    },
    async execute(interaction) {
        const responses = [
            'Ja.',
            'Nein.',
            'Vielleicht.',
            'Es ist ungewiss.',
            'Auf jeden Fall.',
            'Auf keinen Fall.',
            'Frag später nochmal.',
            'Ich kann das jetzt nicht sagen.',
        ];

        const question = interaction.options.getString('question');
        const response = responses[Math.floor(Math.random() * responses.length)];

        const ballEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎱 8-Ball Antwort')
            .addFields(
                { name: 'Frage', value: question },
                { name: 'Antwort', value: response }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [ballEmbed] });
    },
};