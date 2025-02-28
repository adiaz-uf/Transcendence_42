# Variables
DOCKER_COMPOSE = docker compose
PROJECT_NAME = transcendence

# Basic commands
.PHONY: help up down build restart logs clean dbshell shell init fclean re

.SILENT:

help:  ## Display the list of available commands
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up:  ## Start the Docker containers
	$(DOCKER_COMPOSE) up -d

down:  ## Stop and remove the Docker containers
	$(DOCKER_COMPOSE) down

build:  ## Build the Docker containers
	$(DOCKER_COMPOSE) build

restart:  ## Restart the Docker services
	$(DOCKER_COMPOSE) restart

logs:  ## Show real-time logs from containers
	$(DOCKER_COMPOSE) logs -f

clean:  ## Remove all Docker containers and volumes related to the project
	$(DOCKER_COMPOSE) down -v

shell:  ## Open an interactive shell in the backend (Django) container
	$(DOCKER_COMPOSE) exec backend sh

dbshell:  ## Open a connection to the PostgreSQL database
	$(DOCKER_COMPOSE) exec db psql -U postgres -d transcendence_db

migrate:  ## Apply Django database migrations
	$(DOCKER_COMPOSE) exec backend python manage.py migrate

createsuperuser:  ## Create a Django superuser
	$(DOCKER_COMPOSE) exec backend python manage.py createsuperuser

collectstatic:  ## Collect Django static files
	$(DOCKER_COMPOSE) exec backend python manage.py collectstatic --noinput

makemigrations:  ## Generate Django migrations
	$(DOCKER_COMPOSE) exec backend python manage.py makemigrations

test:  ## Run Django tests
	$(DOCKER_COMPOSE) exec backend python manage.py test

npm_install:  ## Install React dependencies
	$(DOCKER_COMPOSE) exec frontend npm install

npm_build:  ## Build the React project for production
	$(DOCKER_COMPOSE) exec frontend npm run build

init: build up  ## Initialize the project

fclean:  ## Completely clean the project (remove containers and volumes)
	$(DOCKER_COMPOSE) down -v
	@docker rmi $$(docker images -qa)

re:  ## Rebuild and restart the project from scratch
	$(MAKE) fclean
	$(MAKE) build
	$(MAKE) up
