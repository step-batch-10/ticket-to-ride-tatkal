FROM denoland/deno:2.3.3
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY . .
RUN deno install
CMD ["deno", "task", "dev"]
