# Build the TypeScript application and generate the Prisma client.
FROM node:20-bookworm-slim AS build

WORKDIR /app

# argon2 falls back to node-gyp compilation when a prebuilt binary is unavailable.
RUN apt-get update \
	&& apt-get install --yes --no-install-recommends ca-certificates python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

# Trust the corporate proxy CA for npm and Prisma HTTPS downloads.
COPY ["certs/KAINOS-ZSCALER G2_2026.pem", "/usr/local/share/ca-certificates/kainos-zscaler.crt"]
RUN update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/kainos-zscaler.crt

# Copy manifests and the schema first so dependency and Prisma layers can be cached.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Compile the application after installing dependencies.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

# Keep the final image limited to production dependencies and compiled output.
FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Prisma requires OpenSSL at runtime to select its generated query engine.
RUN apt-get update \
	&& apt-get install --yes --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Prisma's generated client is required by @prisma/client at runtime.
COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["npm", "start"]