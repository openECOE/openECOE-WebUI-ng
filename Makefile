build:
	docker compose up --build -d --remove-orphans
up:
	docker compose up -d
down:
	docker compose down
	docker compose -p openecoe-backend -f docker-compose.dev.api.yml down
show_logs:
	docker compose logs
backend:
	docker compose -p openecoe-backend -f docker-compose.dev.api.yml up -d --remove-orphans