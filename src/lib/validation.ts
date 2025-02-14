export const validateProfileName = (name: string) => {
  const value = name.trim()
  if (value.length === 0) {
    return null
  }
  return value
}

export const isString = (value: any) =>
  typeof value === 'string' && value.length > 0

export const toObject = <T extends object>(value: any): T | undefined => {
  if (!isString(value)) {
    return
  }
  try {
    return JSON.parse(value!)
  } catch {}
}
