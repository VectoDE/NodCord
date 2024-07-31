const { EmbedBuilder } = require('discord.js');

const board = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = '❌';

function displayBoard() {
    return board.map(row => row.map(cell => cell || '⬜').join(' ')).join('\n');
}

function checkWin() {
    for (let row of board) {
        if (row[0] && row[0] === row[1] && row[1] === row[2]) return row[0];
    }
    for (let col = 0; col < 3; col++) {
        if (board[0][col] && board[0][col] === board[1][col] && board[1][col] === board[2][col]) return board[0][col];
    }
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];
    return null;
}

module.exports = {
    data: {
        name: 'tictactoe',
        description: 'Spielt eine Runde Tic-Tac-Toe.',
        options: [
            {
                type: 4, // INTEGER type
                name: 'row',
                description: 'Reihe (0, 1 oder 2)',
                required: true,
            },
            {
                type: 4, // INTEGER type
                name: 'col',
                description: 'Spalte (0, 1 oder 2)',
                required: true,
            },
        ],
        category: 'Games',
    },
    async execute(interaction) {
        const row = interaction.options.getInteger('row');
        const col = interaction.options.getInteger('col');

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return interaction.reply({ content: 'Ungültige Position. Bitte wähle eine Reihe und Spalte zwischen 0 und 2.', ephemeral: true });
        }

        if (board[row][col]) {
            return interaction.reply({ content: 'Dieses Feld ist bereits belegt. Wähle ein anderes Feld.', ephemeral: true });
        }

        board[row][col] = currentPlayer;
        const winner = checkWin();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('⭕ Tic-Tac-Toe ❌')
            .setDescription(displayBoard())
            .setTimestamp();

        if (winner) {
            embed.addField('Spiel vorbei', `Spieler ${winner} hat gewonnen!`);
            board.forEach(row => row.fill(''));
        } else {
            currentPlayer = currentPlayer === '❌' ? '⭕' : '❌';
        }

        await interaction.reply({ embeds: [embed] });
    },
};