declare module 'tiny-buffer-rpc' {
  class RPC {
    constructor(callback: (data: any) => void)

    recv(data: any): void
  }

  export = RPC
}
