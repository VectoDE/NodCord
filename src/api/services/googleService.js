const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2 } = google.auth;
const logger = require('./loggerService');

class GoogleService {
  constructor() {
    this.oAuth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
  }

  async listFiles() {
    try {
      logger.info('Listing files from Google Drive...');
      const res = await this.drive.files.list({
        pageSize: 10,
        fields: 'files(id, name)',
      });
      logger.info('Successfully retrieved file list from Google Drive.');
      return res.data.files;
    } catch (error) {
      logger.error('Error listing files from Google Drive:', error);
      throw error;
    }
  }

  async uploadFile(filePath) {
    try {
      logger.info(`Uploading file to Google Drive: ${filePath}`);
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

      logger.info(`Successfully uploaded file. File ID: ${res.data.id}`);
      return res.data.id;
    } catch (error) {
      logger.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      logger.info(`Deleting file from Google Drive. File ID: ${fileId}`);
      await this.drive.files.delete({ fileId });
      logger.info('Successfully deleted file from Google Drive.');
    } catch (error) {
      logger.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  async downloadFile(fileId, destPath) {
    try {
      logger.info(`Downloading file from Google Drive. File ID: ${fileId}`);
      const dest = fs.createWriteStream(destPath);

      await this.drive.files
        .get({ fileId, alt: 'media' }, { responseType: 'stream' })
        .then((response) => {
          return new Promise((resolve, reject) => {
            response.data
              .on('end', () => {
                logger.info(`Successfully downloaded file. File ID: ${fileId}`);
                resolve();
              })
              .on('error', (err) => {
                logger.error('Error downloading file from Google Drive:', err);
                reject(err);
              })
              .pipe(dest);
          });
        });
    } catch (error) {
      logger.error('Error downloading file from Google Drive:', error);
      throw error;
    }
  }
}

module.exports = GoogleService;
