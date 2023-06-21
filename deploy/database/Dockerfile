FROM postgres:13.4

# Copy the SQL script to create the user table
COPY deploy/database/init-user-table.sql /docker-entrypoint-initdb.d/

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=adaptive_storyfinder

# Customize the PostgreSQL configuration, if needed
# COPY postgres-custom.conf /etc/postgresql/postgresql.conf

# Expose the PostgreSQL default port (5432)
EXPOSE 5432
