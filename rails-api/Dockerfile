FROM ruby:3.2-slim

# Instalar dependencias del sistema incluyendo libyaml
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev libyaml-dev nodejs npm && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar Gemfile primero para cachear dependencias
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "rm -f tmp/pids/server.pid && rails server -b 0.0.0.0"]
