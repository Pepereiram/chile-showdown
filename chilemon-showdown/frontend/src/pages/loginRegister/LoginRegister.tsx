import React, { useState } from "react";
import type { LoginData } from "../../types/Login";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

type LoginResponse = { username: string };

const LoginRegister: React.FC = () => {
  const [login, setLogin] = useState("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post<LoginResponse>(
        "http://localhost:3001/api/login",
        { username, password },
        { withCredentials: true }
      );

      const csrf = res.headers["x-csrf-token"];
      if (csrf) localStorage.setItem("csrf", csrf);

      localStorage.setItem("user", JSON.stringify({ username: res.data.username }));
      navigate("/home");
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? "Usuario o contraseña incorrectos."
          : "Error de conexión.";
      setError(msg);
    } finally {
      setUsername("");
      setPassword("");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.get<LoginData[]>(
        "http://localhost:3001/api/users",
        { params: { username } }
      );

      const exists = data.some((u) => u.username === username);
      if (exists) {
        setError("El usuario ya existe.");
        return;
      }

      await axios.post("http://localhost:3001/api/users", {
        username,
        password,
      });

      alert("¡Registro exitoso!");
      setLogin("Login");
    } catch {
      setError("Error de conexión.");
    }

    setUsername("");
    setPassword("");
  };


  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          Bienvenido/as a Chilemon Showdown!!
        </Typography>

        <Typography
          variant="h6"
          fontWeight={550}
          sx={{ textAlign: "left", mb: 2 }}
        >
          {login}
        </Typography>

        <Box
          component="form"
          onSubmit={login === "Login" ? handleLogin : handleRegister}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <TextField
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button type="submit" fullWidth variant="contained">
            {login}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Typography sx={{ mt: 3 }}>
          {login === "Register" ? (
            <>
              ¿Ya tienes cuenta?{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.dark",
                  },
                }}
                onClick={() => setLogin("Login")}
              >
                Login
              </Typography>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{" "}
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.dark",
                  },
                }}
                onClick={() => setLogin("Register")}
              >
                Register
              </Typography>
            </>
          )}
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginRegister;
