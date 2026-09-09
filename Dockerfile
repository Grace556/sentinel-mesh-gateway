FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json .eslintrc.js jest.config.js ./
COPY src/ ./src/
COPY tests/ ./tests/

RUN npm run typecheck
RUN npm run lint
RUN npm run test
RUN npm run build

CMD ["npm", "run", "test"]
