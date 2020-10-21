ARG NODE_VERSION="14.11.0-alpine3.12"
ARG RUST_VERSION="1.47.0-alpine3.12"

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

RUN apk add --no-cache \
        ca-certificates \
        gcc

RUN apk -q add --update --no-cache \
    --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
    git less openssl \
    rustup

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
    
# Get latest rust
RUN rustup-init -y
RUN rustup update

############################
# Node app dev env
############################
FROM rust AS dev
USER root

# Do not run node_modules as root user!
ENV USER node
USER node

# App setup
WORKDIR /code/hash.ai/ha/game_of_tag

# Make container execute npm tasks by default
ENTRYPOINT ["npm", "run"]
