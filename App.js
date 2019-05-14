/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Image,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

//import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';


type Props = {};
export default class App extends Component<Props> {
  state = {
    video: null,
  };

  render() {
    return (
      <View style={styles.container}>
		{this.state.video?
			<Video rate={1.0}
				volume={1.0}
				isMuted={false}
				resizeMode="cover"
				shouldPlay
				isLooping
				source={{ uri: this.state.video }}
				style={{ width: '100%', height: 300 }}
			/>:null
		}
        <Text style={styles.welcome}>Ggif maker</Text>
        <Button
          title="Pick a video file"
          onPress={this.pickVideo}
        />
      </View>
    );
  }

  pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
	 	mediaTypes:'Videos'
    });

    if (!result.cancelled)
      this.setState({ video: result.uri });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
