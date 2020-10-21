# ref: https://github.com/nodejs/docker-node/blob/7b11db1cab459beb96448e18ec421ec952fa0491/14/buster-slim/Dockerfile
ARG NODE_VERSION="14.14.0-buster-slim"
# ref: https://github.com/rust-lang/docker-rust/blob/a5896ce68cee87e80a44d078afbf05d5b679cdbc/1.47.0/buster/slim/Dockerfile
ARG RUST_VERSION="1.47.0-slim-buster"

FROM node:${NODE_VERSION} AS node

############################
# Global env
############################
FROM node AS root
USER root

# Move .cache's from node_modules, etc
ENV CACHE_DIR=/tmp/.cache

# Create build time dirs and symlinks
RUN mkdir -p \
    /tmp/.vscode-server \
    /tmp/node_modules \
    /code
# Enable user to write to workdirs
RUN chown -R node:node \
    /tmp/.vscode-server \
    /tmp/node_modules \
    /code
RUN chmod -R 755 \
    /tmp/node_modules \
    /tmp/.vscode-server \
    /code    

# Do not run node_modules as root user!
USER node
WORKDIR /home/node

# Persist on mounted volumes
RUN ln -sf /tmp/.vscode-server
RUN ln -sf /tmp/node_modules
RUN echo "{}" > package.json

# Configure npm
ENV NPM_CONFIG_PREFIX=/tmp/.npm-global

# Install and configure yarn 2
RUN npm install -g yarn
RUN yarn set version berry
RUN yarn config set globalFolder /tmp/.yarn-global && \
    yarn config set enableGlobalCache true && \
    yarn config set nodeLinker node-modules
RUN yarn install

############################
# Rust app dev env
# ref: https://github.com/rust-lang/docker-rust/blob/a5896ce68cee87e80a44d078afbf05d5b679cdbc/1.47.0/alpine3.12/Dockerfile
############################
FROM root AS rust
USER root

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

RUN apt-get update; \
    apt-get install -y --no-install-recommends \
    build-essential pkg-config \
    ca-certificates libssl-dev \
    libnss3-dev libgconf-2-4 xvfb \
    curl \
    git less \
    ;

# Get Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

# Global crates
# NOTE: wasm-pack segfaults on alpine
# ref: https://github.com/rustwasm/wasm-pack/issues/917
RUN cargo install wasm-pack

############################
# Node app dev env
############################
FROM rust AS dev
USER root

# Allow non-root use of rustup
RUN chown -R node: ${RUSTUP_HOME} ${CARGO_HOME}

# Do not run node_modules as root user!
ENV USER node
USER node

# App setup
WORKDIR /code/hash.ai/ha/game_of_tag

# Make container execute npm tasks by default
ENTRYPOINT ["npm", "run"]
