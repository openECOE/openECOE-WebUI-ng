build:
	docker compose up --build -d --remove-orphans
up:
	docker compose up -d
down:
	docker compose down
show_logs:
	docker compose logs
persistence:
	docker compose -p openecoe-persistence -f .docker/docker-compose.persistence.yml up --build -d --remove-orphans 
build-prod:
	docker compose -p openecoe-api-prod -f .docker/docker-compose.prod.yml up --build -d --remove-orphans