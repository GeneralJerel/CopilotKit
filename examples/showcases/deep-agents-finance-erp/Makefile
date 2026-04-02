.PHONY: db db-seed agent frontend dev stop clean

# Postgres
DB_USER   := erp_user
DB_PASS   := erp_password
DB_NAME   := finance_erp
DB_PORT   := 5432
CONTAINER := finance-erp-db

# Start Postgres container
db:
	@docker start $(CONTAINER) 2>/dev/null || \
		docker run --name $(CONTAINER) \
			-e POSTGRES_USER=$(DB_USER) \
			-e POSTGRES_PASSWORD=$(DB_PASS) \
			-e POSTGRES_DB=$(DB_NAME) \
			-p $(DB_PORT):5432 -d postgres:16
	@echo "Postgres running on port $(DB_PORT)"

# Seed the database (idempotent — re-run is safe if tables exist)
db-seed: db
	@sleep 2
	@docker exec -i $(CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < agent/seed.sql
	@echo "Database seeded"

# Install agent Python deps (creates venv if missing)
agent-install:
	@cd agent && ( [ -d .venv ] || python -m venv .venv ) && \
		. .venv/bin/activate && pip install -q -e .

# Run the agent via FastAPI (port 8123)
agent: agent-install
	@cd agent && . .venv/bin/activate && python main.py

# Create .env.local if missing
.env.local:
	@cp .env.local.example .env.local
	@echo "Created .env.local (agent URL → localhost:8123)"

# Run the Next.js frontend (port 3000)
frontend: .env.local
	npm run dev

# Run everything (agent + frontend). Use: make dev
dev:
	@echo "Starting Postgres..."
	@$(MAKE) db-seed
	@echo "Starting agent & frontend..."
	@$(MAKE) agent & $(MAKE) frontend

# Stop all services
stop:
	@pkill -f "python main.py" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@docker stop $(CONTAINER) 2>/dev/null || true
	@echo "All services stopped"

# Remove container and venv
clean: stop
	@docker rm $(CONTAINER) 2>/dev/null || true
	@rm -rf agent/.venv
	@echo "Cleaned up"
