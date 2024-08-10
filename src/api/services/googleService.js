const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2 } = google.auth;

class GoogleService {
    constructor() {
        this.oAuth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        this.oAuth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
    }

    async listFiles() {
        const res = await this.drive.files.list({
            pageSize: 10,
            fields: 'files(id, name)',
        });
        return res.data.files;
    }

    async uploadFile(filePath) {
        const fileMetadata = {
            name: path.basename(filePath),
        };
        const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
        };

        const res = await this.drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        return res.data.id;
    }

    async deleteFile(fileId) {
        await this.drive.files.delete({ fileId });
    }

    async downloadFile(fileId, destPath) {
        const dest = fs.createWriteStream(destPath);

        await this.drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        ).then(response => {
            return new Promise((resolve, reject) => {
                response.data
                    .on('end', () => resolve())
                    .on('error', err => reject(err))
                    .pipe(dest);
            });
        });
    }
}

module.exports = GoogleService;
