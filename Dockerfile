# stage to install modules
FROM node:18-alpine3.15
WORKDIR /app
COPY package.json package-lock.json ./

# install dependencies
RUN apk update && apk add sqlite
RUN npm ci --prod

COPY . .
CMD ["node", "."]