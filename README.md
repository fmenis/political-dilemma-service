# Political Dilemma Service

> Web services for politica dilemma.

## Requirements

- [nodejs](https://nodejs.org/en/) (>=16.13.x)
- [npm](https://www.npmjs.com/) (>=8.1.0)
- [docker](https://www.docker.com/) (>=20)
- [docker-compose](https://docs.docker.com/compose/) (>=1)

## Initialization

1. **Set environments variables**  
   Copy the `.env-example` file and name it `.env`, then set the appropriated values. For details, see _Environment variables_ section.

2. **Inizialize database**  
   Launch the `npm run init-stack` script for initialize the postgres and redis instance.

3. **Start server**  
   Start the server with `npm start` (development) or `npm run dev` (production) scripts.

## Environment variables

**Bold** env must be requred.

| Name                      |       Default       | Description                             |
| ------------------------- | :-----------------: | --------------------------------------- |
| **NODE_ENV**              |                     | Nodejs environment                      |
| SERVER_ADDRESS            |      127.0.0.1      | Server address                          |
| SERVER_PORT               |        3000         | Server port                             |
| **API_DOMAIN**            |                     | Production, staging or dev domain       |
| LOG_LEVEL                 |        info         | Pino.js default log level               |
| SESSIONS_LIMIT            |          4          | Session number limit                    |
| **PG_HOST**               |                     | Postgres host                           |
| **PG_PORT**               |                     | Postgres port                           |
| **PG_DB**                 |                     | Postgres database                       |
| **PG_USER**               |                     | Postgres user                           |
| **PG_PW**                 |                     | Postgres password                       |
| **REDIS_HOST**            |                     | Redis host                              |
| **REDIS_PORT**            |                     | Redis port                              |
| **SECRET**                |                     | Secret string (used to sign the cookie) |
| SESSION_TTL               |  1800 (30 minutes)  | Session TTL (in seconds)                |
| COOKIE_TTL                | 15552000 (6 months) | Cookie max age (in seconds)             |
| RESET_LINK_TTL            |   7200 (2 hours)    | Reset link TTL (in seconds)             |
| LOG_REQ_BODY              |        false        | Enable request body logging             |
| WRITE_API_COUNTS          |        false        | Enable api counts persistence           |
| **AWS_REGION**            |                     | AWS REGION                              |
| **AWS_ACCESS_KEY_ID**     |                     | AWS access key id                       |
| **AWS_SECRET_ACCESS_KEY** |                     | AWS access key key                      |
| **SENDER_EMAIL**          |                     | Email address used to send email from   |
| **STATIC_FILES_DEST**     |                     | Static files destination full path      |
| **SENTRY_DSN**            |                     | Sentry dsn                              |

PS: If you have difficulties to compiling the env file, ask the backend guy!

## API usage

### Documentation

If the server is launched with the `npm run dev` script (development mode), the API documentation can be consulted at `http://{SERVER_ADDRESS}:{SERVER_PORT}/doc`.

### Authentication

The system uses a cookie-based authentication system.  
To authenticate the user, the `auth/login` API must be consumed with the right inputs. When this is done, the API returns a secure cookie to the client, and that's all.  
The cookie will be automatically added in the requeset by the user agent, since it can't be accessed by the client application due to security reasons.  
To remove the user authentication from the system, call the `auth/logout` API.

### Preloaded data

When the postgres container is created for the first time, some data is initialized.  
For example, there are available some users, useful to log into the system.
These are it's credentials

- `dennis@acme.com`: _Password1_
- `fiippo@acme.com`: _Password1_
- `gaetano@acme.com`: _Password1_

NB: obviously this data is only available in the development environment.

## Tests

To launch the test suite, run the `npm run test` script.

## Access to containers

Userful commands to directly access to the containers:

- _postgres_ --> `docker container exec -it postgres-pd /bin/bash`
- _postgres (psql)_ --> `docker container exec -it postgres-pd psql -U postgres`
- _redis_ --> `docker container exec -it redis-pd /bin/bash`
- _redis (redis-cli)_ --> `docker container exec -it redis-pd redis-cli`
