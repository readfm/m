import React, {Component} from 'react';
import Canvas from 'react-native-canvas';

import {GifReader} from '../libs/omggif.js';

export default class Ggif extends Component{
	state = {
		video: null,
	};

	constructor(){
		super();

		this.timeouts = [];
		this.frames = [];
		this.fade = 0;

	}

	render() {
		return <Canvas ref={this.handleCanvas}/>;
	}


	handleCanvas = (canvas) => {
		this.ctx = canvas.getContext('2d');
		this.ctx.fillStyle = 'purple';
		this.ctx.fillRect(0, 0, 100, 100);
	}

  	download(id, cb){
  		FileSystem.readAsStringAsync(this.props.src, {
  			encoding: FileSystem.EncodingTypes.Base64
  		}).then(r => {
  			
  		});

		Pix.download(id, function(file){
			var buf = file.data;
			if(!buf) return reject();

			var g = t.g = new GifReader(buf);
				
			if(!t.g) return;
			t.resize();

			t.frame(0);

			t.extract();
		});
	},

	resize(){
		this.canvas.width = this.g.width;
		this.canvas.height = this.g.height;
	},

	speed: 1,
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
	},

	frame(i){
		var pixels = this.ctx.getImageData(0,0, this.g.width, this.g.height);
	    this.g.decodeAndBlitFrameBGRA(i, pixels.data);
	    this.ctx.putImageData(pixels, 0, 0);
	},

	pause(){
		this.audio.pause();
		this.clearTimeouts();
	},

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
	},

	fade: 0,
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
	},
};