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

import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';

import * as FileSystem from 'expo-file-system';
import Canvas from 'react-native-canvas';

//import Ggif from './src/components/Ggif.js';


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
        <Canvas ref={this.handleCanvas}/>
        <Button
          title="Pick a video file"
          onPress={this.pickVideo}
        />
        {this.state.image?
          <Image
            style={{width: 300, height: 200}}
            source={{uri: this.state.image}}
          />:null
        }
      </View>
    );
  }

  handleCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  }

  pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
	 	mediaTypes:'Videos'
    });

    console.log(result);

    if(result.cancelled) return;

    this.setState({ video: result.uri });
    console.log('URI: '+ result.uri);
    this.convert(result.uri);
  }

  convert(uri){
    var path = FileSystem.documentDirectory + '' + this.makeid(5)+'.gif';
    RNFFmpeg.execute('-i '+uri+" -vf scale=320:180 "+path)
    .then(result => {
      console.log(path);

      console.log("FFmpeg process exited with rc " + result.rc);
      
      this.setState({ image: path});
      
      /*
      if(result.rc){
        RNFFmpeg.execute('convert -loop 0 '+dir+'ffout*.png '+dir+'output.gif', ' ')
        .then(result => {
          console.log(result);
          this.setState({ image: dir+'output.gif'});
        });
      }
      */
    });
  }

  makeid(length) {
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
