import http from "http";
import { getApp } from "./app/app";

const PORT = process.env.PORT || 3000;

const server = http.createServer(await getApp());

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
