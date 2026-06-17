ARG BUN_VERSION=canary-distroless@sha256:e025eb16801248cab25a03eea576570b266780efd91752fc598b387d755e066b
ARG ALPINE_VERSION=3.22.4@sha256:310c62b5e7ca5b08167e4384c68db0fd2905dd9c7493756d356e893909057601
ARG PORT=3020

FROM oven/bun:${BUN_VERSION} AS bun

# ✅ rename this stage to bun-upx
FROM alpine:${ALPINE_VERSION} AS bun-upx
RUN apk add upx
COPY --from=bun /usr/local/bin/bun /usr/local/bin/
WORKDIR /usr/local/bin
RUN upx --best --lzma bun

FROM frolvlad/alpine-glibc AS deps
COPY --from=bun-upx /usr/local/bin/bun /usr/local/bin/
WORKDIR /app
COPY package.json ./
COPY bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun build ./src/index.ts \
    --minify \
    --sourcemap=none \
    --outfile server.js \
    --target=bun

FROM debian:bookworm-slim@sha256:b29f74a267526ae6ea104eed6c46133b0ca70ce812525df8cd5817698f0a624a AS runtime-base
RUN apt-get update && apt-get install -y \
    libc6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash app

FROM scratch AS runtime
COPY --from=runtime-base /lib/x86_64-linux-gnu/libc.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib/x86_64-linux-gnu/libdl.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib/x86_64-linux-gnu/libpthread.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib/x86_64-linux-gnu/libm.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib/x86_64-linux-gnu/librt.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib/x86_64-linux-gnu/libgcc_s.so.* /lib/x86_64-linux-gnu/
COPY --from=runtime-base /lib64/ld-linux-x86-64.so.* /lib64/
COPY --from=runtime-base /etc/passwd /etc/passwd
COPY --from=runtime-base /etc/group /etc/group
COPY --from=runtime-base /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /app

COPY --from=bun-upx /usr/local/bin/bun /usr/local/bin/bun
COPY --from=build --chown=app:app /app/server.js ./server.js

USER app

ENV NODE_ENV=production \
    PORT=6000

EXPOSE 6000

CMD ["bun", "run", "server.js"]