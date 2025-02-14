# Run the tests

Run the test with `npm run test` or `npx jest`.

Use `npm run test-watchall` for continuous testing after save file.

Use `npm run test -- --coverage` for check the test coverage.

# **Testing with React native Testing Library (RNTL)**

Follow the docs to check for documentation from [RNTL website](https://callstack.github.io/react-native-testing-library/ 'RNTL website'). We can write Unit test, Component test, Integration test and Snaphot test with this lib. It is built on top of `react-test-renderer` (where component testing, hooks testing ... etc was not possible).

Lib is configured with `jest.config.js`, And there is an setup file `jest-setup.js`. Setup file consist of all the global mocks. Follow the docs from [Jest](https://jestjs.io/docs/mock-functions 'Jest') for more details on mocking the function or module. There are some mocks already added to setup file, Extend as per the requirement.

Can create test under `__tests__` folder. And mocks under `__mocks__` folder. Create only one folder per individual folder structure like, Components have single tests and mocks folder. Can do the same to other folders as per requirement.

#### Mocking the module:

Let's take `component/` folder for example. Here test file is added for testing `Avatar` component. This component shows **Image from expo image** component if uri is provided and just icon if not. Unable to use Expo image for the test so we need to mock it with stock image component instead.

The Image component we use in Avatar component is from `expo-image`

** src/component/Avatar.tsx L10**

    import { Image } from 'expo-image'

So create a mock file named `expo-image.tsx` under `__mocks__ `folder. And export the image with Stock image component from react-native. Like below

**src/component/`__mocks__`/expo-image.tsx**

    import { Image as RNImage } from 'react-native'

    export const Image = (props: any) => <RNImage {...props} />

So, we can mock any module creating the file name with same module name.

#### Mocking the file from project

Let's take component/ folder for example. Here test file is added for testing Avatar component same as above. When component is rendered without any props it will show the fontawesome icon. But in test it cannot be displayed. So we can create a mock file `SvgIcon.tsx` under `__mocks__`

Mocked the SvgIcon like below

**src/component/SvgIcon.tsx**

    import React from 'react'
    import { Text } from 'react-native'

    export const SvgIcon = ({ name }: any) => (
      <Text>icon - {name}</Text>
    )
    export default SvgIcon

Here instead of SvgIcon we mocked it with normal text component from react native. And to make this work we need to add the below line in the test.

    jest.mock('../SvgIcon.tsx')

The above code is added to `src/component/__tests__/Avatar.test.tsx L6`. Can mock the modules and files as per the needs.

Rearding the unit test can refer the matchers from **Jest** docs. And with **RNTL** we have additional matchers which can be referred from RNTL website.
