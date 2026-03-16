FROM php:8.3-fpm-alpine

# Install system deps
RUN apk add --no-cache \
    git curl libpng-dev libzip-dev libxml2-dev \
    oniguruma-dev imagemagick-dev $PHPIZE_DEPS

# PHP extensions
RUN docker-php-ext-install \
    pdo pdo_mysql mbstring zip exif pcntl bcmath gd xml opcache

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# App
WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage

EXPOSE 9000

CMD ["php-fpm"]
