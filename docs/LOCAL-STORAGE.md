# Local Storage Management

This project uses a structured approach to manage local storage, ensuring maintainability, readability, and scalability.

## How to Add or Edit Local Storage Items

### Adding a New Storage Item

1. **Define a Key**:

   - Add a new key in `storageConstants.ts`.

   ```typescript
   export const Keys = {
     // Existing keys...
     NEW_STORAGE_KEY: 'NEW_STORAGE_KEY',
   }
   ```

2. **Create or Update a Feature Module**:

   - If the feature already exists, update the corresponding file in the features folder.
   - If it's a new feature, create a new file in the features folder.

   ```typescript
   // storageNewFeature.ts
   import { localStorage } from './storage'
   import { Keys } from './storageConstants'
   import { jsonParse, jsonStringify } from './storageUtils'

   /**
   - Sets the new feature data in storage.
   - @param data - The data to set.
   */
   export const setNewFeatureData = (data: any): void => {
     localStorage.setItem(Keys.NEW_STORAGE_KEY, jsonStringify(data))
   }

   /**
   - Retrieves the new feature data from storage.
   - @returns The data, or undefined if not found.
   */
   export const getNewFeatureData = (): any | undefined => {
     return jsonParse<any>(localStorage.getItem(Keys.NEW_STORAGE_KEY))
   }
   ```

3. **Export the New Functions**:

   - Ensure the new functions are exported in `index.ts`.

   ```typescript
   // Existing exports...
   export * from './storageNewFeature' // New export
   ```

### Utility Functions

- **jsonParse**: Safely parses a JSON string.
- **jsonStringify**: Safely stringifies a JSON object.
- **safeSetItem**: Safely sets an item in storage.
- **safeGetItem**: Safely gets an item from storage.
- **safeRemoveItem**: Safely removes an item from storage.
- **safeClear**: Safely clears all items from storage.
- **safeSetBooleanItem**: Safely sets a boolean item in storage.
- **safeGetBooleanItem**: Safely gets a boolean item from storage.

### Best Practices

- **Modularity**: Keep related storage operations in their respective feature modules.
- **Consistency**: Use the utility functions provided to ensure consistent handling of storage operations.
- **Documentation**: Ensure all storage functions are well-documented with TSDoc comments.
