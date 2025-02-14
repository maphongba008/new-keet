// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
if (typeof Symbol === 'undefined' || !Symbol.asyncIterator) {
  Symbol.asyncIterator = Symbol.for('Symbol.asyncIterator')
}

const logError = console.error
console.error = (...argsParam) => {
  const args = Array.from(argsParam)
  if (args[0].stack) {
    console.log(args[0].stack)
    return
  }
  logError.call(console, args)
}
