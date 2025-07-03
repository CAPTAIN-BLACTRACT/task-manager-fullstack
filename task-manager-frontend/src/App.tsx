import React,{useEffect, useState} from "react";
import Header from "./components/Header";
import './App.css'
import './components/AuthForm'
import AuthForm from "./components/AuthForm";
import { registerUser,loginUser } from "./api";
import TaskList from "./components/TaskList";

const App: React.FC = () =>{

  const [showRegister,setShowRegister] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{id:string ; username:string}|null>(null);

  useEffect(()=>{
    const storedToken = localStorage.getItem('token');
    if(storedToken){
      setToken(storedToken);
      try{
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        if(decoded && decoded.user){
          setUser(decoded.user);
        }
      } catch(e){
        console.error('failed to decode stored token',e);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
  },[]);

  const handleAuthSuccess = (newToken:string) =>{
      setToken(newToken);
      localStorage.setItem('token',newToken);

      try{

          const decoded = JSON.parse(atob(newToken.split('.')[1]));
          if(decoded && decoded.user){
            setUser(decoded.user);
          }
      }catch(e){
        console.error('failed to decode after auth successs',e);
        setUser(null);
      }
  };

  //handler for registration form submit
  const handleRegisterSubmit = async (username:string, password:string)=>{
    const result = await registerUser(username,password);

    if(result.token){
      handleAuthSuccess(result.token);
    }
    return result;
  };

  //handler for login form submission
  const handleLoginSubmit  = async (username:string , password:string)=>{
    const result = await loginUser(username,password);
    if(result.token){
      handleAuthSuccess(result.token);
    }
    return result;
  };

  //dashboard comps
  /*const Dashboard: React.FC<{user:{id:string,username:string},onLogout: () => void}> = ({user,onLogout}) =>{
    return (
      <div className="dashboard-placeholder">
        <h3>Welcome, {user.username}!</h3>
        <p>This is your dashboard</p>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    );
  };*/

  const handleLogout = () =>{
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return(
    <div className="app-wrapper">
    <Header />
    <main className="main-content">
      {!token ? (
          <div className="auth-section">
            <h2 className="welcome-title">
              Welcome to your Task Manager!
            </h2>
            {}
            <div className="info-box">
              <p className="info-text mb-4">Get started by registering or logging in.</p>
              <p className="info-text-sm"></p>
            
          {showRegister ? (
            <>
            <AuthForm type="register" onSubmit={handleRegisterSubmit} />
            <p className="toggle-auth-mode">
              Already have ann account {' '}
              <button onClick={()=> setShowRegister(false)} className="toggle-button">
                Login
              </button>
            </p>
            </>
          ):(
            <>
            <AuthForm type="login"  onSubmit={handleLoginSubmit} />
            <p className="toggle-auth-mode">
              Dont have any account {' '}
              <button onClick={()=> setShowRegister(true)} className="toggle-button">
                Register
              </button>
            </p>
            </>
          )}
          </div>
        </div>
      ):(
        user && token && (
          <div className="dashboard-container"> {}
          <div className="flex justify-end mb-4">{}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <TaskList userId={user.id} token={token} />
          </div>
        ) 
      )}

    </main>
    </div>
    
  );
};
export default App;