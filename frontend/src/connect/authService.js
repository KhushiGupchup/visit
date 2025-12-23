import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // adjust port if needed

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    // Forward the error message
    throw error.response ? error.response.data : { msg: "Server Error" };
  }
};
