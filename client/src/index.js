import React from 'react';
import ReactDOM from 'react-dom';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import logo from './Images/d.png';
import SlidingCarousel from './SlidingCarousel';
import ListContainer from './ListContainer';
import Button from 'react-bootstrap/Button';
import LoginRegisterContainer from './LoginRegister'
import axios from 'axios'
import socketIOClient from "socket.io-client";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import ListGroup from 'react-bootstrap/ListGroup';
import Component1 from './Component1';
import {Spring} from 'react-spring/renderprops';

import {useSprings, animated} from 'react-spring';

//
import './index.css';
import * as serviceWorker from './serviceWorker';

/* Simulates request for messages */

const messages = [
{title: 'Oracle Ping Pong Rankings', message: 'Good luck!'}
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
			isChallenged: false,
			stateNum: 0
		}

		this.handleGoBack = 
		this.handleGoBack.bind(this);

		this.handleDelete = 
		this.handleDelete.bind(this);

		this.handleConfirmDelete = 
		this.handleConfirmDelete.bind(this);

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
    		console.log("socket sending updated list");
    		console.log(data);
    		data.data.map((player)=>{
    			if(player.email === this.state.currentPlayerEmail){
    				this.setState({isChallenged: false});
    				this.setState({isChallenged: true});
    				this.setState({isChallenged: player.inMatch});
    			}
				dummyPlayer = {name: player.name, rank: player.rank, email: player.email, inMatch: 
				player.inMatch, wins:player.wins, losses:player.losses, ratio:player.ratio, winStreak:player.winStreak };
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
	}

	handleLogout(){
		this.setState({
			currentPlayerEmail: null,
			isChallenged: false
		})
		localStorage.setItem('isLoggedIn', false);
		localStorage.setItem('currentPlayerEmail', null);
	}

	handleDelete(){
		this.setState(() => ({
			stateNum: this.state.stateNum + 1
		}))
	}

	handleGoBack(){
		this.setState(() => ({
			stateNum: this.state.stateNum - 1
		}))
	}

	handleConfirmDelete(){

		this.setState({
			stateNum: 0
		});

		axios.post('http://localhost:4000/deletePlayer', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			/* Either the login was succesful, or it failed */
			let success = r.data.SUCCESS;
			
			if(success === null){
				this.setState({error: r.data.error});
			} else {
				//account deleted
				this.handleLogout();	
			}
		})
		.catch(e => console.error(e))

	}

	render(){

		let isChallenged = this.state.isChallenged;
		if(isChallenged === null || isChallenged === undefined){
			isChallenged = false;

		}

		let deleteButton = null;
		if(this.state.currentPlayerEmail != null && this.state.currentPlayerEmail != "null"){

			if(this.state.stateNum === 0){
				deleteButton = <div class="Delete"><Button className = "deleteButton" variant="secondary" onClick={this.handleDelete}> Delete Account </Button></div>
			} else if(this.state.stateNum === 1){
				deleteButton = <div class="Delete">
									<Button variant="info" onClick = {this.handleGoBack}>Go back</Button>
									<Button variant="secondary"onClick = {this.handleConfirmDelete}>Confirm</Button>
							   </div>
			}
		}

		return(

/*
  			<div class="MainContainer">

				{deleteButton}
				<Spring config={{}}
  				from={{ opacity: 0, marginTop: -500}}
  				to={{ opacity: 1 , marginTop: 0}}>
  				{props => <div style={props}><FrontBanner />
				</div>}
				</Spring>

				<Spring
  				from={{ opacity: 0, marginLeft: -500}}
  				to={{ opacity: 1 , marginLeft: 0}}>
  				{props => <div style={props}><ListContainer players={this.state.players} currentPlayerEmail={this.state.currentPlayerEmail}/>
				</div>}
				</Spring>

				<LRC_Container currentPlayerEmail={this.state.currentPlayerEmail} 
				isChallenged = {this.state.isChallenged}
				onLogout = {this.handleLogout} 
				onLogin={this.handleLoginRender}/>
	<marquee className="scrollingText" behavior="scroll" direction="left">Big Bang Meteorang</marquee>

			</div>
*/

	<div class="MainContainer">
				<FrontBanner />


		
				<ListContainer players={this.state.players} currentPlayerEmail={this.state.currentPlayerEmail}/>

				<LRC_Container currentPlayerEmail={this.state.currentPlayerEmail} 
				isChallenged = {this.state.isChallenged}
				onLogout = {this.handleLogout} 
				onLogin={this.handleLoginRender}/>
				<EmojiLegend />
				{deleteButton}


	</div>

		);
	}
}

class EmojiLegend extends React.Component {
	render(){
		return(

		<div className="LegendContainer">
			<div className="Legend">

				<div className="subLegends">
							<ListGroup className="emojis">
								<ListGroup.Item>❗</ListGroup.Item>
					 			<ListGroup.Item>🌶️</ListGroup.Item>
					  			<ListGroup.Item>🔥</ListGroup.Item>
					  			<ListGroup.Item>🌋</ListGroup.Item>
					  		

							</ListGroup>

							
							<ListGroup className="emojis barrier">
								<ListGroup.Item className="topEmoji"> This player is currently challenged.</ListGroup.Item>
					 			<ListGroup.Item> 2-Game Winning Streak</ListGroup.Item>
					  			<ListGroup.Item>3-Game Winning Streak</ListGroup.Item>
					  			<ListGroup.Item>5+ Game Winning Streak</ListGroup.Item>
					  	
							</ListGroup>
				</div>

				<div className="subLegends">
					<ListGroup className="emojis">
					
			  			<ListGroup.Item>⭐</ListGroup.Item>
			  			<ListGroup.Item>🥇</ListGroup.Item>
			  			<ListGroup.Item>🥈</ListGroup.Item>
			  			<ListGroup.Item>🥉</ListGroup.Item>
					</ListGroup>

					
					<ListGroup className="emojis">
						<ListGroup.Item className="topEmoji"> Player with highest streak.</ListGroup.Item>
			 			<ListGroup.Item> First Place</ListGroup.Item>
			  			<ListGroup.Item> Second Place </ListGroup.Item>
			  			<ListGroup.Item> Third Place </ListGroup.Item>
			  			
					</ListGroup>
				</div>



				
			</div>
		</div>


		)
	}
}

class FrontBanner extends React.Component{
	render(){
		return(




			<div class="FrontBannerContainer">
				<Spring
	  				from={{ opacity: 0, marginLeft: -800}}
	  				to={{ opacity: 1 , marginLeft: 0}}>
	  				{props => <div style={props}> <a href="https://www.oracle.com/index.html"><img src={logo} class="myImage"/></a>
     			</div>}
				</Spring>
				<div class="Caption"> Ping Pong Rankings </div>
			</div>
		)
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
		
		let currentEmail = this.state.currentPlayerEmail;

		let functionalBar;
		let isLoggedIn = false;
		if(currentEmail != "null" && currentEmail != null){
			
			isLoggedIn = true;
		}

		


		if(!isLoggedIn){
			functionalBar = 
			<LoginRegisterContainer onLogin={this.handleSuccesfulLogin}/>

		} else {
			functionalBar = 
			<LogoutChallengeWinContainer 
			isChallenged={this.state.isChallenged} 
			currentPlayerEmail={this.state.currentPlayerEmail}
			logout={this.handleLogout} />;
			
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
  			if(this.state.stateNum === 0){
  				this.setState({stateNum: 1});
  			}
  		} else {
  			this.setState({stateNum: 0});
  		}

	}

	constructor(props){
		super(props);

		if(props.isChallenged){
			this.state = {
				stateNum: 1,
				isChallenged: props.isChallenged,
				currentPlayerEmail: props.currentPlayerEmail,
				promise: true
			}
		} else {
			this.state = {
				stateNum: 0,
				isChallenged: props.isChallenged,
				currentPlayerEmail: props.currentPlayerEmail,
				promise: true
			}
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

		/* Attempt to end the match */
		axios.post('http://localhost:4000/concludeMatch', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			
			if(success === null){
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
		axios.post('http://localhost:4000/challengePlayer', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			/* Either the login was succesful, or it failed */
			let success = r.data.success;
			if(success === null || success === undefined){
				/* Display Error Message to User */
				this.setState({
					error: r.data.error
				})
			} else {
				/* Challenge Value will become true, handled by updateList */
				this.setState(() => ({
					stateNum: this.state.stateNum + 1
				}))

				if(this.state.promise){
					this.setState({
						promise: false
					})
				} else {
					this.setState({
						promise: true
					})
				}
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
		const renderTooltip = props => (
  <div
    {...props}
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: '2px 10px',
      color: 'white',
      borderRadius: 3,
      ...props.style,
    }}
  >
    Pressing this will attmept to challenge the player above you in rank placement.
  </div>
);
		let promise = this.state.promise;
		promise = !promise;
		let button;

		if(this.state.stateNum === 0){
			button = (
			<OverlayTrigger
    			placement="right-start"
   				delay={{ show: 250, hide: 400 }}
   			    overlay={renderTooltip}
  				>			
  			<Button onClick = {this.handleChallenge} className="ChallengeButton" variant="primary">Challenge!</Button>

  			</OverlayTrigger>
  			)
		} else if(this.state.stateNum === 1){
			button = <Button className='ChallengeButton' onClick = {this.handleConfirmChallenge}variant="outline-warning">Click Here Only If You Won The Match</Button>
		} else if(this.state.stateNum === 2){
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
			<MyChallenger promise={promise} isChallenged={this.state.isChallenged} currentPlayerEmail={this.state.currentPlayerEmail}/>
			<div className="redText"> {this.state.error} </div>
		</div>
		)
	}
} 

class MyChallenger extends React.Component {


	constructor(props){
		super(props);
		this.state = {
			currentPlayerEmail: props.currentPlayerEmail,
			isChallenged: props.isChallenged,
			promise: props.promise
		}
	}

	componentWillReceiveProps({promise, isChallenged, currentPlayerEmail}) {
		console.log(promise);
	  	this.setState({
	  		currentPlayerEmail: currentPlayerEmail,
	  		isChallenged: isChallenged,
	  		promise: promise
	  	})
	 }

	componentDidMount(){

		console.log("inMatch called!");
	
	
	}

	render(){

		/* Get Opponent Name */
		axios.post('http://localhost:4000/inMatch', 
						{
							email: this.state.currentPlayerEmail
						}
		)
		.then((r) => {
			/* Either they were in a challenge or they were not */
			console.log("The otherPlayer response:");
			console.log(r);
			let inMatch = r.data.inMatch;
			if(inMatch){

				if(r.data.player !== this.state.otherPlayer){
					console.log("1 being called");
					this.setState({
						otherPlayer: r.data.player
					})
				}

			} else {

				if(this.state.otherPlayer !== null){
					console.log("2 being called");
					this.setState({
						otherPlayer: null
					})
				}
			}
		})
		.catch(e => console.error(e))

		let email = this.state.currentPlayerEmail;
		let isChallenged = this.state.isChallenged;
		let result;
		let otherPlayer = this.state.otherPlayer;
		if(email!==null){
			if(isChallenged) {
				 result = (
				 <div>
				<div class="alertContainer">
					<Alert variant="secondary" className="myAlert"> You are currently scheduled to play: {otherPlayer}</Alert>
				</div>
					<ProgressBar variant='danger' animated now={100} />
				</div>
				)
				} else {
					result = <div></div>
				}
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