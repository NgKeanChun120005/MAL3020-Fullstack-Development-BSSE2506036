FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# --host 0.0.0.0 makes Angular listen on all interfaces inside the container
# While --poll 2000 is needed on Windows so hot reload detects file changes across the Docker volume mount
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]