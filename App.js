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
//import Canvas from 'react-native-canvas';

import Ggif from './src/components/Ggif.js';

export default class App extends Component{
  constructor(){
    super();
    this.state = {
      video: null,
      path: FileSystem.documentDirectory + 'latest.gif'
    };

    var re = FileSystem.getInfoAsync(this.state.path).then(r => {
      console.log(r);
      if(r.exists)
        this.setState({image: r.uri});
    });
  }

  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
    		{this.state.image?
          <Ggif
            style={{width: "100%"}}
            src={this.state.image}
          />:this.state.video?
      			<Video rate={1.0}
      				volume={1.0}
      				isMuted={false}
      				resizeMode="cover"
      				shouldPlay
      				isLooping
      				source={{ uri: this.state.video }}
      				style={{ width: '100%', height: 300 }}
      			/>:
            <Text style={styles.welcome}>Ggif maker</Text>
    		}
        <Button
          style={{width: "100%"}}
          title={this.state.process || "Pick a video file"}
          onPress={this.pickVideo}
        />
      </View>
    );
  }

  pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:'Videos'
    });

    if(result.cancelled) return;
    console.log(result.type+' URI: '+ result.uri);

    if(result.type == 'video'){
      this.setState({video: result.uri});
      this.convert(result.uri);
    }

    if(result.type == 'image'){
      this.setState({image: result.uri});
    }
  }

  convert(uri){
    this.setState({
      process: 'Converting video to gif'
    });
    RNFFmpeg.execute('-i '+uri+" -vf scale=320:180 -y "+this.state.path)
    .then(result => {
      console.log("FFmpeg process exited with rc " + result.rc);

      if(result.rc == 0){
        this.setState({
          image: this.state.path,
          process: null
        });
      }
      
      
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    width: '100%'
  }
});
