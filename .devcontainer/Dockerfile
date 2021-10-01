# Using the azure CLI container so we dont have to install that to start
FROM mcr.microsoft.com/azure-cli

RUN apk update
RUN apk add zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"