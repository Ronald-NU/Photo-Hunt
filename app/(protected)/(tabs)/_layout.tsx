import BottomTabNavigator from '@/components/BottomTabNavigator';
import { UserProvider } from '@/components/UserContext';

export default function TabsLayout() {
  return (
    <UserProvider>
    <BottomTabNavigator />
    </UserProvider>
  );
}