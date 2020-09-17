<template>
  <div id="app">
      <div id="main-container" >
          <div id="video-container">
              <div v-if="role == 'owner'">
                  <input v-model="videoUrl" placeholder="Youtube url"/>
                  <button @click="changeVideo">Go</button>
              </div>
              <youtube :video-id="videoId" ref="youtube" @ready="ready" @playing="playing" @paused="paused" @cued="videoCued" :fitParent="true" :player-vars="playerVars"/>
              <vue-slider v-model="sliderValue" :diabled="role != 'owner'" :tooltip-formatter="formatTime()" :max="videoDuration" @change="sliderChange" :dragOnClick="true"/>
                  <button @click="tooglePlay" v-if="role == 'owner'">Play</button>
          </div>
      </div>
      <div id="chat-container">
          <chat ref="chat" @sendMessage="sendMessage" />
      </div>
  </div>
</template>

<script>

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'
import Chat from './components/Chat.vue';

export default {
    name: 'App',
    components: {
        VueSlider,
        Chat
    },
    created() {
        setInterval(this.timeToSlider, 100)
        let connection = new WebSocket("ws://127.0.0.1:1337");

        connection.onclose = () => {
            this.$refs.addMessage("info:: lost connection to the server");
        }

        connection.onmessage = (message) => {
            // try to decode json (I assume that each message
            // from server is json)
            try {
                var json = JSON.parse(message.data);
                if (json.type == "role_msg") {
                    this.role = json.role;

                }

                if (json.type == "update") {
                    if (this.videoId != json.videoId) {
                        this.videoId = json.videoId;
                        this.pauseVideo();
                    }

                    if (json.playing) {
                        console.log("playing");
                        if (this.playerReady && !this.videoPlaying) {
                            this.playVideo();
                        }
                    } else {
                        if (this.playerReady && this.videoPlaying) {
                            console.log("pausing");
                            this.pauseVideo();
                        }
                    }
                    console.log("Setting time to " + json.time);

                    if (Math.abs(this.videoCurrent - json.time) > 1) {
                        this.player.seekTo(json.time);
                    }

                }

                if (json.type == "message") {
                    this.$refs.chat.addMessage(json.message);
                }
            } catch (e) {
                console.log(e);
                console.log('This doesn\'t look like a valid JSON: ',
                    message.data);
                return;
            }
            // handle incoming message
        };

        this.wsConnection = connection;
    },
    data() {
        return {
            videoId: '1JDbMkwoolo',
            playerVars: {
                controls: 0,
            },
            videoPlaying: false,
            playerReady: false,
            sliderValue: 0,
            videoCurrent: 0,
            videoDuration: 0,
            wsConnection: null,
            role: null,
            videoUrl: "https://www.youtube.com/watch?v=1JDbMkwoolo",
            chatMessages: []
        }
    },
    watch: {
        videoCurrent: function (value) {
            this.player.getDuration().then((duration) => {
                if (this.videoDuration != duration) {
                    this.videoDuration = Math.ceil(duration);
                }

                this.sliderValue = value;
                this.sendState();
            });

        }
    },
    methods: {
        playVideo() {
            this.player.playVideo();
        },
        pauseVideo() {
            this.player.pauseVideo();
        },
        playing() {
            this.videoPlaying = true
            this.sendState();
        },
        paused() {
            this.videoPlaying = false
            this.sendState();
        },
        tooglePlay() {
            if (this.videoPlaying) {
                this.pauseVideo();
            } else {
                this.playVideo();
            }
        },
        ready() {
            this.playerReady = true;
            //this.player.getDuration().then((duration) => this.videoDuration = duration);
        },
        videoCued() {
            this.pauseVideo();
        },
        changeVideo() {
            this.videoId = this.$youtube.getIdFromUrl(this.videoUrl);
            this.pauseVideo();
        },
        async timeToSlider() {
            if (this.playerReady) {
                let c = await this.player.getCurrentTime();
                this.videoCurrent = Math.ceil(c);
            } else {
                this.videoCurrent = 0;
            }

        },
        sliderChange(value) {
            if (this.role == "owner") {
                this.player.seekTo(value);
            }
        },
        sendState(videoPlaying = null, videoCurrent = null) {
            if (videoPlaying == null) {
                videoPlaying = this.videoPlaying;
            }

            if (videoCurrent == null) {
                videoCurrent = this.videoCurrent;
            }
            this.wsConnection.send(JSON.stringify({
                type: "update",
                playing: videoPlaying,
                time: videoCurrent,
                videoId: this.videoId,
            }));
        },
        formatTime() {
            var sec_num = parseInt(this.videoCurrent, 10); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            return hours+':'+minutes+':'+seconds;
        },
        sendMessage(msg) {
            this.wsConnection.send(JSON.stringify({
                type: "message",
                message: msg,
            }));
        }
    },
    computed: {
        player() {
            return this.$refs.youtube.player
        },
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#main-container {
    text-align: center;
    margin: 0 auto;
    max-width: 850px;
}
#video-container {
    max-width: 650px;
    float:left;
}
#chat-container {
    max-width: 200px;
    float:left;
}
input {
    margin: 5;
    width: 80%;
}
button {
    width: 20%;
    margin: 10px;
}
</style>
