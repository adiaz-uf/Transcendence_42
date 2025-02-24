import { Image } from 'react-bootstrap';
import NavBar from '../components/Navbar'
import '../styles/App.css'

function Home() {
  return (
    <div>
      <NavBar/>
        <div className='app-body'>
          <div className='pong-container'>
            <Image src="ping-pong-table.jpg" width={'100%'}></Image>
          </div>
        </div>
    </div>
  );
}

export default Home;
