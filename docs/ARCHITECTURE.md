# High-level architecture

![Architecture](https://user-images.githubusercontent.com/2993937/101359055-bb4c6680-3869-11eb-866a-77ead59659ec.png)

A containerized web client running in Cloud Run and comprised of a Node.js server and templated client make authenticated requests to Cloud Firestore using the `@google-cloud/firestore` Node.js library. It authenticates to Cloud Secret Manager using the `@google-cloud/secret-manager` library and a service account with access to read secrets from a path defined in the environment variable, `SECRET`.

For more information about these services, please see:

- [Cloud Firestore](https://firebase.google.com/docs/firestore/) or Cloud 
- [Cloud Run](https://cloud.google.com/run/)
- [Cloud Secret Manager](https://cloud.google.com/secret-manager)
