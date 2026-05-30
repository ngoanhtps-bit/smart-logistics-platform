import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "tracking", cors: { origin: "*" } })
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection() {
    /* client connected */
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(@MessageBody() code: string, @ConnectedSocket() client: Socket) {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      const progress = Math.min(0.98, 0.1 + tick * 0.03);
      client.emit("location_updated", {
        code,
        latitude: 16 + tick * 0.15,
        longitude: 107 + tick * 0.12,
        speed: 58 + (tick % 6),
        progress,
        updatedAt: new Date().toISOString()
      });
    }, 15_000);

    client.on("disconnect", () => clearInterval(interval));
    return { subscribed: code };
  }
}
