import React from 'react';
import ReactDOM from 'react-dom';
import Carousel from 'react-bootstrap/Carousel';
import logo from './Images/front.jpg';
import SlidingCarousel from './SlidingCarousel';
import ListContainer from './RankList';
import Button from 'react-bootstrap/Button';
import LoginRegisterContainer from './LoginRegister'

import socketIOClient from "socket.io-client";

//
import './index.css';
import * as serviceWorker from './serviceWorker';

/* Simulates request for messages */

const messages = [
{title: 'Champion!', message: 'Beth wins 4th of July Tourny!'},
{title: "Losers!", message: 'Max on 15 game losing streak!'}
];

const PLAYERS = [
  {name: 'Naman', rank:'1'},
  {name: 'Sal', rank: '2'},
  {name: 'Max', rank:'3'},
  {name: 'Cam', rank:'4'}
];


/* Simulating API call here */
class Main extends React.Component{

	constructor(props){
		super(props)
		this.state = {
			response: false,
			currentPlayer: localStorage.getItem('currentPlayer'),
			endpoint: "http://127.0.0.1:4001",
			socket: socketIOClient('http://127.0.0.1:4001')
		}

		this.handleLoginRender = 
		this.handleLoginRender.bind(this);

		this.handleLogout = 
		this.handleLogout.bind(this);
	}

	componentDidMount(){
		const endpoint = this.state.endpoint;
    	const socket = this.state.socket;
    	socket.on("FromAPI", data => 
        this.setState({ response: data.date })
        )
	}

	handleLoginRender(){
		this.setState({
			currentPlayer: localStorage.getItem('currentPlayer')
		})
		console.log(this.state.currentPlayer);
	}

	handleLogout(){
		this.setState({
			currentPlayer: localStorage.getItem('currentPlayer')
		})
	}

	render(){
		    const response= this.state.response;
		    console.log(response);
		return(
			<div class="MainContainer">
				<SlidingCarousel messages={messages}/>
				<ListContainer currentPlayer={this.state.currentPlayer}/>
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

	handleSuccesfulLogin(){
		this.setState({
			isLoggedIn: true
		});
		localStorage.setItem('isLoggedIn', true);
		/* Somehow set the name here from API response */
		localStorage.setItem('currentPlayer', 'Clementine Bauch');
		this.props.onLogin();
	}

	handleLogout(){
		this.setState({
			isLoggedIn: false
		});
		localStorage.setItem('isLoggedIn', false);
		localStorage.setItem('currentPlayer', null);
		this.props.onLogout();
	}

	render(){
		const isLoggedIn = this.state.isLoggedIn;
		
		let functionalBar;

		if(!isLoggedIn){
			functionalBar = 
			/* this prop is passed in just to test, it is
			auto logging in, no API interaction */
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
	handleFinishMatch(){

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