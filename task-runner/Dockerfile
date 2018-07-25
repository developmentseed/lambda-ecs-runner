FROM node:8.11-slim

USER root
COPY . /home/service

RUN groupadd -r service -g 433
RUN useradd -u 431 -r -g service -d /home/service -s /sbin/nologin -c "Docker image user" service
RUN chown -R service:service /home/service

WORKDIR /home/service

RUN yarn

ENTRYPOINT [ "node", "--harmony", "bin/cli.js" ]

