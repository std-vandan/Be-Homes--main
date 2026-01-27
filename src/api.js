import axios from "axios";

const API_BASE_URL = "http://localhost:5000/"; // Replace with your backend URL

export const createProject = async (projectData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}project/create`, projectData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
