FROM oven/bun:1

# System libs required by Remotion's chrome-headless-shell + ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps separately for better layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "server.ts"]
