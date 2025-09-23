import React, {useState} from "react"; 
import type { LoginData } from "../../types/Login";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './LoginRegister.css';


const LoginRegister: React.FC = ({}) => {
    const [login, setLogin] = useState("Login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.get<LoginData[]>(
        "http://localhost:3001/users",
        { params: { username, password } }
      );
      const user = data.find(u => u.username === username && u.password === password);
      if (user) {
        // Aquí podrías guardar el usuario en el estado global o redirigir
        setError("");
        navigate("/home")
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("Error de conexión.");
    }
    setUsername("");
    setPassword("");
  };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
        const { data } = await axios.get<LoginData[]>("http://localhost:3001/users", { params: { username } });
        const exists = data.some(u => u.username === username);
        if (exists) {
            setError("El usuario ya existe.");
            return;
        }

        await axios.post("http://localhost:3001/users", { username, password });
        alert("¡Registro exitoso!");
        setLogin("Login");
        } catch {
        setError("Error de conexión.");
        }
        setUsername("");
        setPassword("");
    };
  return (
    <div className='container'>
    <h1 className="title">
      Bienvenido/as a Chilemon Showdown!!
    </h1>
      <div className="header">
        <div className="text">{login}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <form onSubmit={login === "Login" ? handleLogin : handleRegister}>
        <button type="submit" className="button">
          {login}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      <div className="toggle" onClick={() => setLogin(login === "Register" ? "Login" : "Register")}>
        {login === "Register" ? (
          <>¿Ya tienes cuenta? <span className="highlight">Login</span></>
        ) : (
          <>¿No tienes cuenta? <span className="highlight">Register</span></>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
