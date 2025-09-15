import axios from "axios";

export const commonRequest = async (methods, url, body, header) => {
  const authToken = sessionStorage.getItem("token");
  // Base headers: if caller provided headers, clone; else default to JSON for non-FormData
  const headers = header ? { ...header } : { "Content-Type": body instanceof FormData ? undefined : "application/json" };
  // If body is FormData, let the browser set Content-Type
  if (body instanceof FormData && headers["Content-Type"]) delete headers["Content-Type"];
  // If caller did NOT pass Authorization, attach from sessionStorage
  if (!headers.Authorization && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  // If caller DID pass Authorization without Bearer, normalize it
  if (headers.Authorization && typeof headers.Authorization === 'string' && !headers.Authorization.toLowerCase().startsWith('bearer ')) {
    headers.Authorization = `Bearer ${headers.Authorization}`;
  }
  // Remove undefined headers to avoid sending "Authorization: undefined"
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