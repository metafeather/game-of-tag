.DEFAULT_GOAL: help

ORG     := hash.ai
NAME    := game_of_tag
VERSION := $(ORG)/$(NAME):$(shell git rev-parse HEAD)
LATEST  := $(ORG)/$(NAME):latest


############################
# Utils
############################
# callable with args, e.g. $(call help, Some text)
help = @(printf "\033[32m\xE2\x9c\x93 $1\n\033[0m")
log = @(printf "\x1B[32m>> $1\n\x1B[39m")

# Dynamic help generated from usage vars
.PHONY: help
help: 	usage := Show help message
help:
	$(call log, $(usage))
	@grep -E '^[a-zA-Z_-]+:.*?usage := .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?usage := "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: usage
usage: 
	$(call help, $(usage))


############################
# Targets
############################
.DEFAULT_GOAL: help

# Use an .env file to override the defaults
-include .env

.PHONY: build
build:	usage := Build the docker image
build:	usage
build:
	@docker build --rm -f Dockerfile \
			--target dev \
			-t $(LATEST) .

.PHONY: down
down:	usage := Stop the docker image
down:	usage
down:
	@docker rm -f $(NAME) || true

.PHONY: up
up:	usage := Start the docker image
up:	usage
up: HOST_OS ?= $(shell uname -s)}
up: HOST_HOME ?= $(HOME)
up: 
	@docker run -dt --restart unless-stopped --name $(NAME) \
		-p 8080:8080 \
	    --mount source=$(NAME).vscode-server,target=/tmp/.vscode-server \
	    --mount source=$(NAME).node_modules,target=/tmp/node_modules \
	    --mount type=bind,src=$(shell pwd),dst=/code \
	    $(LATEST) keepalive

.PHONY: logs
logs:	usage := View realtime logs of the running docker image
logs:	usage
logs:
	@docker logs -f $(NAME)

.PHONY: shell
shell:	usage := Attach a shell to the running docker image
shell:	usage
shell:	
	@docker exec -it $(NAME) /bin/bash

### Deployments
.PHONY: app
app:	build down up logs