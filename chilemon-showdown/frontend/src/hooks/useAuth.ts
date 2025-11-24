import { useEffect, useState } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/login/me", {
      credentials: "include", 
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.loggedIn);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { isLoggedIn, loading };
}
