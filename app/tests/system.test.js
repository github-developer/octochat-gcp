const assert = require('assert');
const got = require('got');
const { execSync } = require('child_process');
const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth();

describe('End-to-End Tests', () => {
  // Retrieve Cloud Run service test config
  const { GOOGLE_CLOUD_PROJECT } = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }

  let { SERVICE_NAME } = process.env;
  if (!SERVICE_NAME) {
    SERVICE_NAME = 'octochat';
    console.log(`"SERVICE_NAME" env var not found. Defaulting to "${SERVICE_NAME}"`);
  }

  const PLATFORM = 'managed';
  const REGION = 'us-central1';

  let BASE_URL, ID_TOKEN;
  before(async () => {
    // Retrieve URL of Cloud Run service
    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`
    );
    BASE_URL = url.toString('utf-8').trim();
    if (!BASE_URL) throw Error('Cloud Run service URL not found');

    const client = await auth.getIdTokenClient(BASE_URL);
    const clientHeaders = await client.getRequestHeaders();
    ID_TOKEN = clientHeaders.Authorization;
    if (!ID_TOKEN) throw Error('ID token could not be created');
  });

  it('Can successfully make a request', async () => {
    const options = {
      prefixUrl: BASE_URL.trim(),
      headers: {
        Authorization: ID_TOKEN.trim()
      },
      retry: 3
    };
    const response = await got('', options);
    assert.strictEqual(response.statusCode, 200);
  });
});
