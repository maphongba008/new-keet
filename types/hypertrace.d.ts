declare module 'hypertrace' {
  export const setTraceFunction: (fn: (params: any) => Promise<void>) => void
}
