import React, {Component} from 'react';
//import Canvas from 'react-native-canvas';


import { Video, Audio } from 'expo-av';


import {GifReader} from '../libs/omggif.js';
import {atob, btoa} from '../libs/base64.js';
import {
  Image as Img,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Txt,
  TouchableOpacity,
  View,
} from 'react-native';

import Svg,{
    Circle,
    Ellipse,
    G,
    Text,
    TSpan,
    TextPath,
    Path,
    Polygon,
    Polyline,
    Line,
    Rect,
    Use,
    Image,
    Symbol,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    ClipPath,
    Pattern,
    Mask,
} from 'react-native-svg';

import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';

import * as FileSystem from 'expo-file-system';

import Sound from 'react-native-sound';


export default class Ggif extends Component{
	constructor(props){
		super(props);

		this.state = {
			video: null,
			speed: 0,
			fade: 0,
			taps: 0,
			frames: [],
			activeFrame: 0
		};

		this.timeouts = [];
		this.frames = [];
		this.fade = 0;

		console.log('construct');
		this.preload();
	}

	render(){
		//return <Svg height={this.state.g?this.state.g.width:'260'} width={this.state.g?this.state.g.height:'100%'}>

		/*
		return <View>{frame?<Img
          style={{width: 300, height: 200}}
          source={{uri: frame.path}}
        />:null}</View>;
		*/
		

		return <TouchableOpacity activeOpacity = { .5 } onPress={(ev) => this.tap(ev)}>
			<Img
				style={{width: 320, height: 250}}
				ref={c => this.img = c}
				key={'tap_0'+this.state.taps}
        		source={{uri: this.props.src}}
        	/>
        </TouchableOpacity>;
	}

	tap = async () => {
		console.log('tap');
		if(this.state.sound){
			try {
				await this.state.sound.setVolumeAsync(1);
				await this.state.sound.setPositionAsync(0);
				this.state.sound.replayAsync().then(r => {
					console.log('baaam', r);
					this.setState({taps: this.state.taps + 1});
				});
			}
			catch (error){
				console.error(error);
			}
		}
	}

	preload(){
		//this.sound = new Sound(this.props.src);
		//this.load();
		//return;
		console.log(this.props.src);
		FileSystem.getInfoAsync(this.props.src, {md5: true}).then(file => {
			console.log(file);
			this.setState({file});
			this.load();


			return;
			this.extractFrames().then(() => {
				//this.load();
			});
		});
	}

  	load(){
  		console.log('load');
  		if(this.state.loading) return;

  		this.setState({loading: true});
  		
  		var file = this.state.file;
  		console.log(file);
  		FileSystem.readAsStringAsync(file.uri, {
  			encoding: FileSystem.EncodingType.Base64
  		}).then(r => {
  			console.log('Downloaded: '+ this.props.src);

  			let buf = this.convertDataURIToBinary(r);

  			console.log('Conloaded: ');
  			let g = this.g = new GifReader(buf);

  			console.log(g);

  			var frames = [];

  			this.extractAudio();

  			/*
  			for (i = 0; i < g.numFrames(); i++){
  				frames[i] = g.frameInfo(i);
  				frames[i].path = FileSystem.cacheDirectory + 'frames_'+file.md5 + '/' + i + '.png';
  			}

  			console.log('Frames ready');

  			this.setState({
  				frames,
  				dir: FileSystem.cacheDirectory + 'frames_'+file.md5
  			});
  			*/

  			return;
			if(!this.g) return;
			
			t.resize();

			this.frame(0);

			//t.extract();

  			this.setState({downloaded: true});
  		});
	}

	extractFrames(){
		var dir = FileSystem.cacheDirectory+'frames_'+this.state.file.md5;
			path = dir + '/%d.png';

		console.log(path);
		return new Promise((ok, no) => {
			console.log('About to read '+dir);
			FileSystem.getInfoAsync(dir).then(r => {
				if(r.exists){
					FileSystem.readDirectoryAsync(dir).then(ok);
				}
				else FileSystem.makeDirectoryAsync(dir).then(r => {
					RNFFmpeg.execute('-i '+this.props.src+' -y '+path).then(r => {
						(!r.rc)?FileSystem.readDirectoryAsync(dir).then(ok):no();
					}).catch(er => {
						no();
					});
				});
			});
		});
	}

	convertDataURIToBinary(dataURI){
		var BASE64_MARKER = ';base64,';
		var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
		var base64 = dataURI//.substring(base64Index);
		var raw = atob(base64);
		var rawLength = raw.length;
		var array = new Uint8Array(new ArrayBuffer(rawLength));

		for(i = 0; i < rawLength; i++) {
			array[i] = raw.charCodeAt(i);
		}
		return array;
	}

	resize(){
		this.props.width = this.g.width;
		this.canvas.height = this.g.height;
	}

	play(from){
		var t = this;
		var time = 0;
		if(!from) from = 0;

		t.clearTimeouts();

		this.frames.map(frame => frame.setNativeProps({opacity: 0}));

		this.state.frames.forEach((frame, i) => {
			var to = setTimeout(() => {
				console.log(i);
				//(i?this.frames[i-1]:this.frames[this.state.frames.length-1]).setNativeProps({opacity: 0});i
				
				this.frames[i].setNativeProps({opacity: 1});
			}, time);
			t.timeouts.push(to);
			var delay = frame.delay * 10 / t.speed;
			time += (time >= from)?delay:1;
		});

		if(t.audio){
			t.audio.playbackRate = t.speed;
			t.audio.currentTime = from/10;
			t.audio.play();
		}
	}

	frame(i){
		//console.log(this.g.numFrames());

		console.log('frame'+i);
		
		this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).then(pixels => {
			/*
			const data = pixels.data;
			const length = Object.keys(data).length;
			for(let i = 0; i < length; i += 4) {
			  data[i] += 100;
			  data[i + 1] += 100;
			  data[i + 2] += 100;
			}
			*/


			console.log('getImageData yaa');
			var arr = [234,436,46,43,43,46,46,56,47,65,7,45,84,8,68,86,65,457,648,58,6,68,58,68,45,86,45,8,35,74,6,83];
			pixels.data = Uint8ClampedArray.from(arr)

			// const tmp = new ImageData(pixels.data, 8, 1); // Or Uint8ClampedArray.from(data) here
			this.ctx.putImageData(this.canvas, arr, 4, i*4).then(r => {
				console.log(r);
			});
			console.log('putImageData yaa');

			/*
			console.log(pixels);
			var ar = pixels.data;
			pixels.data = Uint8ClampedArray(ar);
			this.g.decodeAndBlitFrameBGRA(i, pixels.data);
			*/
			//this.ctx.putImageData(pixels, 0, 0);

			//const tmp = new ImageData(this.ctx.canvas);
			//this.ctx.putImageData.apply(this.ctx, [tmp, 0, 0]);     
		});
	}

	save(){
		canvas.toDataURL('image/jpeg', 1.0)
        .then((data) => {
            data = data.substring(1);
            data = data.slice(0, -1);

            if (data.indexOf('data:image/jpeg;base64,') > -1) {
                // Removing "data:image/jpeg;base64," for saving into file as base64 data
                data = data.substring(23);
            }

            RNFetchBlob.fs.writeFile("/storage/emulated/0/Download/atar.png", data, 'base64')
                .then((data) => {
                    // Image data saved and has 200x4 pixels width and 300x2 pixels height
                })
        })
    }

	pause(){
		this.audio.pause();
		this.clearTimeouts();
	}

	clearTimeouts(){
		this.timeouts.forEach(function(to){
			clearTimeout(to);
		});
		this.timeouts = [];
	}

	extract(){
		var g = this.g;

		var extC = g.extensions[0xfe];
		if(extC && extC.length){
			var c = extC[0];
			var bufC = g.buf.subarray(c.start+1, c.start+1 + c.sizes[0]);
			this.comment = ab2str(bufC);
		}

		var ext = g.extensions[240];
		if(ext && ext.length){
			var c = ext[0];
			this.segments = ab2str(g.buf.subarray(c.start+1, c.start+1 + c.sizes[0]));
		}

		var ext = g.extensions[241];
		if(ext && ext.length){
			var c = ext[0];
			this.timings = ab2str(g.buf.subarray(c.start+1, c.start+1 + c.sizes[0]));
		}

		var ext = g.extensions[243];
		if(ext && ext.length){
			var c = ext[0];
			this.audioFormat = ab2str(g.buf.subarray(c.start+1, c.start+1 + c.sizes[0]));
		}
		else
			this.audioFormat = 'ogg';
	}

	extractAudio = async () => {
		var t = this;
		var soundBuf = t.g.buf.subarray(t.g.p);
		if(soundBuf.length){
			var mime = 'audio/ogg' + ";base64";

			console.log(mime);
			let sound64base = btoa(String.fromCharCode(...soundBuf));
			
			var sound = new Audio.Sound({
				initialStatus: {
					isLooping: true
				}
			});

			this.setState({sound});

			try {
				await sound.loadAsync({
					uri: "data:audio/mpeg;base64,"+sound64base
				});
				await sound.setIsLoopingAsync(true);

		    	await sound.setOnPlaybackStatusUpdate(ev => {
				    if(ev.volume <= 0.07) return sound.stopAsync();

				    if(ev.didJustFinish){
				    	console.log('Just finished: ', ev);
						sound.setVolumeAsync(ev.volume / 2);
				    }
				}, false);

			} catch (error){
				console.error(error);
			}
		}

		return sound;
	}
};
