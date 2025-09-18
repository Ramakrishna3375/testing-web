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
export const getChatHistory = async (token) => {
  return await commonRequest("GET", `${BASE_URL}/api/chats/history`, null, { Authorization: `Bearer ${token}` });
};

//Get Notifications
export const getNotifications = async (token) => {
  console.log('🔄 API: Getting notifications with token:', token ? 'Present' : 'Missing');
  const result = await commonRequest("GET", `${BASE_URL}/api/notifications`, null, { Authorization: `Bearer ${token}` });
  console.log('🔄 API: getNotifications result:', result);
  return result;
};

//Mark Notifications as Read
export const markNotificationsAsRead = async (notificationIds, token) => {
  const requestBody = { notificationIds };
  console.log('API: Sending mark as read request:', {
    url: `${BASE_URL}/api/notifications/mark-read`,
    body: requestBody,
    token: token ? 'Present' : 'Missing'
  });
  return await commonRequest("PUT", `${BASE_URL}/api/notifications/mark-read`, requestBody, { Authorization: `Bearer ${token}` });
};

//Reply to Ad Availability Request
export const replyToAdAvailability = async (requestId, adId, isAvailable, message, token) => {
  const requestBody = {
    requestId,
    adId,
    isAvailable,
    message
  };
  console.log('API: Sending ad availability reply:', {
    url: `${BASE_URL}/api/users/reply-availability`,
    body: requestBody,
    token: token ? 'Present' : 'Missing'
  });
  return await commonRequest("POST", `${BASE_URL}/api/users/reply-availability`, requestBody, { Authorization: `Bearer ${token}` });
};

//Send Chat Message
export const sendChatMessage = async (receiverId, adId, message, token) => {
  const requestBody = {
    receiverId,
    adId,
    message
  };
  console.log('API: Sending chat message:', {
    body: requestBody,
    token: token ? 'Present' : 'Missing'
  });
  return await commonRequest("POST", `${BASE_URL}/api/chats/send`, requestBody, { Authorization: `Bearer ${token}` });
};

//Get Chat Users
export const getChatUsers = async (token) => {
  console.log('API: Getting chat users with token:', token ? 'Present' : 'Missing');
  return await commonRequest("GET", `${BASE_URL}/api/chats/users`, null, { Authorization: `Bearer ${token}` });
};

//Get Chat Messages by Ad ID
export const getChatMessagesByAdId = async (adId, token) => {
  console.log('API: Getting chat messages for ad ID:', adId, 'with token:', token ? 'Present' : 'Missing');
  return await commonRequest("GET", `${BASE_URL}/api/chats/messages/${adId}`, null, { Authorization: `Bearer ${token}` });
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
  return await commonRequest(
    "POST",
    `https://stage-api.localmart.app:8443/auth/completeUserProfile`,
    userData,
    token ? { Authorization: token } : undefined
  );
};

//Get All Countries
export const getAllCountries = async () => {
  return await commonRequest("GET", `https://stage-api.localmart.app:8443/locations/countries`);
};

// Get states by country id
export const getStatesByCountryId = async (countryId) => {
  const encoded = encodeURIComponent(countryId);
  return await commonRequest(
    "GET",
    `https://stage-api.localmart.app:8443/locations/countries/${encoded}/states`
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
    token ? { Authorization: token } : undefined
  );
};

// Update authenticated user details
export const updateUserDetails = async (payload, token) => {
  return await commonRequest(
    "PUT",
    `https://stage-api.localmart.app:8443/auth/update-details`,
    payload,
    token ? { Authorization: token } : undefined
  );
};


// Upload profile picture (FormData field name: 'file')
export const uploadProfilePicture = async (formData, token) => {
  return await commonRequest(
    "POST",
    `https://stage-api.localmart.app:8443/auth/upload-profile-picture`,
    formData,
    token ? { Authorization: token } : undefined
  );
};


