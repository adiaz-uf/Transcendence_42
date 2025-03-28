import { Button, Form, Spinner, Image } from 'react-bootstrap';
import { useState, useEffect } from "react";
import api from "../api";
import LoginForm from "../components/LoginForm"
import '../styles/login.css'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MessageBox from '../components/MessageBox';

export default function Login({route}) {
    return (
		<div className='login-container'>
			<h1 className='header'>Welcome to pong!</h1>
			<h1 className='header'>Login to play</h1>
			<LoginForm route={route} navigateTo="/"></LoginForm>
		</div>
    );
}
