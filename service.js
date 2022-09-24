'use strict';

const PonkBot = require('./lib/ponkbot.js');
const config = require('./config')

const bot = new PonkBot(config);


const express = require('express');
const http = require('http');

const proofOfConcept = express();

// This is where you would define a shared function
/*
commonFunction = function(arg) {
	
    console.log("I'm doing something");

}
*/

proofOfConcept.use(express.json())

proofOfConcept.post('/add', (req, res) => {
    const { type, id } = req.body;
    bot.mediaSend({ type, id });
    
    bot.client.once('mediaUpdate', ()=>{
	var playlistLength = 0;
	var playlistArray = bot.playlist;
	var arrayLength = playlistArray.length;
	var timeLeftOnTrack = bot.currMedia.seconds - Math.trunc(bot.currMedia.currentTime);
	playlistLength += timeLeftOnTrack;
	for (var i = 1; i < arrayLength; i++) {
	    playlistLength += playlistArray[i].media.seconds;
	}

	res.end(playlistLength.toString());

    });
});

proofOfConcept.post('/skip', (req, res) => {
    
    const canSee = bot.meeseeks('seeplaylist');
    const canJump = bot.meeseeks(bot.listlocked ? 'playlistjump' : 'oplaylistjump');
    console.log("the values are" + canSee + "   " + canJump);
    var returnValue = "";

    //if(canSee && canJump){
	let index = bot.playlist.findIndex(({ uid })=>{ return bot.currUID === uid });
	// Wrap around?
	if(index === bot.playlist.length - 1){ index = 0 }else{ index++ }
	const uid = bot.playlist[index].uid;
	returnValue = bot.playlist[index].media.type + "`" + bot.playlist[index].media.id;           
	bot.client.jump(uid);
    //} else {
	//bot.client.deleteVideo(bot.currUID);
    //}
    
    var playlistLength = 0;
    var playlistArray = bot.playlist;
    var arrayLength = playlistArray.length;
    for (var i = 1; i < arrayLength; i++) {
	playlistLength += playlistArray[i].media.seconds;
    }
    
    returnValue = returnValue.concat("`" + playlistLength);

    res.end(returnValue.toString());
});

proofOfConcept.post('/removeVideo', (req, res) => {
    const json = req.body;
    var videoId = json.id;
    var uidToRemove;
    var playlistLength = 0;
    var playlistArray = bot.playlist;
    var arrayLength = playlistArray.length;
    var needToAddAVideo = 0;
    for (var i = 0; i < arrayLength; i++) {
	    if(playlistArray[i].media.id == videoId){
	    	uidToRemove = playlistArray[i].uid;
	    	console.log("i = " + i + "   " + " arrayLength = " + arrayLength);
	    	if(i == 0 && arrayLength == 1){
	    		needToAddAVideo = 1;
	    	}
	    }
    }
    var timeLeftOnTrack = bot.currMedia.seconds - Math.trunc(bot.currMedia.currentTime);
    if(!bot.currMedia.id == videoId){
    	playlistLength += timeLeftOnTrack;
    }
    if(uidToRemove != null){
	    bot.client.deleteVideo(uidToRemove)
    }
    
    //Recalculate the timer!        

    for (var i = 1; i < arrayLength; i++) {
	playlistLength += playlistArray[i].media.seconds;
    }               
    console.log("Calculated remaining length of playlist as " + playlistLength + "   " + needToAddAVideo);
    res.end(playlistLength.toString() + "`" + needToAddAVideo);
});

proofOfConcept.post('/np', (req, res) => {
    var returnValue = "";
    if(bot.playlist[0] != null){
	    returnValue = bot.currMedia.type + "`" + bot.currMedia.id;
    }

    res.end(returnValue);
});

proofOfConcept.post('/numtracks', (req, res) => {
    
    var returnValue = "";
    
    if(bot.playlist.length != null){
	    returnValue += bot.playlist.length;
    }

    res.end(returnValue);
});

// Listen on local host
proofOfConcept.listen(3000, '127.0.0.1')