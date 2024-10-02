commit:
	docker-compose exec -e DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/testdb" app sh -c "npx prisma migrate deploy && npm run test"
	git add .
	git commit -m "$(c)"
	git push

# make commit c="nom commit"

restart:
	docker compose down
	docker compose up --build -d

studio:
	docker-compose exec app sh -c "npx prisma studio --port 5555"

migrate:
	docker-compose exec app sh -c "npx prisma migrate dev --name $(name)"

tests:
	docker-compose exec -e DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/testdb" app sh -c "npx prisma migrate deploy && npm run test"

create-test-db:
	docker-compose exec postgres sh -c "psql -U myuser -d mydb -c 'CREATE DATABASE testdb;'"
	docker-compose exec app sh -c "DATABASE_URL=\postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy"

migrate-test-db:
	docker-compose exec app sh -c "DATABASE_URL=\postgresql://myuser:mypassword@postgres:5432/testdb npx prisma migrate deploy"

