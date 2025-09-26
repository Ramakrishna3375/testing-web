import { useState, useEffect } from 'react';
 
export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    } else {
      return {
        id: "68b5bbfb6f2667c93ae1cb27",
        name: "Dummy User",
        email: "dummy@example.com",
        token: null,
      };
    }
  });
 
  useEffect(() => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', user.token);
  }, [user]); // Only re-run when the user object itself changes
 
  return { user };
};
