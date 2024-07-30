module.exports = (client) => {
    client.on('messageDelete', (message) => {
        // Überprüfen, ob die gelöschte Nachricht in einer Gilde war (keine DM)
        if (!message.guild) return;

        // Logge die gelöschte Nachricht in der Konsole
        console.log(`Nachricht von ${message.author.tag} gelöscht in ${message.channel.name}:\n${message.content}`);
    });
};
