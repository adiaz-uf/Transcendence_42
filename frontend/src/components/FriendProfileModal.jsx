import React, {useState, useEffect} from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import Stat from './Stat';
import api from '../api';
import { ACCESS_TOKEN } from "../constants"; 
import { GETUserMatchesPlayed, GETUserMatchesWon } from '../components/api-consumer/fetch';

const FriendProfileModal = ({ show, handleClose, user }) => {

  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchesWon, setMatchesWon] = useState(0);
  const [matchesLosed, setMatchesLosed] = useState(0);
  const [winRatio, setWinRatio] = useState(0);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (matchesPlayed > 0) {
      const calculatedMatchesLosed = matchesPlayed - matchesWon;
      setMatchesLosed(calculatedMatchesLosed);
      const calculatedWinRatio = matchesWon / matchesPlayed;
      setWinRatio(calculatedWinRatio.toFixed(2));
    } else {
      setWinRatio(0);
    }
  }, [matchesPlayed, matchesWon]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get(`/api/user/list-matches-played/${user}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
        });
        setMatches(response.data.matches);
      } catch (error) {
        console.error("Error fetching matches", error);
      }
    };
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const cumulativeWins = [];
  const cumulativeLosses = [];
  let winCount = 0;
  let lossCount = 0;

  matches.forEach(match => {
    if (match.result === 'won') {
      winCount += 1;
    }
    if (match.result === 'lost') {
      lossCount += 1;
    }

    cumulativeWins.push(winCount);
    cumulativeLosses.push(lossCount);
  });
  const chartData = {
    labels: matches.map((match) => new Date(match.match.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Wins',
        data: cumulativeWins,
        borderColor: 'green',
        backgroundColor: 'green',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Loses',
        data: cumulativeLosses,
        borderColor: 'red',
        backgroundColor: 'red',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const matchesResponse = async () => {
    try {
      const response = await GETUserMatchesPlayed(user)
      setMatchesPlayed(response); 
    } catch (error) {
      console.error("Error fetching matches played", error);
    }
  };
  
  const matchesWonResponse = async () => {
    try {
      const response = await GETUserMatchesWon(user)
      setMatchesWon(response);
    } catch (error) {
      console.error("Error fetching matches won", error);
    }
  };

  useEffect(() => {
    if (user) {
      matchesResponse();
      matchesWonResponse();
    }
  }, [user]);

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="custom-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title>Welcome to {user}'s Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body"
        style={{overflowY: 'auto',  padding: '1.5rem' }}
      >
        <h4 style={{margin:"2em"}}><strong>All time stats</strong></h4>
        <div style={{ width: '100%', maxWidth: '800px', justifyContent:"center", display:"flex"}}>
        <Line data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {legend: {labels: {color: 'white',},},
                tooltip: {backgroundColor: '#222',titleColor: 'white',bodyColor: 'white',},},
              scales: {
                x: {
                  ticks: {color: 'white',},
                  grid: { color: 'rgba(255,255,255,0.1)',},
                },
                y: {
                  ticks: {color: 'white',},
                  grid: {color: 'rgba(255,255,255,0.1)',},
                },
              },
            }}
          />
        </div>
        <div className="stats-container">
          <Stat title={"Matches Played"} value={matchesPlayed} />
          <Stat title={"Wins"} value={matchesWon} />
          <Stat title={"Loses"} value={matchesLosed} />
          <Stat title={"Win Rate"} value={winRatio} />
        </div>
      </Modal.Body>
      <Modal.Footer style={{ border: 'none' }}>
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FriendProfileModal;

