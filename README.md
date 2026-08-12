# HuddleUp

> **CS 5200 Fall 2025 Project**
>
> Group: DharRGuptaB

**Link to Demo Video:** [HuddleUp Demo Video](https://www.youtube.com/watch?v=-r71VuMbaeQ)

Here are the technical details and build instructions for the HuddleUp application:

## Technology Stack

### Backend
- **Java 21** - Programming language
  - Download: https://www.oracle.com/java/technologies/downloads/#java21
  - Alternative (OpenJDK): https://adoptium.net/temurin/releases/?version=21
- **Spring Boot 3.5.7** - Web framework
  - Documentation: https://spring.io/projects/spring-boot
  - Managed via Maven dependencies
- **Maven Wrapper** - Build tool and dependency management (included in project)
  - No installation required - the project includes Maven Wrapper scripts (`mvnw` and `mvnw.cmd`)
  - Documentation: https://maven.apache.org/wrapper/
- **MySQL 8.0** - Database
  - Download: https://dev.mysql.com/downloads/mysql/
- **MySQL Workbench** - Database administration and management tool
  - Download: https://dev.mysql.com/downloads/workbench/
  - Documentation: https://dev.mysql.com/doc/workbench/en/

### Frontend
- **Node.js 20.x** - JavaScript runtime
  - Download: https://nodejs.org/en/download
  - LTS version recommended: https://nodejs.org/
- **pnpm** - Package manager to install dependencies
- **React Router 7.9.6** - Web framework
  - Documentation: https://reactrouter.com/
- **TypeScript 5.9.2** - Type-safe JavaScript
  - Documentation: https://www.typescriptlang.org/
- **Vite 7.1.7** - Build tool
  - Documentation: https://vitejs.dev/
- **Tailwind CSS 4.1.13** - CSS framework
  - Documentation: https://tailwindcss.com/

## Prerequisites

Before building and running the application, ensure you have the following software installed:

1. **Java Development Kit (JDK) 21**
   - Download: https://www.oracle.com/java/technologies/downloads/#java21
   - Alternative (OpenJDK): https://adoptium.net/temurin/releases/?version=21
   - Verify installation: `java -version`
   - Expected output should show version 21.x.x

2. **Node.js 20.x**
   - Download: https://nodejs.org/en/download
   - LTS version recommended: https://nodejs.org/
   - Verify installation: `node --version`
   - Expected output should show version 20.x.x

3. **pnpm**
   - Download: https://pnpm.io/installation
   - Verify installation: `pnpm --version`

4. **MySQL Workbench** (for database management)
   - Download: https://dev.mysql.com/downloads/workbench/
   - Installation guide: https://dev.mysql.com/doc/workbench/en/wb-installing.html

5. **MySQL 8.0** (required - must be installed locally)
   - Download: https://dev.mysql.com/downloads/mysql/

## Installation and Setup Instructions

### Step 1: Database Setup

Use MySQL Workbench to set up the database.

1. Open MySQL Workbench and verify MySQL is running:
   - Launch MySQL Workbench
   - Click the "+" icon next to "MySQL Connections" to create a new connection
   - Enter connection details:
     - **Connection Name**: `HuddleUp Local`
     - **Hostname**: `127.0.0.1` or `localhost`
     - **Port**: `3306`
     - **Username**: `root`
   - Click "Test Connection" to verify
   - Click "OK" to save the connection

2. Create the database user:
   - Double-click the connection you just created
   - Enter the root password when prompted
   - In the Query Editor, execute the following SQL:

   ```sql
   CREATE USER IF NOT EXISTS 'huddleup_user'@'localhost' IDENTIFIED BY 'huddleup_password';
   GRANT ALL PRIVILEGES ON huddleup.* TO 'huddleup_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

   - Click the lightning bolt icon (⚡) or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (macOS) to execute
   - Verify success in the Output panel at the bottom

3. **Load MySQL timezone tables** (required for CONVERT_TZ function used in stored procedures):
   
   The application's stored procedures use the `CONVERT_TZ` function which requires MySQL timezone tables to be populated.
   
   **Verify if timezone tables are already populated:**
   - In MySQL Workbench, connect as root (using the connection you created)
   - Open a new Query tab
   - Run this query to check:
   
   ```sql
   SELECT COUNT(*) FROM mysql.time_zone_name;
   ```
   
   - If the count is greater than 0, timezone tables are already populated and you can skip to step 5
   - If the count is 0 or the query fails, proceed with loading timezone tables
   
   **Load timezone tables (if needed):**
   - Windows MySQL installations typically have timezone tables pre-populated. In case they aren't,
     the relevant tables may be downloaded from this link: https://dev.mysql.com/downloads/timezones.html
   - For macOS/Linux, if timezone tables are not populated, you may need to use command-line tools:
     - Open a terminal and run: `mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql`
     - Note: This requires MySQL command-line tools and varies by installation method
   - After attempting to load (or if pre-populated), verify in MySQL Workbench by running:
   
   ```sql
   SELECT COUNT(*) FROM mysql.time_zone_name;
   SELECT COUNT(*) FROM mysql.time_zone;
   ```
   
   - Both queries should return counts greater than 0
   - Test timezone conversion functionality:
   
   ```sql
   SELECT CONVERT_TZ('2024-01-01 12:00:00', 'UTC', 'America/New_York');
   ```
   
   - If this query returns a valid datetime, timezone tables are properly configured
   
   **Important**: If you encounter errors loading timezone tables or CONVERT_TZ returns NULL, the stored procedures using timezone conversion will fail. Ensure timezone tables are populated before proceeding to the next step.

4. Set up and seed the database
   - In MySQL Workbench, open and run the following scripts **in order**:
      1. `database/schema.sql`
      2. `database/functions_turf.sql`
      3. `database/procedures_coupon.sql`
      4. `database/procedures_turf.sql`
      5. `database/procedures_user.sql`
      6. `database/triggers_turf.sql`
      7. `database/seed.sql`


### Step 2: Backend Setup

1. Open a terminal at the project root and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Configure the backend runner script:

   The project includes runner scripts that set environment variables and start the backend:
   - **macOS/Linux**: `run.sh`
   - **Windows**: `run.cmd`

   Open the appropriate script for your operating system and edit the environment variables:

   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=huddleup
   DB_USERNAME=huddleup_user        # Replace with your MySQL username
   DB_PASSWORD=huddleup_password    # Replace with your MySQL password
   JWT_SECRET=Ou9xC5OD5ejCjp0iWESr+ImbSkb1ytqjFun+VKLEuHI=  # Do not change - required for pre-seeded users
   ```

   **Important**: 
   - Replace `DB_USERNAME` and `DB_PASSWORD` with your MySQL credentials (use the user created in Step 1, item 3, or root)
   - **Do not change `JWT_SECRET`** - it must remain as provided to ensure compatibility with pre-seeded user accounts

   **Note**: For macOS/Linux, you may need to make the script executable:
   
   ```bash
   chmod +x run.sh
   ```

3. Build the backend application:

   ```bash
   # Using Maven Wrapper (included in project - no Maven installation required)
   # On macOS/Linux:
   ./mvnw clean install
   
   # On Windows:
   .\mvnw.cmd clean install
   ```

   This will:
   - Download all dependencies (Spring Boot, MySQL connector, JWT libraries, etc.)
   - Compile the Java source code
   - Create a JAR file in `target/huddleup-1.0-SNAPSHOT.jar`

### Step 3: Frontend Setup

1. Open a new terminal at the project root and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Verify Node.js and pnpm is installed:

   ```bash
   node --version  # Should show v20.x.x or higher
   pnpm --version
   ```

3. Install frontend dependencies:

   - Download all dependencies to `node_modules/` directory:
   
      ```bash
      pnpm install
      ```

   Expected output: Should complete without errors. Installation may take 2-5 minutes depending on internet speed.

### Step 4: Running the Application

The application consists of three components that need to be running:
1. MySQL Database
2. Spring Boot Backend API
3. React Router Frontend

#### Start the Database

Ensure MySQL is running by testing the connection in MySQL Workbench:

- Open MySQL Workbench
- Double-click the "HuddleUp Local" connection (or create it following Step 1, item 2 in Database Setup)
- If the connection succeeds, MySQL is running and ready
- If the connection fails, MySQL may need to be started:
  - On **Windows**: Start MySQL from Services panel (services.msc) or use your MySQL installer's service management
  - On **macOS**: Check System Preferences or use your MySQL installation's service control method
  - On **Linux**: Check with your system's service manager (varies by distribution and installation method)

#### Start the Backend

1. Open a new terminal at the project root and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Ensure you've configured the runner script (see Step 2, item 2) with your database credentials

3. Run the Spring Boot application using the runner script:

   ```bash
   # macOS/Linux
   ./run.sh
   ```
   
   ```bash
   # Windows
   .\run.cmd
   ```

4. Wait for the application to start. The backend API will be available at: `http://localhost:8080`

#### Start the Frontend

1. Open a new terminal at the project root and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Start the development server:

   ```bash
   pnpm run dev
   ```

3. Wait for the server to start. The frontend application will be available at: `http://localhost:5173`

## Verifying the Installation

### Database Verification

Using MySQL Workbench:

1. Open MySQL Workbench and connect to your database (the "HuddleUp Local" connection you created)

2. In the Navigator panel on the left, expand the `huddleup` schema

3. Expand the "Tables" node to see all database tables

   You should see tables such as:
   - `app_user`
   - `booking`
   - `coupon`
   - `review`
   - `turf`
   - And other tables defined in the schema

4. **Verify data**:
   - Run a test query to check if data exists:

   ```sql
   SELECT COUNT(*) FROM app_user;
   SELECT COUNT(*) FROM turf;
   ```

   - If dump was imported successfully, these queries should return counts greater than 0

### Backend Verification

The backend is successfully running if:
- You see the message `Started HuddleUpApp in X.XXX seconds` in the terminal where you started the backend
- The backend process is still running (terminal hasn't exited)
- You can test the backend by making a GET request to the turfs endpoint (no authentication required):

```bash
# Test if the backend is responding
curl http://localhost:8080/api/turf

# Or visit in browser: http://localhost:8080/api/turf
```

You should receive a JSON response with a list of turfs (or an empty array `[]` if no turfs are in the database). This confirms the backend is running and can connect to the database.

### Frontend Verification

Open your browser and navigate to: `http://localhost:5173`

You should see the HuddleUp application homepage.

## Testing

For test user accounts and credentials, see [TEST_USERS.md](TEST_USERS.md). This document provides information about pre-seeded test users with varying levels of activity and data, suitable for testing different application features and scenarios.

## Project Structure

```
huddleup/
├── backend/                 # Spring Boot backend application
│   ├── src/
│   │   └── main/
│   │       ├── java/        # Java source code
│   │       └── resources/   # Configuration files
│   ├── target/              # Compiled classes and JAR (generated)
│   ├── pom.xml              # Maven dependencies and configuration
│   ├── mvnw                 # Maven Wrapper (Unix/macOS)
│   ├── mvnw.cmd             # Maven Wrapper (Windows)
│   ├── run.sh               # Backend runner script (Unix/macOS)
│   └── run.cmd              # Backend runner script (Windows)
├── frontend/                # React Router frontend application
│   ├── app/                 # Application source code
│   ├── node_modules/        # pnpm dependencies (generated)
│   ├── package.json         # pnpm dependencies and scripts
│   └── vite.config.ts       # Vite build configuration
├── database/                # Database files
│   └── huddleup_dump.sql    # Complete database dump (schema, data, procedures, functions, triggers)
├── README.md                # This file
└── TEST_USERS.md            # Test user accounts and credentials for testing
```

## Additional Resources

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Router Documentation: https://reactrouter.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- MySQL Workbench Documentation: https://dev.mysql.com/doc/workbench/en/
- MySQL Server Time Zone Support: https://dev.mysql.com/doc/refman/8.4/en/time-zone-support.html
- Maven Documentation: https://maven.apache.org/guides/
- Node.js Documentation: https://nodejs.org/docs/
