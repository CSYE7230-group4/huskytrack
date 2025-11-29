# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Your backend listens on 5000 (adjust if needed)
EXPOSE 5000

CMD ["npm", "start"]
