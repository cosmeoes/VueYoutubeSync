# VueYoutubeSync
A toy project to make watch parties with youtube videos. Currentlly it can only host one party and you can only connect if you are in the same computer lol.

# Running
Install node dependencies for the server:

```bash
npm install 
```
And the client:
```bash
cd client/
npm install
```

Run the server:
```bash
node index.js
```
And then the client:
```bash
cd client/
npm run serve
```

Then open your browser at http://localhost:8080/, you can open several tabs but only one will be able to control the video and all other should be synced with it.

