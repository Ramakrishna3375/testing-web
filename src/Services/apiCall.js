import axios from "axios";

export const commonRequest = async (methods, url, body, header) => {
  const authToken = sessionStorage.getItem("token");
  // =================== (BASE HEADERS: IF CALLER PROVIDED HEADERS, CLONE; ELSE DEFAULT TO JSON FOR NON-FORMDATA)===================
  const headers = header ? { ...header } : { "Content-Type": body instanceof FormData ? undefined : "application/json" };
  // =================== (IF BODY IS FORMDATA, LET THE BROWSER SET CONTENT-TYPE)===================
  if (body instanceof FormData && headers["Content-Type"]) delete headers["Content-Type"];
  // =================== (IF CALLER DID NOT PASS AUTHORIZATION, ATTACH FROM SESSIONSTORAGE)===================
  if (!headers.Authorization && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  // =================== (IF CALLER DID PASS AUTHORIZATION WITHOUT BEARER, NORMALIZE IT)===================
  if (headers.Authorization && typeof headers.Authorization === 'string' && !headers.Authorization.toLowerCase().startsWith('bearer ')) {
    headers.Authorization = `Bearer ${headers.Authorization}`;
  }
  // =================== (REMOVE UNDEFINED HEADERS TO AVOID SENDING "AUTHORIZATION: UNDEFINED")===================
  Object.keys(headers).forEach((k) => headers[k] === undefined && delete headers[k]);

  let config = {
    method: methods,
    url,
    headers,
    data: body,
  };
  return axios(config)
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });
};