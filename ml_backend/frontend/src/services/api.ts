import axios from "axios";

// Using a relative URL or environment variable. Since backend runs on :8000 and Vite on :5173,
// we need to set the baseURL to point to the FastAPI server.
export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1"
});
