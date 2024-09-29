commit:
	npm run test
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


