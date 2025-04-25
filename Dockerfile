FROM denoland/deno:2.2
WORKDIR /app
COPY deno* /app
RUN deno install
COPY . .
CMD ["deno", "task", "dev"]
