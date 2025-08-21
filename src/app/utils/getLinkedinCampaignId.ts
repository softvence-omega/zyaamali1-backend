import axios, { AxiosInstance } from "axios";

export const liAxios = (accessToken?: string): AxiosInstance => {
  const instance = axios.create({ baseURL: "https://api.linkedin.com" });
  instance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers["X-Restli-Protocol-Version"] = "2.0.0";
    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;

    return config;
  });
  return instance;
};
