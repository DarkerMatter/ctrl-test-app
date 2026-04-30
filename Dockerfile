FROM node:20-alpine
WORKDIR /app
COPY express-hello/package.json ./
RUN npm install --production
COPY express-hello/server.js ./
EXPOSE 8080
ENTRYPOINT ["node"]
CMD ["server.js"]
