function getCookie(name) {
	let cookieValue = null;
	console.log("cookies =",document.cookie);
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
function DROP() {
	document.getElementById("AccountDropdown").classList.toggle("show");
}
function EXIT(){
	document.cookie="session=; path=/; secure; max-age=-1";
	location.reload();
}
function LOGIN() {
	$.ajax({
		url: LOGIN_URL,
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
		},
		mode: "same-origin",
		data: {
				"LOGIN": document.getElementById("EMAIL_form").value,
				"PASSWORD": document.getElementById("PASSWORD_form").value
			},
		dataType: "json",
		success: function(response) {
				if(response.status=="1"){
					document.getElementById("login_form").style.display="none";
					document.getElementById("account_info").style.display="block";
					document.getElementById("EMAIL_form").value="";
					document.getElementById("PASSWORD_form").value="";

					document.getElementById("name").innerHTML=response.name+" "+response.lastname;
					document.getElementById("login").innerHTML=response.login;
					document.getElementById("login-href").href=ACCOUNTS_URL+"?login="+response.login;

					document.cookie="session="+encodeURIComponent(response.session)+"; path=/; secure; max-age=31536000";
				}
		},
		error: function(response) {console.log("Error on login and info_catch:",response);}
	});
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