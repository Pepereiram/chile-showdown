import { useState, useEffect } from "react";
import { login, logout, getUserData, register } from "../services/auth";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Para saber si estamos cargando la información

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await getUserData(); // Solicita los datos del usuario desde la API
          setUser(userData);
          setIsAuthenticated(true);
        }
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const token = await login(username, password); // Llamada a la API de login
      const userData = await getUserData();
      setUser(userData);
      setIsAuthenticated(true);
      // opcional: guardar usuario en localStorage para acceso rápido
      try {
        localStorage.setItem("user", JSON.stringify(userData));
      } catch {}
      return token;
    } catch (error) {
      throw new Error("Error en el login");
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      await register(username, password);
      return true;
    } catch (error: any) {
      throw new Error(error?.message || "Error en el registro");
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, loading, handleLogin, handleLogout, handleRegister };
};

export default useAuth;
export { useAuth };
