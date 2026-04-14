.PHONY: help install dev build preview test test-watch test-coverage test-e2e lint lint-fix typecheck format clean docker-build docker-run docker-dev docker-dev-down ci

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

dev: ## Start development server
	pnpm dev

build: ## Build production bundle
	pnpm build

preview: ## Preview production build
	pnpm preview

test: ## Run unit tests
	pnpm test

test-watch: ## Run unit tests in watch mode
	pnpm test:watch

test-coverage: ## Run unit tests with coverage
	pnpm test:coverage

test-e2e: ## Run E2E tests (builds first)
	pnpm build && pnpm test:e2e

test-e2e-ui: ## Run E2E tests with Playwright UI
	pnpm build && pnpm test:e2e:ui

lint: ## Run ESLint
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

typecheck: ## Run TypeScript type checking
	pnpm typecheck

format: ## Format code with Prettier
	pnpm format

clean: ## Remove build artifacts
	rm -rf dist coverage playwright-report

docker-build: ## Build Docker image
	docker build -t lego-builder:latest .

docker-run: ## Run Docker image (port 8080)
	docker run -p 8080:80 lego-builder:latest

docker-dev: ## Start dev environment with Docker Compose
	docker-compose up

docker-dev-down: ## Stop Docker Compose
	docker-compose down

ci: lint typecheck test build ## Run full CI pipeline locally
