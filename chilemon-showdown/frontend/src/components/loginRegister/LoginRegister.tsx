import React, {useState} from "react"; 
//import type { LoginData } from "../../types/Login";
import './LoginRegister.css';

type Props = {
    onLogin?: (username: string, password: string) => void;
}

const LoginRegister: React.FC<Props> = ({ onLogin }) => {
    const [login, setLogin] = useState("Register");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  return (
     <div className='container'>
        <div className="header">
            <div className="text">{login}</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
            <div className="input">
                <input type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </div>
            <div className="input">
                <input type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
        </div>
        <form
            onSubmit={(e) => {
            e.preventDefault();
            if (onLogin) {
                onLogin(username, password);
            }
            }}
        >
            <button type="submit" className="button">
            {login}
            </button>
        </form>
        <div className="toggle" onClick={() => {
            setLogin(login === "Register" ? "Login" : "Register");
        }}>
            {login === "Register" ? (
                <>Already have an account? <span className="highlight">Login</span></>
            ) : (
                <>Don't have an account? <span className="highlight">Register</span></>
            )}
        </div>

    </div>
  );
}
  


export default LoginRegister;
