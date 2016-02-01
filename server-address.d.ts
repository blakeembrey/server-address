import { Server, ServerRequest, ServerResponse } from 'http'

declare function serverAddress (handler: Server | serverAddress.Handler): serverAddress.ServerAddress;

declare namespace serverAddress {
  export type Handler = (req: ServerRequest, res: ServerResponse) => any;

  export interface ServerAddress {
    url (path?: string): string;
    listen (cb?: (err: Error) => any): ServerAddress;
    close (cb?: (err: Error) => any): ServerAddress;
  }
}

export = serverAddress;
