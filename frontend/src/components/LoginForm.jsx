import { Button, Form, Spinner, Image } from 'react-bootstrap';
import { useState, useEffect } from "react";
import api from "../api";
import '../styles/login.css'
import { Link, useNavigate, useLocation } from "react-router-dom";
import MessageBox from '../components/MessageBox';
import { GETGameSettings } from './api-consumer/fetch.js';
import { FT_CLIENT_ID } from '../config';

export default function LoginForm({route, navigateTo, onLoginSuccess}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
	const [message, setMessage] = useState(location.state?.message || null);
	const [messageType, setMessageType] = useState(location.state?.type || 'info');

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      if (username === "" || password === "") {
        setMessage("Please enter all the fields");
        setMessageType("info")
        return ;
      }     
      if (requires2FA && code === "") {
        throw new Error("2FA code is required");
      }
      
      const res = await api.post(route, { 
        username,
        password,
        ...(requires2FA && { code })
      });

      if (res.status === 200) {
        try {
          const gameSettings = await GETGameSettings();
          if (gameSettings.error) {
            console.error("Failed to load game settings:", gameSettings.error);
          } else {
            localStorage.setItem("gameSettings", JSON.stringify(gameSettings));
          }

          if (onLoginSuccess) {
            onLoginSuccess(gameSettings);
          } else {
            setMessageType("success");
            setMessage("Ready to play !");
            navigate(navigateTo, {
              state: {
                  message: "Ready to play!",
                  type: "success"
              }
            });
          }
        } catch (error) {
          console.error("Error loading game settings:", error);
          if (onLoginSuccess) {
            onLoginSuccess(null);
          } else {
            navigate(navigateTo, {
              state: {
                message: "Ready to play !",
                type: "success"
              }
            });
          }
        }
      } else if (res.status === 206) {
        setRequires2FA(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || error.message);
			setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handle42Login = () => {
    const clientId = FT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/42/callback`; 

    const state = JSON.stringify({
      random: Math.random().toString(36).substring(2), 
      redirect_uri: redirectUri 
    });
    localStorage.setItem("oauth_state", state);

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=public&state=${state}`;

    window.location.href = authUrl;
  };

  // Gestión del callback desde 42
  useEffect(() => {
      api.get("/api/user/profile/")
        .then(response => {
          const username = response.data.username;
          const userId = response.data.id;
          localStorage.setItem("username", username);
          localStorage.setItem("userId", userId);
          navigate("/", {
            state: {
                message: "Ready to play !",
                type: "success"
            }
          });
        })
        .catch(error => {
          setMessage(`Error with 42 profile qwery`);
          setMessageType("error");
          navigate("/login"); 
        });
  }, [location, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className='login-wrapper'>
      <div className='login-form-container'>
      {message && <MessageBox 
						message={message}
						type={messageType}
						onClose={() => setMessage(null)}/>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id='username' className='mb-4'>
            <Form.Control
              type='text'
              value={username}
              name='Username'
              placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group id='password' className='mb-4'>
            <Form.Control
              type='password'
              value={password}
              name='Password'
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          {requires2FA && (
            <Form.Group id='code' className='mb-4'>
              <Form.Control
                type='text'
                value={code}
                name='Code'
                placeholder='2FA Code'
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>
          )}
          <Button className='w-100' type='submit'>
            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
          <Button
            className='signin42-button w-100 mt-4'
            type='button'
            onClick={handle42Login}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                Sign in with <Image src="42_logo.svg" width={'10%'} />
              </>
            )}
          </Button>
          <div className='login-register-container'>
            <Form.FloatingLabel>Don't have an account?</Form.FloatingLabel>
            <Link to="/register" className='w-50'>
              <Button className='w-100'>
                Register
              </Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
