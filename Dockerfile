FROM node:16

# https://stackoverflow.com/questions/20635472/using-the-run-instruction-in-a-dockerfile-with-source-does-not-work
SHELL ["/bin/bash", "-c"]

# https://learn.microsoft.com/en-us/dotnet/core/install/linux-debian#debian-11
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb

RUN apt update

RUN apt install -y default-jre default-jdk
RUN java -version

RUN apt install -y maven
RUN mvn --version

# https://gradle.org/install/#with-a-package-manager
RUN apt install -y zip
RUN curl -s "https://get.sdkman.io" | bash
RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk version
RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk install gradle 7.6
RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && gradle --version

# https://learn.microsoft.com/en-us/dotnet/core/install/linux-debian#install-the-sdk
RUN apt install -y dotnet-sdk-6.0
RUN dotnet --version

RUN node --version

# Python is already install, but need python3-venv on debian to create venvs
RUN apt install -y python3-venv
RUN python3 --version

RUN --mount=type=secret,id=universal_test_runner_registry,target=universal_test_runner_registry \
  --mount=type=secret,id=universal_test_runner_auth_token,target=universal_test_runner_auth_token \
  npm install -g @sentinel-internal/universal-test-runner \
  --registry=https://$(cat universal_test_runner_registry) \
  --//$(cat universal_test_runner_registry):_authToken=$(cat universal_test_runner_auth_token)
RUN run-tests --version

WORKDIR universal-test-runner

COPY tests-integ/test-projects .

RUN cd jest && bash setup.sh && RUN_TESTS=run-tests bash run.sh
RUN cd pytest && bash setup.sh && RUN_TESTS=run-tests bash run.sh
RUN cd maven && bash setup.sh && RUN_TESTS=run-tests bash run.sh
RUN cd gradle && source "$HOME/.sdkman/bin/sdkman-init.sh" && bash setup.sh && RUN_TESTS=run-tests bash run.sh
RUN cd dotnet && bash setup.sh && RUN_TESTS=run-tests bash run.sh
