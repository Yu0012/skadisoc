const isLocalhost = window.location.hostname === "localhost";

const config = {
  API_BASE: isLocalhost
    ? "http://localhost:5000/api"
    : "https://us-central1-skadisocmed-954f4.cloudfunctions.net/api"
};

export default config;
