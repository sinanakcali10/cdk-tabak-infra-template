.DEFAULT_GOAL := deploy
.PHONY: $(shell grep -v '^#' Makefile | sed -n 's/^ *\([a-zA-Z0-9_-]*\):.*/\1/p')

hello:
	@echo "AWS CDK Deployment for Dev, Test, and Prod"

synth:
	NODE_ENV=dev \
	cdk synth

diff:
	NODE_ENV=dev \
	cdk diff --exclusively "dev*" --strict

deploy:
	NODE_ENV=dev \
	cdk deploy --exclusively "dev*" --require-approval never

test:
	NODE_ENV=test \
	cdk diff --exclusively "test*" --strict
	@read -p "Are you sure you want to deploy to test? [y/N]: " confirm; \
	if [[ $$confirm == [yY] ]]; then \
		NODE_ENV=test \
		cdk deploy --exclusively "test*" --require-approval never; \
	else \
		echo "Deployment canceled."; \
	fi

prod:
	NODE_ENV=prod \
	cdk diff --exclusively "main*" --strict
	@read -p "Are you sure you want to deploy to production? [y/N]: " confirm; \
	if [[ $$confirm == [yY] ]]; then \
		NODE_ENV=prod \
		cdk deploy --exclusively "main*" --require-approval never; \
	else \
		echo "Deployment canceled."; \
	fi

%.layer:
	@if [ -d "src/resources/layers/$*" ]; then \
		cd src/resources/layers/$*; \
		rm -rf python; \
		pip install -r requirements.txt --target python; \
	else \
		echo "Layer does not exist, check spelling."; \
	fi
