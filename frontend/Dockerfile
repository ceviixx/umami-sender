FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NEXT_PUBLIC_API_URL=/api

RUN npm run build

CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]
