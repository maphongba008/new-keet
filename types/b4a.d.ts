declare module 'b4a' {
  import type { BufferEncoding } from 'node'

  export function toString(data: Uint8Array, econding?: BufferEncoding): string
  export function from(data: string, econding?: BufferEncoding): Uint8Array
  export function isBuffer(data: any): boolean
  export function concat(
    buffers: Uint8Array[],
    totalLength?: number,
  ): Uint8Array
  export function alloc(size: number): Uint8Array
  export function readUInt32LE(data: Uint8Array, offset?: number): number
}
