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
			endpoint: "http://127.0.0.1:4001",
			socket: socketIOClient('http://127.0.0.1:4000'),
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

    	/* if they are logged in, i.e. have an email stored, check if they are challenged */
    	if(this.state.currentPlayerEmail != null){
	    	axios.post('http://localhost:4000/isChallenged', 
							{
								email: this.state.currentPlayerEmail
							}
				)
				.then((r) => {
					this.setState({
						isChallenged: r.data.isChallenged
					})
				})
				.catch(e => console.error(e))
		}
   
   		let dummyPlayer;
    	socket.on("connection", (data)=>{
    		data.data.map((player)=>{
    			if(player.email == this.state.currentPlayerEmail){
    				console.log("PLAYER MATCH");
    			}
				dummyPlayer = {name: player.name, rank: player.rank};
				testPlayer.push(dummyPlayer);
    		})
    		this.setState({
					players: testPlayer
			});
    		testPlayer = [];
    	});
    	
    	socket.on("updateList", (data)=>{
    		data.data.map((player)=>{
				dummyPlayer = {name: player.name, rank: player.rank};
				testPlayer.push(dummyPlayer);
    		})
    		this.setState({
					players: testPlayer
			});
    		testPlayer = [];
    	});
	}

	handleLoginRender(){
		this.setState({
			currentPlayerEmail: localStorage.getItem('currentPlayerEmail')
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
		console.log(this.state.isChallenged);
		return(
			<div class="MainContainer">
				<div>{this.state.currentPlayerEmail}</div>
				<SlidingCarousel messages={messages}/>
				<ListContainer players={this.state.players} CurrentPlayerEmail={this.state.currentPlayerEmail}/>
				<LRC_Container onLogout = {this.handleLogout} onLogin={this.handleLoginRender}/>
			</div>
		);
	}
}


/* LOGIN REGSTER CHALLENGE */
class LRC_Container extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			isLoggedIn: false
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

	handleSuccesfulLogin(email){
		this.setState({
			isLoggedIn: true
		});
		localStorage.setItem('isLoggedIn', true);
		/* Somehow set the name here from API response */
		localStorage.setItem('currentPlayerEmail', email);
		console.log(email);
		this.props.onLogin();
	}

	handleLogout(){
		this.setState({
			isLoggedIn: false
		});
		localStorage.setItem('isLoggedIn', false);
		localStorage.setItem('currentPlayerEmail', null);
		this.props.onLogout();
	}

	render(){
		let isLoggedIn = this.state.isLoggedIn;
		if(localStorage.getItem('currentPlayerEmail') == null){
			console.log(localStorage.getItem('currentPlayerEmail'));
			isLoggedIn = true;
			console.log('called');
		}

		let functionalBar;

		if(!isLoggedIn){
			functionalBar = 
			<LoginRegisterContainer onLogin={this.handleSuccesfulLogin}/>

		} else {
			functionalBar = 
			<LogoutChallengeWinContainer logout={this.handleLogout}/>
		}

		return(
			<div class="LRC_Container">{functionalBar}</div>
		)
	}

}

class LogoutChallengeWinContainer extends React.Component{

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
		axios.get('http://localhost:3000/getPlayers')(
					.then(data => {
	
					}))
					I need to ad
					more
	*/