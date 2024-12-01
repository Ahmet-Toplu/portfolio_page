# Official MySQL image
FROM mysql:latest

# Environment variables for MySQL configuration
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=portfolio
ENV MYSQL_USER=portfolio
ENV MYSQL_PASSWORD=portfolio

# Copy any custom SQL files to the Docker image
# These SQL files can be used to initialize the database with tables or seed data
COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose the MySQL port
EXPOSE 3306

# Default command to run MySQL server
CMD ["mysqld"]