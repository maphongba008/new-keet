## Handling SVG Icons

### Overview

Our project utilizes SVG icons extensively. To manage these icons efficiently and maintain consistency across the application, we've implemented a custom `SvgIcon` component. This component helps in rendering SVG icons using the `react-native-svg` package.

### How to Use the SvgIcon Component

The `SvgIcon` component is designed to be flexible and easy to use with any of the SVG icons included in the `resources` directory of our project. Here’s how you can use this component:

1. **Import the Component**:

   ```typescript
   import SvgIcon, { SvgIconType } from 'component/SvgIcon'
   ```

2. **Use the Component**:
   You can render any icon by specifying its name, color, size, and additional styles. For example:

   ```jsx
   <SvgIcon name="bell" color="#000" width={24} height={24} />
   ```

### Props

The `SvgIcon` component accepts the following props:

- **name** (`SvgIconType`): The name of the icon. This must match one of the keys from our icons export.
- **color** (`ColorValue`): The fill color of the icon. It's optional; if not provided, the icon will use its default color.
- **width**, **height** (`number`): The dimensions of the icon. If not provided, defaults specific to each icon will be used.
- **style** (`ViewStyle`): Additional styling for the icon component. Optional.

### Adding New Icons

To incorporate new icons into the project:

1. **Add the SVG File:**

   - Find the new icon [here](https://www.figma.com/design/YwGky6itTkGbyEBhZkUBhZ/Keet-%7C-Component-Library?node-id=0-1&t=XQSoVOW14VhXcXCi-0)
   - Place the new SVG file into the `src/resources` directory.
   - Ensure the file name is in kebab-case (e.g., `new-icon.svg`).
   - Ensure the SVG's color is not hard-coded, update the fill field to `fill="currentColor"`
   - Can use this [tool](https://www.svgviewer.dev/) to optimize the SVG file size

2. **Update the Icons Import and Export:**

   - Open the `SvgIcon` component file or the respective index file where icons are managed.
   - Import the new SVG file using a kebab-case name for the file and a camelCase name for the import variable:

     ```typescript
     import newIcon from './icons/new-icon.svg'
     ```

   - Add the new import to the exports list to make it available throughout your project:

     ```typescript
     export { newIcon }
     ```

3. **Define Default Dimensions (if applicable):**

   - If the new icon requires specific default dimensions different from the global defaults, define these in the `defaultDimensions` object within the `SvgIcon` component or a similar configuration file:

     ```typescript
     const defaultDimensions = {
       ...otherIconsDimensions,
       newIcon: { width: 24, height: 24 },
     }
     ```

### Example

Here is an example of using the `SvgIcon` component to render an 'admin_icon' with custom settings:

```jsx
<SvgIcon
  name="someIcon"
  color="#fff"
  width={24}
  height={24}
  style={{ margin: 10 }}
/>
```

This approach ensures that all SVG icons in the application are handled consistently and can be easily styled and manipulated across different screens and components.
