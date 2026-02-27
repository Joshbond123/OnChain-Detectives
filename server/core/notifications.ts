import type { Response } from "express";

type SSEvent = { type: string; payload: unknown; at: string };

class NotificationHub {
  private clients = new Set<Response>();

  addClient(res: Response) {
    this.clients.add(res);
  }

  removeClient(res: Response) {
    this.clients.delete(res);
  }

  emit(type: string, payload: unknown) {
    const event: SSEvent = { type, payload, at: new Date().toISOString() };
    const line = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) {
      client.write(line);
    }
  }
}

export const notifications = new NotificationHub();
