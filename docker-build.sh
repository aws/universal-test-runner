#!/usr/bin/env bash

set -e

ENDPOINT_FILE=$(mktemp)
TOKEN_FILE=$(mktemp)

[[ -z "$DOMAIN" ]] && echo "No DOMAIN provided!" && exit 1
[[ -z "$DOMAIN_OWNER" ]] && echo "No DOMAIN_OWNER provided!" && exit 1
[[ -z "$REPOSITORY" ]] && echo "No REPOSITORY provided!" && exit 1
[[ -z "$ECR_REGISTRY" ]] && echo "No ECR_REGISTRY provided!" && exit 1

aws codeartifact get-repository-endpoint --region us-west-2 --domain $DOMAIN --domain-owner $DOMAIN_OWNER --repository $REPOSITORY --format npm --output text | sed 's/https:\/\///' > $ENDPOINT_FILE

aws codeartifact get-authorization-token --region us-west-2 --domain $DOMAIN  --domain-owner $DOMAIN_OWNER --query authorizationToken --output text > $TOKEN_FILE

DOCKER_BUILDKIT=1 docker build -t universal-test-runner . \
  --secret id=universal_test_runner_registry,src=$ENDPOINT_FILE \
  --secret id=universal_test_runner_auth_token,src=$TOKEN_FILE

rm $ENDPOINT_FILE
rm $TOKEN_FILE

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $ECR_REGISTRY

docker tag universal-test-runner:latest $ECR_REGISTRY:latest
docker push $ECR_REGISTRY:latest
