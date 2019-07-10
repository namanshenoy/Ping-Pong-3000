import React from 'react';
import Table from 'react-bootstrap/Table';
import {Spring} from 'react-spring/renderprops';

/* Simulating API CALL here */

class ListContainer extends React.Component{

	componentWillReceiveProps({players, currentPlayerEmail}) {
  		this.setState({players: players,
  					   currentPlayerEmail: currentPlayerEmail
  			})
	}

	constructor(props){
		super(props)
		this.state = {
			players: this.props.players,
			currentPlayerEmail: props.currentPlayerEmail
		}
	}

	render(){
		return(
			
  			 <div  class="ListContainer">
				<RankList currentPlayerEmail={this.state.currentPlayerEmail} players={this.state.players} />
			</div>
		
			
		);
	}
}

class RankList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			players: props.players,
			currentPlayerEmail: props.currentPlayerEmail
		}
	}

	componentWillReceiveProps({currentPlayerEmail, players}) {
  		this.setState({players: players,
  					   currentPlayerEmail: currentPlayerEmail
  			})
	}

	render(){
		return(

	
		<Spring
  				from={{ opacity: 0, marginTop: -1000}}
  				to={{ opacity: 1 , marginTop: 0}}>
  				{props => <div style={props} className='wrap-table-scroll-y'>
			
			<Table striped bordered hover className="myTable">
			  <thead>
			    <tr>
			      <th className="Rank tableItem header">Rank</th>
			      <th className="tableItem header">Name</th>
			      <th className="tableItem header">Wins</th>
			      <th className="tableItem header">Losses</th>
			      <th className="tableItem header"> W/L Ratio</th>
			    </tr>
			  </thead>
			  <tbody>
			  	{this.GenerateList(this.state.players, this.state.currentPlayerEmail)}
			  </tbody>
			</Table>
		</div>}
			</Spring>	
			
		
		);
	}

	GenerateList(array, currentPlayerEmail){
		console.log("Logging players");
		console.log(array);
		let email = currentPlayerEmail;
		let res = [];
		let i = -1;
		array.map((player)=>
			
			{
				i = i + 1;
				let pushMe;
				let emojis;
				if(email!==player.email){

					if(i>2){
						emojis = '';
					}

					if(i==0){
						emojis = '🥇' ;
					}

					if(i==1){
						emojis = '🥈';
					}

					if(i==2){
						emojis = '🥉';
					}

					if(player.winStreak === 2){
						emojis += '🌶️';
					}

					if(player.winStreak === 3 || player.winStreak === 4){
						emojis += '🔥';
					}

					if(player.winStreak > 4){
						emojis += '🌋';
					}

					if(player.inMatch){
						emojis += '❗';
					}

					
					pushMe = <tr><td className="tableItem"> {player.rank} </td>
								 <td className="tableItem"> {player.name} {emojis} </td>
								 <td className='tableItem'> {player.wins} </td>
								 <td className='tableItem'> {player.losses} </td>
								 <td className='tableItem'> {this.myFixed(player.ratio)} </td> </tr>

					
					res.push(pushMe)
				} else {

					console.log("CALL ME!");
					if(i==0){
						emojis = '🥇' ;
					}

					if(i==1){
						emojis = '🥈';
					}

					if(i==2){
						emojis = '🥉';
					}

					if(i>2){
						emojis = '';
					}

					if(player.winStreak === 2){
						emojis += '🌶️';
					}

					if(player.winStreak === 3 || player.winStreak === 4){
						emojis += '🔥';
					}

					if(player.winStreak > 4){
						emojis += '🌋';
					}

					if(player.inMatch){
						emojis += '❗';
					}

					
					pushMe = <tr className='tableItem'><td className='currentPlayerRank'> {player.rank} </td>
								 <td className='tableItem currentPlayer'> {player.name} {emojis} </td>
								 <td className='tableItem currentPlayer'> {player.wins} </td>
								 <td className='tableItem currentPlayer'> {player.losses} </td>
								 <td className = 'tableItem currentPlayer'> {this.myFixed(player.ratio)} </td> </tr>
					res.push(pushMe)
				}
			}
		)


		return res;
	}

	myFixed(x){
		if(x===null || x===undefined){
			return 0;
		}

		return x.toFixed(2);
	}
	
}





export default ListContainer;