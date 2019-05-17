import React, {Component} from 'react';
import Canvas from 'react-native-canvas';

import {GifReader} from '../libs/omggif.js';
import {atob, btoa} from '../libs/base64.js';

import * as FileSystem from 'expo-file-system';

export default class Ggif extends Component{
	state = {
		video: null,
		speed: 0,
		fade: 0
	};

	constructor(){
		super();

		this.timeouts = [];
		this.frames = [];
		this.fade = 0;

	}

	render(){
		return <Canvas ref={this.handleCanvas}/>;
	}


	handleCanvas = (canvas) => {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.ctx.fillStyle = 'orange';
		this.ctx.fillRect(0, 0, 300, 80);

	    this.ctx.fillStyle = 'red';
	    this.ctx.arc(5, 5, 49, 0, Math.PI * 2, true);
	    this.ctx.fill();

		if(!this.state.downloaded)
			this.download();
	}

  	download(){
  		FileSystem.readAsStringAsync(this.props.source, {
  			encoding: FileSystem.EncodingType.Base64
  		}).then(r => {
  			    //this.frame(0);
  			console.log('Downloaded: '+ this.props.source);
  			let buf = this.convertDataURIToBinary(r);
			var g = this.g = new GifReader(buf);
			//console.log(g);
			if(!this.g) return;
			
			//t.resize();

			this.frame(0);

			//t.extract();

  			this.setState({downloaded: true});
  		});

  		return;

		Pix.download(id, function(file){
			var buf = file.data;
			if(!buf) return reject();

			var g = this.g = new GifReader(buf);
				
			if(!this.g) return;

			this.frame(0);

			this.extract();
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
		this.canvas.width = this.g.width;
		this.canvas.height = this.g.height;
	}

	play(from){
		var t = this;
		var time = 0;
		if(!from) from = 0;

		t.clearTimeouts();
		for(var i = 0; i < this.g.numFrames(); i++){
			(function(i){
				var frame = t.g.frameInfo(i);
				var to = setTimeout(function(){
					t.frame(i);
	    			//	if(t.g.numFrames() == i+1) t.play(0);
				}, time);
				t.timeouts.push(to);
				var delay = frame.delay * 10 / t.speed;
				time += (time >= from)?delay:1;
			})(i);
		};

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

	extractAudio(){
		var t = this;
		var sound = t.g.buf.subarray(t.g.p);
		if(sound.length){
			var mime = 'audio/'+(t.audioFormat || 'ogg') + ";base64"

			var blob = new Blob([sound], {type: mime});

			t.audio = new Audio;
	    	t.audio.src = URL.createObjectURL(blob);

	    	t.audio.addEventListener('ended', function(){
					(t.onEnd || function(){})();
			    this.currentTime = 0;
			    if(this.volume <= 0.07) return false;

					console.log(this.volume);
					if(t.fade === true)
						this.volume = this.volume/2;
					else
						this.volume -= t.fade;

					console.log(this.volume);

					t.play(0);
			}, false);
		}

		return sound;
	}
};
