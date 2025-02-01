import App from '../pages/App'
import Login from "../pages/Login"
import Register from '../pages/Register'
import Stats from '../pages/Statspage'
import Alert from '../components/Alert'
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function RouterSwitch() {
      return (
        <BrowserRouter>
            <Routes>
                <Route path ='/' element ={<Login/>}/>
                <Route path ='/register' element ={<Register/>}/>
                <Route path ='/app' element ={<App/>}/>
                <Route path ='/login' element ={<Login/>}/>
                <Route path ='/stats' element ={<Stats/>}/>
                <Route path ='/alert' element ={<Alert/>}/>
            </Routes>
        </BrowserRouter>
);
}