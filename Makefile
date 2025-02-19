all:
	@docker compose -f ./docker-compose.yml up -d --build
	
down:
	@docker compose -f ./docker-compose.yml down

clean:
	@rm -rf node_modules
	@docker stop $$(docker ps -qa)
	@docker rm $$(docker ps -qa)
	@docker rmi $$(docker images -qa)
	@docker volume rm $$(docker volume ls -q)
	@docker network rm network
