FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/dist ./dist

CMD ["node", "."]