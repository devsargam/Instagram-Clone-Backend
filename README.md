<h1 align="center" style="border: 0;"> 📷 Instagram Clone Backend  </h1>

Just a hobby project, trying to create a clone instargam backend created with nestjs.

## Table Of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Tests](#tests)
- [Author](#author)
- [License](#license)

## Prerequisites

If your project needs any prerequisites or dependencies, list them here.

- node
- pnpm (preferred)
- docker

## Installation

Clone the project

```
git clone git@github.com:devsargam/Instagram-Clone-Backend.git
```

Setup the necessary environment variables

```
copy .env.example .env
```

Run `mailhog` & `Postgres database`

```
docker compose up
```

Run the migrations with

```
npx prisma migrate dev
```

Run the server

```
pnpm start:dev
```

## Tests

Not implemented properly yet

## Author

**Author Name** &nbsp; : &nbsp; Sargam Poudel <br>
**Author URI** &nbsp; &nbsp; &nbsp; : &nbsp; [www.sargam.me](https://www.sargam.me) <br>
**GitHub URI** &nbsp; &nbsp; &nbsp; : &nbsp; [devsargam](https://github.com/devsargam)

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
