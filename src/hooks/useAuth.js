import { useState, useEffect } from 'react';
 
export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    let parsedUser = null;

    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
    }

    let userId = parsedUser?.id || parsedUser?._id;
    let userEmail = parsedUser?.email;
    let userName = parsedUser?.name || parsedUser?.firstName;
    let userToken = storedToken;

    // If token exists, try to decode it to get user ID if not already present
    if (userToken) {
      try {
        const base64Url = userToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);

        if (decodedToken.id) userId = decodedToken.id;
        if (decodedToken.email) userEmail = decodedToken.email;
        // If name isn't set, try to get it from token if available (though less common in JWTs)
        if (!userName && decodedToken.name) userName = decodedToken.name;

      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }

    if (userId && userToken) {
      return {
        id: userId,
        name: userName,
        email: userEmail,
        token: userToken,
      };
    } else {
      return null;
    }
  });
 
  useEffect(() => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', user?.token || null);
  }, [user]); // Only re-run when the user object itself changes
 
  return { user, setUser };
};
