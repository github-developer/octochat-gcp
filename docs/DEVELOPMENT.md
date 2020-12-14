# Development

This document details how to setup, build, and deploy your very own octochat 🐱.

## 1. Create new GitHub App

You'll need a GitHub App to [identify users](https://docs.github.com/en/free-pro-team@latest/developers/apps/identifying-and-authorizing-users-for-github-apps) of your instance of Octochat.

1. Create a new GitHub App from [this template](https://github.com/settings/apps/new?name=octochat-dev&description=Octochat&url=https://example.com&callback_url=http://localhost:8000&webhook_url=https://example.com/hook&request_oauth_on_install=true&public=false&followers=read).
  * Note that the only permission needed is Followers: Read
  * Also note that the callback URL is `localhost`. This will be changed later.
2. Generate a new Client Secret. Make note of it and the Client ID, which you'll store securely below.

## 2. Set up Google Cloud project and authentication

Now that you have a GitHub App, set up a Google Cloud project and service account to be able to send and receive messages.

1. In the Google Cloud Console, on the [project selector page][selector], select or create a Google Cloud project.

2. Make sure that billing is enabled for your Cloud project.


3. [Install and initialize][gcloud] the Cloud SDK.

4. Click to enable the [Cloud Run, Firestore, Secret Manager, Container Registry APIs][api]
or use the `gcloud` CLI:

  ```
  gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  containerregistry.googleapis.com
  ```

5. Create a [Cloud Firestore](https://firebase.google.com/docs/firestore) database
in the [Firestore console](https://console.cloud.google.com/firestore) by selecting ~Native mode~.

6. Add your GitHub App credentials and session secret to [Google Secret Manager](https://cloud.google.com/secret-manager)
as JSON with inputs, `client_id` and `client_secret` as the GitHub App values noted before and `session_store_secret` as a text string of your choosing,

  ```json
  {
    "client_id": "abc",
    "client_secret": "abc",
    "session_store_secret": "test-pw-123"
  }
  ```
via the [Secret Manager console](https://console.cloud.google.com/security/secret-manager) or CLI:

  ```
  gcloud secrets create octochat-secret \
      --replication-policy="automatic" \
      --data-file=FILENAME.json
  ```

7. Create a service account with the [necessary roles](https://cloud.google.com/iam/docs/understanding-roles).

  ```
  gcloud iam service-accounts create octochat-identity

  # Allow service account to access the created secret
  gcloud secrets add-iam-policy-binding octochat-secret \
    --member serviceAccount:octochat-identity@$PROJECT_ID.iam.gserviceaccount.com \
    --role roles/secretmanager.secretAccessor

  # Allow the service account to access Firestore
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member serviceAccount:idp-sql-identity@$PROJECT_ID.iam.gserviceaccount.com \
    --role roles/datastore.user
  ```

8. Setup [`gcloud` as a Docker credential helper](https://cloud.google.com/container-registry/docs/advanced-authentication).

9. Build the container image

  ```
  docker build -t gcr.io/$PROJECT_ID/$IMAGE:$TAG .
  docker push gcr.io/$PROJECT_ID/$IMAGE:$TAG
  ```

10. Deploy the container image to Cloud Run.

  ```
  gcloud run deploy octochat \
    --image gcr.io/$PROJECT_ID/$IMAGE:$TAG \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --service-account octochat@$PROJECT_ID.iam.gserviceaccount.com \
    --update-env-vars SECRET=projects/$PROJECT_ID/secrets/octochat-secret/versions/latest
  ```

## 3. Hook up a GitHub Actions CI/CD pipeline


[selector]: https://console.cloud.google.com/projectselector2/home/dashboard?_ga=2.35245989.52258832.1607126248-641860286.1607126248
[api]: https://console.cloud.google.com/flows/enableapi?apiid=run.googleapis.com,%20secretmanager.googleapis.com,%20firestore.googleapis.com,%20containerregistry.googleapis.com&_ga=2.101338245.52258832.1607126248-641860286.1607126248
[gcloud]: https://cloud.google.com/sdk/docs
