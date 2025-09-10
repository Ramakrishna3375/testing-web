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