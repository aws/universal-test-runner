#!/usr/bin/env bash

set -e

[[ -z "$ECR_REGISTRY" ]] && echo "No ECR_REGISTRY provided!" && exit 1

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $ECR_REGISTRY

docker tag universal-test-runner:latest $ECR_REGISTRY:latest
docker push $ECR_REGISTRY:latest
