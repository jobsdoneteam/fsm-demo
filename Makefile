.PHONY: up down logs db-shell db-studio db-push

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Build and start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View app logs
	docker-compose logs -f app

db-shell: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d fsm_demo

db-studio: ## Open Prisma Studio
	docker-compose exec app npx prisma studio

db-push: ## Push Prisma schema to database
	docker-compose exec app npx prisma db push

rebuild: ## Rebuild and start all services
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
