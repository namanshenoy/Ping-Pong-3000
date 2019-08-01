
var loginButton = document.getElementById('login-button');
var loginForm = document.getElementById('login-group');
var registerButton = document.getElementById('register-button');
var registerForm = document.getElementById('register-group');
var example = document.getElementById('example');

var jQueryScript = document.createElement('script');  
jQueryScript.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.0/axios.js');
document.head.appendChild(jQueryScript);

/* Transition Logic */
function emailChange(email){
	sesionStorage.setItem("email", "value");
	console.log("Email Key Change");
}

loginButton.onclick = function(){

	var errorMessage = document.getElementById('errorMessage');
	errorMessage.innerHTML = '';


	if(loginForm.style.display === 'grid'){
	var email = document.getElementById('loginEmail').value;
	var password = document.getElementById('loginPassword').value;

		axios.post('http://localhost:4000/login', 
						{
							email: email,
							password: password
						}
		)
		.then((r) => {
			console.log(r);
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			if(!success){
			
			} else {
				//set the session email key
				emailChange("email");
			}
		})
		.catch(e => {
			console.log(e.response.data.error);
			var errorMessage = document.getElementById('errorMessage');
				errorMessage.innerHTML=e.response.data.error;
		})


	} else {
		registerForm.style.display = 'none';
		loginForm.style.display = 'grid';
	}

}

registerButton.onclick = function(){
	var errorMessage = document.getElementById('errorMessage');
	errorMessage.innerHTML = '';


	if(registerForm.style.display === 'grid'){
	var email = document.getElementById('registerEmail').value;
	var password = document.getElementById('registerPassword').value;
	var player = document.getElementById('registerUsername').value;
	console.log(player);

		axios.post('http://localhost:4000/addPlayer', 
						{
							player: player,
							email: email,
							password: password
						}
		)
		.then((r) => {
			console.log(r);
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			if(!success){
				//no success
				alert('fail');
			} else {
				//sucess 
				alert('success');

			}
		})
		.catch(e => {
			console.log(e.response.data.error);
			var errorMessage = document.getElementById('errorMessage');
				errorMessage.innerHTML=e.response.data.error;
		})


	} else {
		registerForm.style.display = 'grid';
		loginForm.style.display = 'none';
	}

}