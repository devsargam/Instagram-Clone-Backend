FROM node:20-alpine as base
RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

COPY . ./

RUN pnpm build \
  pnpm dlx prisma migrate deploy

EXPOSE 3000

CMD [ "pnpm", "start:prod" ]
