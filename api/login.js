import { handleAuthRequest } from "../server/authPlugin.js";

export default function login(req, res) {
  return handleAuthRequest(req, res, process.env);
}
