# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]