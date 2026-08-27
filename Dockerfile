# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends ca-certificates python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

RUN --mount=type=secret,id=corporate_ca,target=/tmp/corporate-ca.crt,required=false \
	if [ -s /tmp/corporate-ca.crt ]; then \
		NODE_EXTRA_CA_CERTS=/tmp/corporate-ca.crt npm install --global npm@12.0.2; \
	else \
		npm install --global npm@12.0.2; \
	fi

COPY package.json package-lock.json ./
RUN --mount=type=secret,id=corporate_ca,target=/tmp/corporate-ca.crt,required=false \
	if [ -s /tmp/corporate-ca.crt ]; then \
		NODE_EXTRA_CA_CERTS=/tmp/corporate-ca.crt npm ci; \
	else \
		npm ci; \
	fi

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=secret,id=corporate_ca,target=/tmp/corporate-ca.crt,required=false \
	if [ -s /tmp/corporate-ca.crt ]; then \
		NODE_EXTRA_CA_CERTS=/tmp/corporate-ca.crt npx prisma generate; \
	else \
		npx prisma generate; \
	fi

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM build AS migration

CMD ["npm", "run", "db:migrate"]

FROM build AS production-dependencies

RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist ./dist
COPY --from=production-dependencies /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/index.js"]