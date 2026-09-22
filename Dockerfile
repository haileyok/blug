# syntax=docker/dockerfile:1

# ---- Build stage ----
# Node 22 required: vite 7 (v7.3.5) needs node ^20.19.0 || >=22.12.0.
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
# yarn.lock is the source of truth for reproducible installs.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the source and build.
# We call `remix vite:build` directly instead of `yarn build` because the
# package.json build script wraps it with `dotenv -e .env`, and dotenv-cli
# is not a declared dependency. Env vars are provided at runtime instead.
COPY . .
RUN yarn exec remix vite:build

# ---- Runtime stage ----
# Keep in sync with the build stage — vite 7's engine floor applies here too
# because yarn install runs in this stage.
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production \
    && yarn cache clean

# Bring in the compiled server/client output.
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public

# Remix serve listens on port 3000 by default.
EXPOSE 3000

# Run the server directly. `remix-serve` is a production dependency,
# so no global install is needed. Env vars (ATP_*, REDIS_URL) are
# injected at runtime via docker-compose / container env.
CMD ["yarn", "exec", "remix-serve", "./build/server/index.js"]
