import axios from "axios";

const mailerlite = axios.create({
  baseURL:
    "https://connect.mailerlite.com/api",

  headers: {
    Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,

    "Content-Type":
      "application/json",
  },
});

export default mailerlite;