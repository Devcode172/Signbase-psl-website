import { handleAuthRequest } from "../server/authPlugin.js";

export default function signup(req, res) {
  return handleAuthRequest(req, res, process.env);
}
