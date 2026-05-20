/**
 * Route entry only — implementations live in src/screens so Expo Router's
 * app/ require.context does not pull react-native-maps into the web bundle.
 */
export { default } from '../src/screens/Map';
