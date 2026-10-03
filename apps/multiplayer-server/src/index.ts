import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "node:http";

const httpServer = createServer();
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer })
});

void gameServer;

const port = Number(process.env.PORT ?? 2567);
httpServer.listen(port, () => {
  console.log(`NEXO REALMS multiplayer server listening on http://localhost:${port}`);
});
