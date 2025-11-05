# HuddleUp

> A turf management and reservation application

## Database Setup Instructions

1. Configure environment variables for the database.

    ```bash
    cp ./database/.env.example ./database/.env
    ```

    Replace the placeholders with the actual values to set up the MySQL database.

2. Configure Docker Compose to set up environment variables.

    ```bash
    cp compose.override.yaml.example compose.override.yaml
    ```

3. Create and run the database container.

    ```bash
    docker compose up -d db
    ```
