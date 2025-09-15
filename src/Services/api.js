import { commonRequest } from "./apiCall";
import { BASE_URL } from "./helper";

//Get All Categories
export const getAllCategories = async () => {
  return await commonRequest("GET", `${BASE_URL}/api/categories`);
};

//Get All Sub-Categories
export const getAllSubCategories = async () => {
  return await commonRequest("GET", `${BASE_URL}/api/sub-categories`);
};

//Get All Posted Ads With Status Active
export const getAllActiveAds = async () => {
  return await commonRequest("GET", `${BASE_URL}/api/post-ads`);
};

//Get Banners
export const getBanners = async () => {
  return await commonRequest("GET", `${BASE_URL}/api/banners`);
};

//Post New Ad
export const postNewAd = async (adData, token) => {
  return await commonRequest("POST", `${BASE_URL}/api/post-ads`, adData, { Authorization: token });
};


//Search Ads by Title
export const searchAdsByTitle = async (title) => {
  const encodedTitle = encodeURIComponent(title);
  return await commonRequest("GET", `${BASE_URL}/api/post-ads/${encodedTitle}`);
};

//Get Chat History
export const getChatHistory = async (userId, token) => {
  return await commonRequest("GET", `${BASE_URL}/api/chat/History/${userId}`, null, { Authorization: token });
};

//User Login
export const userLogin = async (email, password) => {
  return await commonRequest("POST", `https://stage-api.localmart.app:8443/auth/authenticate`, { email, password });
};

//Register OTP with Email
export const registerOtpWithEmail = async (email) => {
  return await commonRequest("POST", `https://stage-api.localmart.app:8443/auth/get-verification-otp`, { email });
};

//Verify OTP with Email
export const verifyOtpWithEmail = async (email, otp) => {
  return await commonRequest("POST", `https://stage-api.localmart.app:8443/auth/verify-account`, { email, otp });
};

//Register User Details
export const registerUserDetails = async (userData, token) => {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
  return await commonRequest(
    "POST",
    `https://stage-api.localmart.app:8443/auth/completeUserProfile`,
    userData,
    headers
  );
};

//Search Cities by Name
export const searchCitiesByName = async (cityName) => {
  const encodedCity = encodeURIComponent(cityName);
  return await commonRequest(
    "GET",
    `https://stage-api.localmart.app:8443/locations/cities?searchKey=${encodedCity}`
  );
};

//Get Cities by State Id
export const getCitiesByStateId = async (stateId) => {
  const encodedStateId = encodeURIComponent(stateId);
  return await commonRequest(
    "GET",
    `https://stage-api.localmart.app:8443/locations/states/${encodedStateId}/cities`
  );
};

// Get authenticated user details (requires Bearer token)
export const getUserDetails = async (token) => {
  return await commonRequest(
    "GET",
    `https://stage-api.localmart.app:8443/auth/user-details`,
    null,
    { Authorization: `Bearer ${token}` }
  );
};

// Update authenticated user details
export const updateUserDetails = async (payload, token) => {
  return await commonRequest(
    "PUT",
    `https://stage-api.localmart.app:8443/auth/update-details`,
    payload,
    { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
  );
};
