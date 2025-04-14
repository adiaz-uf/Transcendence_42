from web3 import Web3
from django.conf import settings
import json
import logging
import os

logger = logging.getLogger(__name__)

# Load contract ABI
# Try multiple paths to find the ABI file
abi_paths = [
    os.path.join(settings.BASE_DIR, 'blockchain', 'abi.json'),
    os.path.join('/app', 'blockchain', 'abi.json'),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'blockchain', 'abi.json')
]

abi_file_found = False
for abi_path in abi_paths:
    if os.path.exists(abi_path):
        try:
            with open(abi_path, 'r') as f:
                contract_abi = json.load(f)['abi']
                abi_file_found = True
                logger.info(f"Successfully loaded ABI from {abi_path}")
                break
        except Exception as e:
            logger.error(f"Error loading ABI from {abi_path}: {str(e)}")

if not abi_file_found:
    logger.error("Could not find ABI file in any of the expected locations")
    raise FileNotFoundError("Could not find blockchain ABI file")

# Initialize Web3 for blockchain
w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_PROVIDER_URL))

# Load contract
contract = w3.eth.contract(
    address=Web3.to_checksum_address(settings.ETHEREUM_CONTRACT_ADDRESS),
    abi=contract_abi
)

def send_score_to_blockchain(tournament_id: int, score_left: int, score_right: int) -> bool:
    """
    Send a tournament match score to the blockchain.
    
    Args:
        tournament_id (int): The tournament ID (already converted to integer)
        score_left (int): Left player's score
        score_right (int): Right player's score
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        account = w3.eth.account.from_key(settings.ETHEREUM_PRIVATE_KEY)
        
        # Get current gas price and add 10% to ensure transaction goes through
        gas_price = int(w3.eth.gas_price * 2.0)
        
        # Build transaction
        transaction = contract.functions.addScore(
            tournament_id,
            score_left,
            score_right
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 2000000,
            'gasPrice': gas_price
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, settings.ETHEREUM_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for transaction receipt with timeout
        try:
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            if receipt.status == 1:
                logger.info(f"Score added to blockchain: {tx_hash.hex()}")
                return True
            else:
                logger.error(f"Transaction failed: {tx_hash.hex()}")
                return False
        except Exception as e:
            logger.error(f"Error waiting for transaction receipt: {str(e)}")
            return False
            
    except Exception as e:
        logger.error(f"Blockchain error: {str(e)}")
        return False

def get_tournament_scores(tournament_id: int) -> list:
    """
    Get all scores for a tournament from the blockchain.
    
    Args:
        tournament_id (int): The tournament ID (already converted to integer)
        
    Returns:
        list: List of scores for the tournament
    """
    try:
        scores = contract.functions.getScores(tournament_id).call()
        return [
            {
                "player": score[0],
                "scoreLeft": score[1],
                "scoreRight": score[2],
                "timestamp": score[3]
            }
            for score in scores
        ]
    except Exception as e:
        logger.error(f"Error getting scores from blockchain: {str(e)}")
        return [] 