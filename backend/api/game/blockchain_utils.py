import os
import json
from web3 import Web3
from eth_account import Account
from django.conf import settings

# Load contract ABI
with open('blockchain/abi.json', 'r') as f:
    contract_abi = json.load(f)

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_PROVIDER_URL))

# Initialize contract
contract = w3.eth.contract(
    address=settings.ETHEREUM_CONTRACT_ADDRESS,
    abi=contract_abi
)

def add_score(tournament_id: int, match_id: int, score: int) -> bool:
    """
    Add a score to the blockchain.
    
    Args:
        tournament_id (int): The ID of the tournament
        match_id (int): The ID of the match
        score (int): The score to add
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the nonce
        nonce = w3.eth.get_transaction_count(settings.ETHEREUM_CONTRACT_ADDRESS)
        
        # Build the transaction
        transaction = contract.functions.addScore(
            tournament_id,
            match_id,
            score
        ).build_transaction({
            'chainId': 11155111,  # Sepolia testnet
            'gas': 2000000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        
        # Sign the transaction
        signed_txn = w3.eth.account.sign_transaction(
            transaction,
            private_key=settings.ETHEREUM_PRIVATE_KEY
        )
        
        # Send the transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_receipt.status == 1
        
    except Exception as e:
        print(f"Error adding score to blockchain: {str(e)}")
        return False

def get_scores(tournament_id: int) -> list:
    """
    Get all scores for a tournament from the blockchain.
    
    Args:
        tournament_id (int): The ID of the tournament
        
    Returns:
        list: List of scores for the tournament
    """
    try:
        scores = contract.functions.getScores(tournament_id).call()
        return [
            {
                'tournament_id': score[0],
                'match_id': score[1],
                'score': score[2]
            }
            for score in scores
        ]
    except Exception as e:
        print(f"Error getting scores from blockchain: {str(e)}")
        return [] 