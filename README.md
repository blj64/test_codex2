# Stock Management App

## Installation

```
npm install
```

### Environment

Create `.env` from `.env.example`.

## Commands

- `npm run dev` – start backend and frontend
- `npm run lint` – lint code
- `npm run format` – format code
- `npm run test` – run tests
- `npm --prefix backend run prisma:migrate` – run Prisma migrations
- `npm --prefix backend run seed` – seed database

## API

Swagger docs available at `/api/docs` when server running.

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Sales

- `GET /api/sales`
- `POST /api/sales`
- `GET /api/sales/:id`
- `DELETE /api/sales/:id`

## Tests

Run tests with `npm test`.

