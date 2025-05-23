# Transcendence - Full-Stack Project

Transcendence is a web application designed for managing and playing online matches, with an integrated scoring system based on blockchain. This Full-Stack project includes a backend, a frontend, and infrastructure configuration for deploying the application using Docker.

## Project Structure

The project is organized into the following main directories:

- **backend/**: Contains the server logic, including the API and database configuration.
- **blockchain/**: Includes smart contracts for managing scores on the blockchain.
- **frontend/**: Contains the user interface developed in React.
- **nginx/**: Configuration for the reverse proxy server.
- **pgadmin/**: Configuration for managing the PostgreSQL database.
- **certs/**: SSL certificates for HTTPS configuration.

## Key Features

### Backend
- Built with Django, a powerful Python web framework.
- RESTful API for managing users, matches, and scores.
- WebSocket integration for real-time updates during matches.
- JWT Authentication and authorization management.
- PostgreSQL database for reliable and scalable data storage.
- Integration with the 42 API for user authentication.
  
### Frontend
- User interface developed in React and Bootstrap with reusable components.
- Rresponsive design, ensuring compatibility with devices of all sizes (desktop, tablet, and mobile).
- Works seamlessly across all modern web browsers.
- Provides a user-friendly and intuitive interface for easy navigation and interaction.
- Real-time match management system.
- Modals for displaying available matches and handling errors.

### Blockchain
- Solidity smart contract for securely and decentralized score storage.

### Infrastructure
- Docker containers for each system component.
- Nginx configured as a reverse proxy.
- PostgreSQL database with PgAdmin for administration.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- Node.js and pnpm for frontend development.
- Python and pip for backend development.

## Installation and Setup

1. Clone this repository:
 ```bash
 git clone https://github.com/adiaz-uf/Transcendence_42.git
 cd Transcendence_42
 ```
2. Configure environment variables:

Copy the .env.example file to .env and adjust the values according to your environment.

3. Build and start the containers:
```bash
make init
```
4. Access the application:

Frontend: https://localhost or https://transcendence.local

You can access the PostgreSQL database using PgAdmin. The PgAdmin interface is available at [http://localhost:5050](http://localhost:5050). Use the credentials configured in your `.env` file to log in and manage the database.

![Login](https://github.com/user-attachments/assets/dd356021-9a81-4835-98f8-7c2628a23cb6)
![Register](https://github.com/user-attachments/assets/50643b35-f072-4b71-8a4c-1ae40dc1d275)
![Tournament](https://github.com/user-attachments/assets/ca859642-0c4d-40b2-95f0-46f1bff3143a)
![Game](https://github.com/user-attachments/assets/28c982c7-97f9-4f08-a06c-6c74a4e1f44f)
![Tournament Winner](https://github.com/user-attachments/assets/9d493ed9-8996-4c08-abaf-92e210a713a9)
![Profile](https://github.com/user-attachments/assets/0f50bddb-9200-4325-81f4-07e8f77724f5)
![Friends](https://github.com/user-attachments/assets/c6f6551b-286f-438d-abed-f17a41c80b4b)
