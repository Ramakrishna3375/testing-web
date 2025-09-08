import { commonRequest } from "./apiCall";
import { BASE_URL } from "./helper";

//Get All Categories
export const getAllCategories = async () => {
  return await commonRequest("GET", `/api/categories`);
};

//Get All Sub-Categories
export const getAllSubCategories = async () => {
  return await commonRequest("GET", `/api/sub-categories`);
};

//Get All Posted Ads With Status Active
export const getAllActiveAds = async () => {
  return await commonRequest("GET", `/api/post-ads`);
};

//Get Banners
export const getBanners = async () => {
  return await commonRequest("GET", `/api/banners`);
};

//Post New Ad
export const postNewAd = async (adData, token) => {
  return await commonRequest("POST", `/api/post-ads`, adData, {
    Authorization: token,
    // Do NOT set 'Content-Type' here for FormData; let browser handle it
  });
};
