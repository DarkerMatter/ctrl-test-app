FROM node:20-slim
WORKDIR /app
COPY express-hello/server.js ./
EXPOSE 8080
ENTRYPOINT ["node"]
CMD ["server.js"]
