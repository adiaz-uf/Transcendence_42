import { Row } from 'react-bootstrap';
import NavBar from '../components/Navbar'
import Stat from '../components/Stat';
import '../styles/statspage.css'


// TODO: Get values from DB
function Stats() {
  return (
    <div>
      <NavBar/>
        <div className='stats-body'>
            <h1 className='header'>Your Trascendence Stats</h1>
          <div className='stats-container'>
            <Stat title={"Matches Played"} value={"5"}/>
            <Stat title={"Wins"} value={"4"}/>
            <Stat title={"Loses"} value={"1"}/>
            <Stat title={"Win Rate"} value={"4.0"}/>
          </div>
        </div>
    </div>
    );
}

export default Stats;