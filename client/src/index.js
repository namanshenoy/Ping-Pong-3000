import React from 'react';
import ReactDOM from 'react-dom';
import Carousel from 'react-bootstrap/Carousel';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import logo from './Images/front.jpg';
import SlidingCarousel from './SlidingCarousel';
import ListContainer from './RankList';
import Button from 'react-bootstrap/Button';
import LoginRegisterContainer from './LoginRegister'
import axios from 'axios'
import socketIOClient from "socket.io-client";

//
import './index.css';
import * as serviceWorker from './serviceWorker';

/* Simulates request for messages */

const messages = [
{title: "Want your message here?", message: 'Venmo @SalVerduzco'},
{title: 'Oracle Ping Pong Rankings', message: 'Sell sell sell!'},
{title: "End Date", message: 'Tournament ends 20th of July'}
];


/* Simulating API call here */
class Main extends React.Component{

	constructor(props){
		super(props)
		this.state = {
			response: false,
			currentPlayerEmail: localStorage.getItem('currentPlayerEmail'),
			endpoint: "http://localhost:4000",
			socket: socketIOClient('http://localhost:4000'),
			players: [],
			isChallenged: false
		}

		this.handleLoginRender = 
		this.handleLoginRender.bind(this);

		this.handleLogout = 
		this.handleLogout.bind(this);
	}

	componentDidMount(){		

		let playerArray = [];
		let testPlayer = [];
		const endpoint = this.state.endpoint;
    	const socket = this.state.socket;
   
   		let dummyPlayer;
    	
    	socket.on("updateList", (data)=>{
    		console.log(data.data);
    		data.data.map((player)=>{
    			if(player.email == this.state.currentPlayerEmail){
    				this.setState({isChallenged: player.inMatch});
    			}
				dummyPlayer = {name: player.name, rank: player.rank, email: player.email, inMatch: player.inMatch};
				testPlayer.push(dummyPlayer);
    		})
    		this.setState({
					players: testPlayer
			});
    		testPlayer = [];
    	});
	}

	handleLoginRender(bool){
		this.setState({
			currentPlayerEmail: localStorage.getItem('currentPlayerEmail'),
			isChallenged: bool
		})
		console.log(this.state.currentPlayerEmail);
	}

	handleLogout(){
		console.log("upper log out");
		this.setState({
			currentPlayerEmail: null,
			isChallenged: false
		})
	}

	render(){
		let isChallenged = this.state.isChallenged;
		if(isChallenged == null || isChallenged==undefined){
			isChallenged = false;
		}
		return(
			<div class="MainContainer">
				<div>{this.state.currentPlayerEmail}</div>
				<div>{isChallenged.toString()}</div>
				<div><button className = "deleteButton"> Delete Account </button></div>
				<SlidingCarousel messages={messages}/>
				<ListContainer players={this.state.players} currentPlayerEmail={this.state.currentPlayerEmail}/>

				<LRC_Container currentPlayerEmail={this.state.currentPlayerEmail} 
				isChallenged = {this.state.isChallenged}
				onLogout = {this.handleLogout} 
				onLogin={this.handleLoginRender}/>

			</div>
		);
	}
}


/* LOGIN REGSTER CHALLENGE */
class LRC_Container extends React.Component{

	componentWillReceiveProps({currentPlayerEmail, isChallenged}) {
  		this.setState({currentPlayerEmail: currentPlayerEmail,
  				       isChallenged: isChallenged
  		})
	}

	constructor(props){
		super(props);
		this.state = {
			isLoggedIn: false,
			isChallenged: props.isChallenged,
			currentPlayerEmail: props.currentPlayerEmail
		}
		this.handleSuccesfulLogin = 
		this.handleSuccesfulLogin.bind(this);

		this.handleLogout = 
		this.handleLogout.bind(this);

	}

	componentDidMount(){
		let bool = false;
		if(localStorage.getItem('isLoggedIn')==="true"){
			bool = true;
		}
		this.setState({
			isLoggedIn: bool
		});

	}

	handleSuccesfulLogin(email, bool){
		this.setState({
			isLoggedIn: true,
			isChallenged: bool
		});
		localStorage.setItem('isLoggedIn', true);
		/* Somehow set the name here from API response */
		localStorage.setItem('currentPlayerEmail', email);
		this.props.onLogin(bool);
	}

	handleLogout(){
		this.setState({
			isLoggedIn: false,
			isChallenged: false
		});
		localStorage.setItem('isLoggedIn', false);
		localStorage.setItem('currentPlayerEmail', null);
		this.props.onLogout();
	}

	render(){

		let isLoggedIn = this.state.isLoggedIn;

		let functionalBar;

		if(!isLoggedIn){
			functionalBar = 
			<LoginRegisterContainer onLogin={this.handleSuccesfulLogin}/>

		} else {
			functionalBar = 
			<LogoutChallengeWinContainer 
			isChallenged={this.state.isChallenged} 
			currentPlayerEmail={this.state.currentPlayerEmail}
			logout={this.handleLogout} />
		}

		return(
			<div class="LRC_Container">{functionalBar}</div>
		)
	}

}

class LogoutChallengeWinContainer extends React.Component{

	componentWillReceiveProps({isChallenged, currentPlayerEmail}) {
  		this.setState({
  			isChallenged: isChallenged,
  			currentPlayerEmail: currentPlayerEmail,
  			error: null
  		})
  		if(isChallenged){
  			/* Do not display challenge container if already in a challenge */
  			if(this.state.stateNum == 0){
  				this.setState({stateNum: 1});
  			}
  		} else {
  			this.setState({stateNum: 0});
  		}
	}

	constructor(props){
		super(props);
		this.state = {
			stateNum: 0
		}

		this.handleLogout = 
		this.handleLogout.bind(this);

		this.handleChallenge = 
		this.handleChallenge.bind(this);

		this.handleConfirmChallenge = 
		this.handleConfirmChallenge.bind(this);

		this.handleFinishMatch = 
		this.handleFinishMatch.bind(this);

		this.handleMisclick = 
		this.handleMisclick.bind(this);
	}

	componentDidMount(){
		/* Make API Call to know state to display */
	}

	handleFinishMatch(){

		console.log("trying to finish match");

		/* Attempt to end the match */
		axios.post('http://localhost:4000/concludeMatch', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			console.log(r);
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			
			if(success == null){
				this.setState({error: r.data.error});
			} else {
				//the match concluded
				this.setState({stateNum: 0});
			}
		})
		.catch(e => console.error(e))
	}

	handleConfirmChallenge(){
		this.setState(() => ({
			stateNum: this.state.stateNum + 1
		}))
	}

	handleLogout(){
		this.setState({
			isLoggedIn: false
		});
		localStorage.setItem('isLoggedIn', false);
		localStorage.setItem('currentPlayerEmail', null);
	}

	handleChallenge(){

		/* Attempt to initiate challene involving this player */
		console.log("sending to: " + this.state.currentPlayerEmail);
		axios.post('http://localhost:4000/challengePlayer', 
						{
							challenger: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			console.log(r);
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			if(success == null || success == undefined){
				/* Display Error Message to User */
				console.log(r);
				this.setState({
					error: r.data.error
				})
			} else {
				/* Challenge Value will become true, handled by updateList */
				this.setState(() => ({
					stateNum: this.state.stateNum + 1
				}))
			}
		})
		.catch(e => {
			this.setState({
				error: e.response.data.error
			})
			console.log(e.response.data.error);
		})


	}

	handleMisclick(){
		this.setState(() => ({
			stateNum: this.state.stateNum - 1
		}))
	}

	render(){
		let button;

		if(this.state.stateNum == 0){
			button = <Button onClick = {this.handleChallenge} className="ChallengeButton" variant="warning">Challenge!</Button>
		} else if(this.state.stateNum == 1){
			button = <Button onClick = {this.handleConfirmChallenge}variant="outline-warning">Click Here Only If You Won The Match</Button>
		} else if(this.state.stateNum == 2){
			button = <div>
					 <Button onClick={this.handleMisclick} variant="danger">Go Back</Button> 
					 <Button onClick={this.handleFinishMatch} variant = "success">Yes, I won!</Button>
					 </div>
		}

		return (
		<div class='challengeErrorContainer'>
			<div class="logchallButtonsContainer">
				{button}
				<Button onClick = {this.props.logout} className="LogoutButton" variant="info">Logout</Button>
			</div>
			<MyChallenger currentPlayerEmail={this.state.currentPlayerEmail}/>
			<div> {this.state.error} </div>
		</div>
		)
	}
}

class MyChallenger extends React.Component {


	constructor(props){
		super(props);
		this.state = {
			currentPlayerEmail: null,
			otherPlayer: null
		}
	}

	componentWillReceiveProps({isChallenged, currentPlayerEmail}) {
	  	this.setState({
	  		currentPlayerEmail: currentPlayerEmail
	  	})
	 }

	componentDidMount(){

		/* Attempt to end the match */
		axios.post('http://localhost:4000/inMatch', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			console.log(r);
			/* Either they were in a challenge or they were not */
			let inMatch = r.data.inMatch;
			if(inMatch){
				this.setState({
					otherPlayer: r.data.email
				})
			} else {
				this.setState({
					otherPlayer: null
				})
			}
		})
		.catch(e => console.error(e))
	}

	render(){
		let email = this.state.currentPlayerEmail;
		let result;
		if(email!==null){
			 result = (
			<div class="alertContainer">
				<Alert variant="primary" className="myAlert"> You are currently scheduled to play: </Alert>
			</div>
			)
		}

		return(
			<div> {result} </div>
		);
	}
}




ReactDOM.render(<Main />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

	/*
		axios.get('http://server:3000/getPlayers')(
					.then(data => {
	
					}))
					I need to ad
					more
	*/