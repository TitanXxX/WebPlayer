var SiteMessageList = [];
const colors = ["var(--bad-message-color)", "var(--neutral-message-color)", "var(--good-message-color)"];
var ID = null;

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function create_message(good, ...text){
	let message = document.createElement("div");
	message.setAttribute("class","SiteMessage");
	message.innerHTML = "";
	for (item in text) {
		message.innerHTML += text[item]
	}
	message.style = "background-color: color-mix(in srgb, " + colors[good + 1] + " var(--opacity), transparent);";
	SiteMessages.appendChild(message);
	SiteMessageList = [...SiteMessageList, message];
	console.log(...text);
	setTimeout(del_messages, 5000, message);
}

function del_messages(message){
	SiteMessageList.splice(SiteMessageList.indexOf(message), 1);
	message.remove();
}


function SetTopnav(){
	let e, url, li, link;
	e = document.getElementById("topnav");
	url = window.location.pathname;
	if(url == "/login") return;

	for (i in TOP_NAV){
		link = document.createElement("a");
		
		li = document.createElement("li");
		li.setAttribute("class", "topnav_li");
		
		if(TOP_NAV[i].url == url){
			link.setAttribute("class", "active");
		}
		if(TOP_NAV[i].url == LOGOUT_URL){
			link.setAttribute("id", "logout");
			li.setAttribute("style", "flex: 1;");
		}
		link.innerHTML = TOP_NAV[i].title;
		if(TOP_NAV[i].url != "") link.href = TOP_NAV[i].url;
		if(TOP_NAV[i].id !== undefined) link.setAttribute("id", TOP_NAV[i].id);
		li.appendChild(link);
		e.appendChild(li);
	}
	//window.location.href = ;
}

function changeTheme(arg) {
	if(arg==false){
		document.body.setAttribute('dark','');
	}
	if(document.body.getAttribute("dark")!="") {
		document.body.setAttribute('dark', '');
		document.getElementById("sun-changeTheme").style.display="";
		document.getElementById("moon-changeTheme").style.display="none";
		localStorage.setItem("theme","dark");
	} else {
		document.body.removeAttribute('dark');
		document.getElementById("sun-changeTheme").style.display="none";
		document.getElementById("moon-changeTheme").style.display="";
		localStorage.setItem("theme","light");
	}
}


function get_user_data(login){
	let data = {};
	if(login) data = {"username": login};
	
	return $.ajax({
		url: USER_DATA_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: data,
		dataType: "json",
	}).then(response => {
		if(response.status == 1){
			if(!login){
				username_el.style.display = "block";
				username_el.innerHTML = response.username;
				username_el.href = INFO_URL;
				return response.username;
			} else{
				return response.username;
			}
		} else{
			create_message(-1, "Error on get user data:", response);
			return {};
		}
	}).catch(response => {
		if(!login){
			username_el.style.display = "none";
		}
		create_message(-1, "Error on get user data:", response);
		return {};
	});
}




