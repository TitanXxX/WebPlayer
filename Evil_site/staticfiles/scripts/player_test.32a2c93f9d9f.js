console.log('Start');

const myAudio=document.createElement("audio");

//----
var track_name=localStorage.getItem("track_name");
if((track_name==null) || (track_name===undefined)) track_name="TrackName";

var track_author=localStorage.getItem("track_author");
if((track_author==null) || (track_author===undefined)) track_author="TrackAuthor";

if((track_name!="TrackName") && (track_author!="TrackAuthor")) document.title=track_name+" - "+track_author;


var track_id=localStorage.getItem("track_id");
if(track_id==null) track_id=0;

var repeat_flag=parseInt(localStorage.getItem("repeat_flag"));
if((repeat_flag==null) || isNaN(repeat_flag)) repeat_flag=0;
var shuffle_flag=parseInt(localStorage.getItem("shuffle_flag"));
if(shuffle_flag==null){
	shuffle_flag=false;
} else{
	shuffle_flag=(shuffle_flag==1);
}
var volume=parseInt(localStorage.getItem("volume"));
if((volume==null) || isNaN(volume)) volume=50;
var track_loaded=false;
var trackname=document.getElementById("trackname");
trackname.innerHTML=track_name;
var trackauthor=document.getElementById("trackauthor");
trackauthor.innerHTML=track_author;

var tracktime=document.getElementById("tracktime");

var trackinMyMusic=false;
var Starting=false;
var search_value="";

var MyMusic_element=document.getElementById("MyMusic");
var AllMusic_element=document.getElementById("AllMusic");

var MyMusic_switch=localStorage.getItem("MyMusic_switch");
if(MyMusic_switch==null){
	MyMusic_switch=true;
} else MyMusic_switch=MyMusic_switch=="true";
MyMusic_element.checked=MyMusic_switch;
var AllMusic_switch=localStorage.getItem("AllMusic_switch");
if(AllMusic_switch==null){
	AllMusic_switch=true;
} else AllMusic_switch=AllMusic_switch=="true";
AllMusic_element.checked=AllMusic_switch;
//----

var play=document.getElementById("play");
var pause=document.getElementById("pause");
var shuffle_element=document.getElementById("shuffle_flag");
var repeat_element=document.getElementById("repeat_flag");
var for_repeat_element=document.getElementById("for_repeat");
var add_to_music=document.getElementById("add_to_music");
var music_slider=document.getElementById("music_slider_range");
var slider=document.getElementById("slider_range");
var MusicList_box=document.getElementById("MusicList_box");
var download_flag=document.getElementById("download_flag");

var track_list=[];

function playpause(argument){
	if(Starting) return true;
	Starting=true;
	const divs=MusicList_box.getElementsByTagName('div');
	for (const div of divs) {
		var track=track_list[parseInt(div.getAttribute("data"))];
		if((track!==undefined) && (track["track_id"]==track_id)) {
			div.classList.add("Active_Track_box");
		} else{
			div.classList.remove("Active_Track_box");
		}
	}
	if(myAudio.paused) {
		if(track_loaded){
			if(myAudio.play()) {
				pause.style.display="inline-block";
				play.style.display="none";
			} else{
				pause.style.display="none";
				play.style.display="inline-block";
			}
		} else{
			myAudio.load();
			myAudio.src="";
			download_flag.style.display="inline-block";
			load_track(track_id).then(response => {
				myAudio.src="data:audio/mpeg;base64,"+response.source;
				download_flag.style.display="none";
				if(argument){
					track_loaded=true;
					Starting=false;
					return true;
				}
				if(myAudio.play()) {
					pause.style.display="inline-block";
					play.style.display="none";
					track_loaded=true;
				} else{
					pause.style.display="none";
					play.style.display="inline-block";
					track_loaded=false;
				}
				Starting=false;
			}).catch(response => {
				download_flag.style.display="none";
				pause.style.display="none";
				play.style.display="inline-block";
				Starting=false;
			});
		}
	} else {
		myAudio.pause();
		pause.style.display="none";
		play.style.display="inline-block";
	}
	Starting=false;
}
function getRandomInt(max) {
	return Math.floor(Math.random()*(max+1));
}
function skip(side){
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	if(track_list.length==0) return true;
	var real=-1;
	for(const index in track_list){
		if(track_list[index].track_id==track_id){
			real=parseInt(index);
			break;
		}
	}
	var output=0;
	if(shuffle_flag){
		if(track_list.length>=2){
			output=getRandomInt(track_list.length-2);
			if(output==real) output+=1;
		}
	} else{
		if(side==0){
			if((real==0) || (real==-1)){
				output=track_list.length-1;
			} else{
				output=real-1;
			}
		} else{
			if((real==(track_list.length-1)) || (real==-1)){
				output=0;
			} else{
				output=real+1;
			}
		}
	}
	const timed=track_list[output.toString()];
	if(timed===undefined) return true;
	if(!myAudio.paused) myAudio.pause();
	track_name=timed.name;
	track_author=timed.author;
	track_id=timed.track_id;
	document.title=track_name+" - "+track_author;
	trackname.innerHTML=track_name;
	trackauthor.innerHTML=track_author;
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	track_loaded=false;
	playpause();
}
function ended(argument){
	console.log('Ended with func');
	switch(repeat_flag) {
		case 0://Nothing to do
			pause.style.display="none";
			play.style.display="inline-block";
			break;
		case 1://Play to the end of the list
			skip(1);
			break;
		case 2://Replay this one
			myAudio.play();
			break;
		default:
			break;
	}
}
function load_track(id){
	return $.ajax({
		url: LOAD_MUSIC_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: {"ID": id},
		dataType: "json",
		error: function(response) {console.log("Error on download music",response);}
	});
}
function shuffle(argument){
	if(argument===undefined) {
		shuffle_flag=!shuffle_flag;
	} else {
		shuffle_flag=argument;
	}
	localStorage.setItem("shuffle_flag",shuffle_flag?"1":"0");
	if(shuffle_flag){
		shuffle_element.style.color="var(--main-color)";
	} else{
		shuffle_element.style.color="var(--second-color)";
	}
}
function repeat(argument){
	if(argument===undefined) {
		if(repeat_flag!=2) repeat_flag++;
		else repeat_flag=0;
	} else {
		repeat_flag=argument;
	}
	localStorage.setItem("repeat_flag",repeat_flag.toString());
	switch(repeat_flag) {
		case 0:
			repeat_element.style.color="var(--second-color)";
			for_repeat_element.style.display="none";
			break;
		case 1:
			repeat_element.style.color="var(--main-color)";
			for_repeat_element.style.display="none";
			break;
		case 2:
			repeat_element.style.color="var(--main-color)";
			for_repeat_element.style.display="inline";
			break;
		default:
			break;
	}
}
function addtomusic(arg){
	if(arg===undefined) {
		trackinMyMusic=!trackinMyMusic;
	} else{
		trackinMyMusic=arg;
	}
	if(trackinMyMusic){
		add_to_music.style.transform="rotate(45deg)";
	} else{
		add_to_music.style.transform="none";
	}
}
function changeVolume(arg){
	volume=arg;
	myAudio.volume=volume/100;
	localStorage.setItem("volume",volume.toString());
}
function UpdateRange(argument){
	if(myAudio.duration!==undefined) {
		music_slider_range.max=myAudio.duration*10;
		music_slider_range.value=myAudio.currentTime*10;
		var seconds=Math.floor(myAudio.currentTime);
		tracktime.innerHTML=Math.floor(seconds/60)+":"+(((seconds%60)<10)?"0":"")+(seconds%60).toString();
	}
}
function StartTrack(argument){
	var music_id=parseInt(argument.getAttribute("data"));
	var timed=track_list[music_id];
	if(timed===undefined) return true;
	if(!myAudio.paused) myAudio.pause();
	track_name=timed.name;
	track_author=timed.author;
	track_id=timed.track_id;
	document.title=track_name+" - "+track_author;
	trackname.innerHTML=track_name;
	trackauthor.innerHTML=track_author;
	localStorage.setItem("track_name",track_name);
	localStorage.setItem("track_author",track_author);
	localStorage.setItem("track_id",track_id);
	track_loaded=false;
	playpause();
}

function load_tracklist(){
	MyMusic_switch=MyMusic_element.checked;
	AllMusic_switch=AllMusic_element.checked;
	localStorage.setItem("MyMusic_switch",MyMusic_switch);
	localStorage.setItem("AllMusic_switch",AllMusic_switch);
	return $.ajax({
		url: LOAD_MUSICLIST_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: {
			"q":search_value,
			"mymusic":MyMusic_switch?"true":"false",
			"allmusic":AllMusic_switch?"true":"false"},
		dataType: "json",
		success: function(response){
			MusicList_box.innerHTML="";
			track_list=[];
			for (const index in response) {
				data=response[index];
				/*<img src="assets/test.jpg" alt="Icon" class="icon">*/
				MusicList_box.innerHTML+='<div class="Track_box" onclick="StartTrack(this)" data='+index.toString()+'>\
					<ion-icon name="musical-note-outline" class="icon" style="background-color: var(--main-bg-color);"></ion-icon>\
					<div class="trackname">'+data["name"]+'</div>\
					<div class="trackname">'+data["author"]+'</div>\
				</div>';
				track_list.push({name:data["name"],author:data["author"],image:data["image"],track_id:data["id"]});
			}
		},
		error: function(response) {console.log("Error on load tracklist",response);}
	});
}
function search(value){
	search_value=value;
	load_tracklist();
}
repeat(repeat_flag);
shuffle(shuffle_flag);
changeVolume(volume);
addtomusic(trackinMyMusic);
add_to_music.onclick=addtomusic;
music_slider.oninput=function() {
	myAudio.currentTime=this.value/10;
}
slider.value=volume;
slider.oninput=function() {
	changeVolume(this.value);
}
myAudio.addEventListener("ended",ended);
var updateTimer=setInterval(UpdateRange,500);


load_tracklist();
playpause(true);
console.log('End');
/*
const mediaElement = document.querySelector("#mediaElementID");
mediaElement.seekable.start(0); // Returns the starting time (in seconds)
mediaElement.seekable.end(0); // Returns the ending time (in seconds)
mediaElement.currentTime = 122; // Seek to 122 seconds
mediaElement.played.end(0); // Returns the number of seconds the browser has played
150/85
*/




