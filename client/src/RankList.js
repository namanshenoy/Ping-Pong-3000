import React from 'react';
import Table from 'react-bootstrap/Table';


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


	componentDidMount(){

	}

	render(){
		return(
			<div class="ListContainer">
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
		<div class='wrap-table-scroll-y'>
			<Table striped bordered hover>
			  <thead>
			    <tr>
			      <th>Rank</th>
			      <th>Name</th>
			    </tr>
			  </thead>
			  <tbody>
			  	{this.GenerateList(this.state.players, this.state.currentPlayerEmail)}
			  </tbody>
			</Table>
		</div>
		);
	}

	GenerateList(array, currentPlayerEmail){
		let email = currentPlayerEmail;
		let res = [];
		array.map((player)=>
			
			{
				if(email!==player.email){
				res.push(<tr>
				<td> {player.rank} </td>
				<td> {player.name} </td>
				</tr>)
				} else {
					res.push(<tr>
				<td className="currentPlayer"> {player.rank} </td>
				<td className="currentPlayer"> {player.name} </td>
				</tr>)
				}
			}
		)


		return res;
	}
}



export default ListContainer;