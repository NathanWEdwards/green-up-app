// @flow
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import NewMessageScreen from "../screens/new-message-screen";
import MessagesSummariesScreen from "../screens/message-summaries-screen";
import MessageDetailsScreen from "../screens/message-details-screen";

const MessagesStack = createStackNavigator({
    Messages: { screen: MessagesSummariesScreen },
    NewMessage: { screen: NewMessageScreen },
    MessageDetails: { screen: MessageDetailsScreen }
});

export default createAppContainer<any, any>(MessagesStack);
