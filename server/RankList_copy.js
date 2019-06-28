import React from 'react';
import Table from 'react-bootstrap/Table';
import socketIOClient from 'socket.io-client'


/* Simulating API CALL here */
class ListContainer extends React.Component{

	constructor(props){
		super(props)
		this.state = {
			players: [],
			endpoint: 'http://127.0.0.1:4001'
		}
	}


	componentDidMount(){
		const { endpoint } = this.state

		const socket = socketIOClient(endpoint)

socket.on("updatePlayers", data => {
    console.log('Updating from socket: ' + data)
    let testPlayer = [];
    this.players = []
    let json = data
    
    
    json.map((person)=>{
        let dummyPlayer=
            {name: person.name, rank: person.rank}
        
        testPlayer.push(dummyPlayer)
    })

    this.setState({
        players: testPlayer
    })
    this.setState({ response: data})
})


	// 	let testPlayer = [];
	// 	fetch('http://localhost:8080/getPlayers')
	// 	.then(res => res.json())
	// 	.then(json => {
	// 		json.players.map((person)=>{
	// 			let dummyPlayer= {name: person.name, rank: person.rank}
	// 			testPlayer.push(dummyPlayer)
	// 		})

	// 		this.setState({
	// 			players: testPlayer
	// 		})
	// 	});

	// }
}

	render(){
		return(
			<div className="ListContainer">
				<RankList currentPlayer={this.props.currentPlayer} players={this.state.players} />
			</div>
		);
	}
}

class RankList extends React.Component{

	constructor(props){
		super(props);
	}

	render(){
		return(
		<div className='wrap-table-scroll-y'>
			<Table striped bordered hover variant="dark">
			  <thead>
			    <tr>
			      <th>Rank</th>
			      <th>Name</th>
			    </tr>
			  </thead>
			  <tbody>
			  	{this.GenerateList(this.props.players, this.props.currentPlayer)}
			  </tbody>
			</Table>
		</div>
		);
	}

	// GenerateList(array, currentPlayer){
	// 	console.log(currentPlayer);
	// 	let name = currentPlayer;
	// 	return array.map((player)=>
	// 		<tr>

	// 			<td> {player.rank} </td>
	// 			<td> {player.name} </td>

	// 		</tr>
	// 	)
	// }

	GenerateList(array, currentPlayer){
		let name = currentPlayer;
		let res = [];
		array.map((player)=>
			
			{
				if(name!==player.name){
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