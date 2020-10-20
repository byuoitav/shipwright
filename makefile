# vars
ORG=$(shell echo $(CIRCLE_PROJECT_USERNAME))
BRANCH=$(shell echo $(CIRCLE_BRANCH))
NAME=$(shell echo $(CIRCLE_PROJECT_REPONAME))

ifeq ($(NAME),)
NAME := $(shell basename "$(PWD)")
endif

ifeq ($(ORG),)
ORG=byuoitav
endif

ifeq ($(BRANCH),)
BRANCH:= $(shell git rev-parse --abbrev-ref HEAD)
endif

# go
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
VENDOR=gvt fetch -branch $(BRANCH)

# docker 
DOCKER=docker
DOCKER_BUILD=$(DOCKER) build
DOCKER_LOGIN=$(DOCKER) login -u $(UNAME) -p $(PASS)
DOCKER_PUSH=$(DOCKER) push
DOCKER_FILE=dockerfile
DOCKER_FILE_ARM=dockerfile-arm

UNAME=$(shell echo $(DOCKER_USERNAME))
EMAIL=$(shell echo $(DOCKER_EMAIL))
PASS=$(shell echo $(DOCKER_PASSWORD))

# angular
NPM=npm
NPM_INSTALL=$(NPM) install
NG_BUILD=ng build --prod --aot --build-optimizer 
NG1=web

all: build docker

ci: deps build docker

build: build-x86  build-web

build-x86:
	env GOOS=linux CGO_ENABLED=0 $(GOBUILD) -o $(NAME)-bin -v

build-web: $(NG1)
	# ng1
	cd $(NG1) && $(NPM_INSTALL) && $(NG_BUILD) --base-href="/"
	rm -rf $(NG1)-dist
	mv -f $(NG1)/dist/$(NG1) $(NG1)-dist

test: 
	$(GOTEST) -v -race $(go list ./... | grep -v /vendor/) 

clean: 
	$(GOCLEAN)
	rm -f $(NAME)-bin
	rm -f $(NAME)-arm
	rm -rf $(NG1)-dist
	rm -rf vendor/

run: $(NAME)-bin $(NG1)-dist
	./$(NAME)-bin

deps:
	# npm config set unsafe-perm true
	# $(NPM_INSTALL) -g @angular/cli@latest
	$(GOGET) -d -v
ifneq "$(BRANCH)" "master"
	# put vendored packages in here
	# e.g. $(VENDOR) github.com/byuoitav/event-router-microservice
	gvt fetch -tag v3.3.10 github.com/labstack/echo
endif

docker: docker-x86 

docker-x86: $(NAME)-bin $(NG1)-dist
ifeq "$(BRANCH)" "master"
	$(eval BRANCH=latest)
endif
	$(DOCKER_BUILD) --build-arg NAME=$(NAME) -f $(DOCKER_FILE) -t $(ORG)/$(NAME):$(BRANCH) .
	@echo logging in to dockerhub...
	@$(DOCKER_LOGIN)
	$(DOCKER_PUSH) $(ORG)/$(NAME):$(BRANCH)
ifeq "$(BRANCH)" "latest"
	$(eval BRANCH=master)
endif

### deps
$(NAME)-bin:
	$(MAKE) build-x86

$(NG1)-dist:
	$(MAKE) build-web
