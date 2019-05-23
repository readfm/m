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
      images: [],
      path: FileSystem.documentDirectory + 'latest.gif'
    };

    this.list();
  }
  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
        <Button
          style={{width: "100%", borderRadius: 24, fontSize: 32}}
          title={this.state.process || "+"}
          onPress={this.pickVideo}
        />
        {this.state.images?this.state.images.map((image_src, i) => {
          return <Ggif
            key={image_src}
            src={image_src}
          />
        }):this.state.image?
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
      </View>
    );
  }

  list(){
    var dir = FileSystem.documentDirectory;
    FileSystem.readDirectoryAsync(dir).then(r => {
      console.log(r);

      var images = [];
      (r || []).forEach(fname => {
        //FileSystem.getInfoAsync().then(r => {});

        let path = dir + fname;
        
        if(fname.indexOf('.gif')+1)
          //FileSystem.getInfoAsync().then(r => {
            images.push(path);
          //});
      });

      this.setState({images});

      console.log(images);
    });
  }

  pickVideo = async () => {
    /*
    let dir = 'file:///data/user/0/com.gg/cache/frames_test/';
    let cmd = '-i file:///data/user/0/com.gg/files/latest.gif -y '+dir+'%d.png';
    console.log(cmd);
    FileSystem.makeDirectoryAsync(dir).then(r => {
      RNFFmpeg.execute(cmd).then(r => {
        console.log(r);
      }).catch(er => {
        console.log(er);
      });
    });
    return;
    */

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'All'
    });
    
    if(result.cancelled) return;
    console.log(result.type+' URI: '+ result.uri);

    if(result.type == 'video'){
      this.setState({video: result.uri});
      this.convert(result.uri);
    }

    if(result.type == 'image'){
        var images = this.state.images;
        images.unshift(result.uri);
        this.setState({
          images,
          process: null
        });
    }
  }

  convert(uri){
    this.setState({
      process: 'Converting video to gif'
    });

    var path = FileSystem.documentDirectory + this.makeid(4) + '.gif';
    RNFFmpeg.execute('-i '+uri+" -vf scale=320:180 -y -r 8 "+path)
    .then(result => {
      console.log("FFmpeg process exited with rc " + result.rc);

      if(result.rc == 0){
        var images = this.state.images;
        images.unshift(path);
        this.setState({
          images,
          process: null
        });

        //FileSystem.documentDirectory + 'latest.gif'
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
  },

  image: {
    width: "100%",
    margin: '4 0'
  }
});
