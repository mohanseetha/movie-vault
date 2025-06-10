import axios from "axios";

export const proxyTMDB = async (req, res) => {
  let subpath = req.params.splat;

  if (Array.isArray(subpath)) {
    subpath = subpath.join("/");
  } else if (typeof subpath !== "string") {
    subpath = "";
  }

  subpath = subpath.replace(/^\/+/, "");

  const params = new URLSearchParams(req.query);
  params.set("api_key", process.env.TMDB_API_KEY);

  const url = `https://api.themoviedb.org/3/${subpath}?${params.toString()}`;

  try {
    const response = await axios.get(url);
    return res.status(response.status).json(response.data);
  } catch (err) {
    return res
      .status(err.response?.status || 500)
      .json({
        error: "Failed to fetch from TMDB",
        details: err.response?.data || err.message,
      });
  }
};
