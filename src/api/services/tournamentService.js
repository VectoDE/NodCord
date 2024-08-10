const Tournament = require('../../models/ttournamentModel');
const Team = require('../../models/tteamModel');
const Match = require('../../models/tmatchModel');

class TournamentService {

    async createTournament(data) {
        const tournament = new Tournament(data);
        await tournament.save();
        return tournament;
    }

    async registerTeam(tournamentId, teamData) {
        const team = new Team(teamData);
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        tournament.teams.push(team);
        await team.save();
        await tournament.save();

        return team;
    }

    async createMatch(tournamentId, matchData) {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        const match = new Match(matchData);
        tournament.matches.push(match);
        await match.save();
        await tournament.save();

        return match;
    }

    async getTournament(tournamentId) {
        const tournament = await Tournament.findById(tournamentId).populate('teams').populate('matches');
        return tournament;
    }

    async listTournaments() {
        const tournaments = await Tournament.find().populate('teams').populate('matches');
        return tournaments;
    }

    async updateTournament(tournamentId, updateData) {
        const tournament = await Tournament.findByIdAndUpdate(tournamentId, updateData, { new: true });
        return tournament;
    }

    async deleteTournament(tournamentId) {
        await Tournament.findByIdAndDelete(tournamentId);
    }
}

module.exports = TournamentService;
