from django.test import TestCase
from rest_framework.test import APIClient
from .views import send_score_to_blockchain
from .models import Tournament, Match, UserProfile, Team
# Create your tests here.

class BlockchainTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserProfile.objects.create(username="testuser")
        self.tournament = Tournament.objects.create(name="Test Tournament", owner=self.user)
        self.team1 = Team.objects.create(name="Team 1", player1_id=self.user)
        self.team2 = Team.objects.create(name="Team 2", player1_id=self.user)
        self.match = Match.objects.create(
            tournament_id=self.tournament,
            team_left=self.team1,
            team_right=self.team2,
            left_score=5,
            right_score=3
        )

    def test_send_score_to_blockchain(self):
        try:
            send_score_to_blockchain(self.tournament.id, self.match.left_score, self.match.right_score)
            self.assertTrue(True) 
        except Exception as e:
            self.fail(f"Blockchain send failed: {str(e)}")

    def test_get_tournament_scores(self):
        response = self.client.get(f"/tournament/{self.tournament.id}/scores/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("scores", response.data)
