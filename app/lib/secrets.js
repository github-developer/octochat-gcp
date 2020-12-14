const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
let client;

async function getSecrets (secretName) {
  if (!client) client = new SecretManagerServiceClient();
  try {
    const [version] = await client.accessSecretVersion({ name: secretName });
    return version.payload.data;
  } catch (err) {
    throw Error(`Error accessing Secret Manager: ${err}`);
  }
}

const { SECRET } = process.env;
async function getConfig () {
  if (SECRET) {
    const secrets = await getSecrets(SECRET);
    try {
      // Parse the secret that has been added as a JSON string
      // to retreive database credentials
      return JSON.parse(secrets.toString('utf8'));
    } catch (err) {
      throw Error(
        `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: ${err}`
      );
    }
  } else {
    throw Error('SECRET needs to be set.');
  }
}

module.exports = {
  getConfig
};
