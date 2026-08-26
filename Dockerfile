# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends ca-certificates python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY ["certs/KAINOS-ZSCALER G2_2026.pem", "/usr/local/share/ca-certificates/kainos-zscaler.crt"]
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/kainos-zscaler.crt

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=secret,id=prisma_ca,target=/tmp/prisma-ca.crt,required=false \
	if [ -s /tmp/prisma-ca.crt ]; then \
		NODE_EXTRA_CA_CERTS=/tmp/prisma-ca.crt npx prisma generate; \
	else \
		npx prisma generate; \
	fi

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
	&& apt-get install --yes --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/index.js"]