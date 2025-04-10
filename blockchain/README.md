# Blockchain Integration

This module implements blockchain storage for tournament scores using Ethereum.

## Setup

1. Deploy the smart contract:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

2. Update environment variables:
- ETHEREUM_PROVIDER_URL: Your Infura project URL
- ETHEREUM_PRIVATE_KEY: Your wallet private key
- ETHEREUM_CONTRACT_ADDRESS: Deployed contract address

## Usage

Scores are automatically stored in the blockchain when:
- A match score is updated
- The match is part of a tournament

Scores can be retrieved using the `/api/tournament/<tournament_id>/blockchain-scores/` endpoint.

## Smart Contract

The `TournamentScores.sol` contract provides:
- Score storage with player address, scores, and timestamp
- Owner-only score addition
- Public score retrieval by tournament ID

## Backend Integration

The backend uses Web3.py to interact with the Ethereum blockchain:
- `blockchain_utils.py`: Core blockchain interaction functions
- `views.py`: API endpoint for retrieving tournament scores
- Automatic score recording when match scores are updated 