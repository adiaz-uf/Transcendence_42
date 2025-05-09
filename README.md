# Transcendence

Transcendence is a web application designed for managing and playing online matches, with an integrated scoring system based on blockchain. This project includes a backend, a frontend, and infrastructure configuration for deploying the application using Docker.

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
- RESTful API for managing users, matches, and scores.
- WebSocket integration for real-time updates during matches.
- Authentication and authorization management.

### Frontend
- User interface developed in React with reusable components.
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
   git clone https://github.com/adiaz-uf/transcendence.git
   cd transcendence
   ```
2. Configure environment variables:

Copy the .env.example file to .env and adjust the values according to your environment.

3. Build and start the containers:
   ```bash
   make init
   ```
4. Access the application:

Frontend: https://localhost or https://transcendence.local
