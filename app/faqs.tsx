import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';


import { defaultStyles } from '@/styles/default-styles';

export default function TabTwoScreen() {
  return (
    <View style={styles.frame}>
      <ScrollView style={styles.scroll}>
        <View style={styles.infoBlockContainer as ViewStyle}>
          <Text style={{ textAlign: "left", fontSize: 16, marginBottom: 5 }}>
            Alice did not quite know what to say to this: so she helped herself to{"\n"}
            some tea and bread-and-butter, and then turned to the Dormouse, and{"\n"}
            repeated her question. “Why did they live at the bottom of a well?”{"\n"}


            The Dormouse again took a minute or two to think about it, and then{"\n"}
            said, “It was a treacle-well.”{"\n"}

            “There's no such thing!” Alice was beginning very angrily, but the{"\n"}
            Hatter and the March Hare went “Sh! sh!” and the Dormouse sulkily{"\n"}
            remarked, “If you can't be civil, you'd better finish the story for{"\n"}
            yourself.”{"\n"}

            “No, please go on!” Alice said very humbly; “I won't interrupt again. I{"\n"}
            dare say there may be _one_.”{"\n"}

            “One, indeed!” said the Dormouse indignantly. However, he consented to{"\n"}
            go on. “And so these three little sisters—they were learning to draw,{"\n"}
            you know—”{"\n"}

            “What did they draw?” said Alice, quite forgetting her promise.
            I didn't really think about the environment until it actually impacted me.{"\n"}
            I was driving to the city with my dad when I noticed the amount of trash on the side of the road{"\n"}
            The city smelt, the ground was dirty, and it was because no one was taking care of the environment.{"\n"}
            In Vermont, there's very few instances where I feel that way.{"\n"}
            There's no smell besides the fresh air smell.{"\n"}
            The ground isn't littered with trash, it's littered with plants.{"\n"}
            If we don't take care of our environment, our children will have to do it.{"\n"}
            By then, it'll be way worse.{"\n"}
          </Text>
        </View>
      </ScrollView>
    </View >
  );
}

const pageStyles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

const styles = StyleSheet.create({ ...defaultStyles, ...pageStyles } as any);
