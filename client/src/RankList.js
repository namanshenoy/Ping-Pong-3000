import React from 'react';
import Table from 'react-bootstrap/Table';
import Spring from 'react-spring/renderprops';

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

			<Spring
  				from={{ opacity: 0, marginLeft: -500}}
  				to={{ opacity: 1 , marginLeft: 0}}>
  				{props => <div style={props}>hello</div>}
			</Spring>
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
  				{props => <div style={props}>hello</div>}
		</Spring>
		
		);
	}

	GenerateList(array, currentPlayerEmail){
		let email = currentPlayerEmail;
		let res = [];
		let i = -1;
		array.map((player)=>
			
			{
				i = i + 1;
				let pushMe;
				let emojis;
				if(email!==player.email){

					if(i==0){
						emojis = '👑' ;
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

					if(player.winStreak == 1){
						emojis += '⬆️';
					}

					if(player.winStreak > 1){
						emojis += '🔥';
					}

					
					pushMe = <tr><td> {player.rank} </td>
								 <td> {player.name} {emojis} </td>
								 <td> {player.wins} </td>
								 <td> {player.losses} </td>
								 <td> {player.ratio} </td> </tr>

					
					res.push(pushMe)
				} else {
						if(i==0){
						emojis = '👑' ;
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

					if(player.winStreak == 1){
						emojis += '⬆️';
					}

					if(player.winStreak > 1){
						emojis += '🔥';
					}

					
					pushMe = <tr className='currentPlayer'><td className='currentPlayer'> {player.rank} </td>
								 <td> {player.name} {emojis} </td>
								 <td> {player.wins} </td>
								 <td> {player.losses} </td>
								 <td> {player.ratio} </td> </tr>
					

					res.push(pushMe)
				}
			}
		)


		return res;
	}
}



export default ListContainer;