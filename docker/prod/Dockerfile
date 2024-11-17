FROM node:18-alpine as builder


WORKDIR /app


COPY package*.json ./

# install package.lock.json
RUN npm ci 

# left dot - our file system, right image file system
COPY . .



RUN npm run build





FROM node:18-alpine as production


ENV NODE_ENV=production


WORKDIR /app


COPY package*.json ./


# do not run any third party script
RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5555

CMD ["node","src/server.js"]