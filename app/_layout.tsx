import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';

export default function Layout() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}