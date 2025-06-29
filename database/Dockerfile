# MySQL Database Docker Configuration
FROM mysql:8.0

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD=rootpass
ENV MYSQL_DATABASE=task_management_app
ENV MYSQL_CHARSET=utf8mb4
ENV MYSQL_COLLATION=utf8mb4_unicode_ci

# Copy custom MySQL configuration with correct permissions
COPY my.cnf /etc/mysql/conf.d/
RUN chmod 644 /etc/mysql/conf.d/my.cnf

# Copy initialization scripts
COPY init/ /docker-entrypoint-initdb.d/

# Create mysql user for application
ENV MYSQL_USER=app_user
ENV MYSQL_PASSWORD=app_password

# Expose MySQL port
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1

# Use official MySQL entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mysqld"]