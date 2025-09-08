import axios from "axios";

// Auto-fetch token and store in sessionStorage if not already present
(async function fetchAndStoreToken() {
  if (!sessionStorage.getItem("token")) {
    try {
      const response = await axios.post("/api/users/login", {
        username: "badmaash basha",
        password: "Khader@Basha123"
      });
      const token = response?.data?.token;
      if (token) {
        sessionStorage.setItem("token", token);
        console.log("Token stored in sessionStorage.");
      } else {
        console.warn("Token not received in response.");
      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
    }
  }
})();

export const commonRequest = async (methods, url, body, header) => {
  const authToken = sessionStorage.getItem("token");
  let headers = header ? header : {};
  if (body instanceof FormData) {
    headers.Authorization = authToken ? `Bearer ${authToken}` : undefined;
    // Do NOT set Content-Type for FormData
  } else {
    headers["Content-Type"] = "application/json";
    headers.Authorization = authToken ? `Bearer ${authToken}` : undefined;
  }
  let config = {
    method: methods,
    url,
    headers,
    data: body,
  };
console.log("Token from sessionStorage:", authToken);
  return axios(config)
    .then((data) => data)
    .catch((error) => error);
};