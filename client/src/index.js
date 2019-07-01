import React from 'react';
import ReactDOM from 'react-dom';
import Carousel from 'react-bootstrap/Carousel';
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
{title: 'Champion!', message: 'Beth wins 4th of July Tourny!'},
{title: "Losers!", message: 'Max on 15 game losing streak!'}
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
			currentPlayerEmail: null
		})
	}

	render(){
		console.log("isChallenged: " + this.state.isChallenged);
		return(
			<div class="MainContainer">
				<div>{this.state.currentPlayerEmail}</div>
				<div>{this.state.isChallenged.toString()}</div>
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
  			currentPlayerEmail: currentPlayerEmail
  		})
  		if(isChallenged){
  			/* Do not display challenge container if already in a challenge */
  			if(this.state.stateNum == 0){
  				this.setState({stateNum: 1});
  			}
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
		this.setState(() => ({
			stateNum: this.state.stateNum + 1
		}))
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

		/* Attempt to initiate challene with this player */
		axios.post('http://localhost:4000/challenge', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			if(!success){
				/* Display Error Message to User */
			} else {
				/* Challenge Value will become true, handled by updateList */
			}
		})
		.catch(e => console.error(e))

		this.setState(() => ({
			stateNum: this.state.stateNum + 1
		}))
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
		<div class="logchallButtonsContainer">
			{button}
			<Button onClick = {this.props.logout} className="LogoutButton" variant="info">Logout</Button>
		</div>
		)
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