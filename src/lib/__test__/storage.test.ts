import {
  jsonParse,
  jsonStringify,
  parseBoolean,
  parseNumber,
  safeClear,
  safeGetBooleanItem,
  safeGetItem,
  safeRemoveItem,
  safeSetBooleanItem,
  safeSetItem,
  storage,
} from 'lib/localStorage/storageUtils'

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => {
      return {
        getString: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clearAll: jest.fn(),
      }
    }),
  }
})

const mockedStorage = storage as jest.Mocked<typeof storage>

describe('Storage Utils Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('safeGetItem', () => {
    it('should return the correct value when storage.getString succeeds', () => {
      mockedStorage.getString.mockReturnValue('testValue')
      const result = safeGetItem('testKey')
      expect(result).toBe('testValue')
    })

    it('should return undefined and log an error when storage.getString throws', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockedStorage.getString.mockImplementation(() => {
        throw new Error('Test error')
      })
      const result = safeGetItem('testKey')
      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith(
        'LocalStorage Error:',
        expect.any(Error),
      )
    })
  })

  describe('safeSetItem', () => {
    it('should call storage.set with the correct key and value', () => {
      safeSetItem('testKey', 'testValue')
      expect(mockedStorage.set).toHaveBeenCalledWith('testKey', 'testValue')
    })

    it('should log an error when storage.set throws', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockedStorage.set.mockImplementation(() => {
        throw new Error('Test error')
      })
      safeSetItem('testKey', 'testValue')
      expect(consoleSpy).toHaveBeenCalledWith(
        'LocalStorage Error:',
        expect.any(Error),
      )
    })
  })

  describe('safeRemoveItem', () => {
    it('should call storage.delete with the correct key', () => {
      safeRemoveItem('testKey')
      expect(mockedStorage.delete).toHaveBeenCalledWith('testKey')
    })

    it('should log an error when storage.delete throws', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockedStorage.delete.mockImplementation(() => {
        throw new Error('Test error')
      })
      safeRemoveItem('testKey')
      expect(consoleSpy).toHaveBeenCalledWith(
        'LocalStorage Error:',
        expect.any(Error),
      )
    })
  })

  describe('safeClear', () => {
    it('should call storage.clearAll', () => {
      safeClear()
      expect(mockedStorage.clearAll).toHaveBeenCalled()
    })

    it('should log an error when storage.clearAll throws', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockedStorage.clearAll.mockImplementation(() => {
        throw new Error('Test error')
      })
      safeClear()
      expect(consoleSpy).toHaveBeenCalledWith(
        'LocalStorage Error:',
        expect.any(Error),
      )
    })
  })

  describe('safeSetBooleanItem & safeGetBooleanItem', () => {
    it('should store and retrieve boolean values correctly', () => {
      safeSetBooleanItem('testBoolKey', true)
      expect(mockedStorage.set).toHaveBeenCalledWith('testBoolKey', 'true')

      mockedStorage.getString.mockReturnValue('true')
      const result = safeGetBooleanItem('testBoolKey')
      expect(result).toBe(true)
    })

    it('should return undefined when boolean value is not found', () => {
      mockedStorage.getString.mockReturnValue(undefined)
      const result = safeGetBooleanItem('testBoolKey')
      expect(result).toBeUndefined()
    })
  })

  describe('jsonStringify & jsonParse', () => {
    it('should correctly stringify and parse JSON', () => {
      const data = { key: 'value' }
      const jsonString = jsonStringify(data)
      expect(jsonString).toBe(JSON.stringify(data))

      const parsedData = jsonParse(jsonString)
      expect(parsedData).toEqual(data)
    })

    it('should return undefined when parsing undefined', () => {
      const result = jsonParse(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('parseNumber', () => {
    it('should parse a valid number string', () => {
      expect(parseNumber('42')).toBe(42)
    })

    it('should return default value when parsing fails', () => {
      expect(parseNumber(undefined, 10)).toBe(10)
    })
  })

  describe('parseBoolean', () => {
    it('should parse a valid boolean string', () => {
      expect(parseBoolean('true')).toBe(true)
      expect(parseBoolean('false')).toBe(false)
    })

    it('should return default value when parsing fails', () => {
      expect(parseBoolean(undefined, true)).toBe(true)
    })
  })
})
