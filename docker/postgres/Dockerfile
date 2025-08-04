FROM postgres:15

# Environment variables for initialization
ENV POSTGRES_DB=chatbot_db
ENV POSTGRES_USER=username
ENV POSTGRES_PASSWORD=password

# Add any additional initialization scripts if needed
COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Set the default command
CMD ["postgres"]
