<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# PMScan Backend

## Description

PMScan Backend is an API for the PMScan project.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, for using Makefile commands)

## Configuration

1. Copy the `.env.example` file to `.env` and fill in the necessary environment variables:

```bash
cp .env.example .env
```

2. Modify the `.env` file with your own values for:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
   - `REDIS_PASSWORD`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `PORT`
   - `JWT_SECRET`
   - `NODE_ENV`

## Starting the project

To start the project, run:

```bash
docker-compose up --build -d
```

The application will be accessible at `http://localhost:3000`.

## Useful commands

Voici quelques commandes utiles définies dans le Makefile :

- Restart the containers:
  ```
  make restart
  ```

- Launch Prisma Studio:
  ```
  make studio
  ```

- Create a new Prisma migration:
  ```
  make migrate name=nom_de_la_migration
  ```

- Run the tests:
  ```
  make tests
  ```

- Create the test database:
  ```
  make create-test-db
  ```

- Apply the migrations to the test database:
  ```
  make migrate-test-db
  ```

- Make a commit (run the tests before committing):
  ```
  make commit c="commit message"
  ```

## Project structure

The project uses Docker Compose to orchestrate the following services:

- `app` : The NestJS application
- `postgres` : PostgreSQL database
- `redis` : Redis server for caching

## Développement

The source code of the application is mounted as a volume in the `app` container, allowing hot reloading during development.

## Tests

The tests are executed in an isolated Docker environment. Make sure to have created the test database before running the tests.
