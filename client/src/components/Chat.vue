<template>
    <div id="chat">
        <div class="chat">
            <p class="message" v-for="message in messageList" :key="message">
                {{ message }}
            </p>
        </div>
        <input v-model="msg" @keydown.13="keydown" placeholder="type msg"/>
    </div>
</template>

<script>
export default {
    name: 'Chat',
    data() {
        return {
            msg: "",
            messageList: [],
        }
    },
    methods: {
        keydown() {
            this.$emit('sendMessage', this.msg);
            this.msg = "";
        },
        addMessage(message) {
            this.messageList.push(message);
        }
    },
}
</script>
<style>
.chat {
    height: 300px;
    overflow-y: scroll;
    width: 180px;
    border: 1px solid #ccc;
    margin: 0 10px;
}
.message {
    text-align: left;
    margin: 5px;
    font-size: 16px;
}

</style>
