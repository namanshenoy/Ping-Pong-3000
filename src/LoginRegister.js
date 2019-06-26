import React from 'react';
import Table from 'C:/Users/sverduzc/node_modules/react-bootstrap/Table';
import Button from 'C:/Users/sverduzc/node_modules/react-bootstrap/Button';
import Form from 'C:/Users/sverduzc/node_modules/react-bootstrap/Form';


class LoginRegisterContainer extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			tryLogin: false,
			tryRegister: false
		}
		this.loginClick = this.loginClick.bind(this);
		this.registerClick = this.registerClick.bind(this);
	}

	loginClick(){
		this.setState({tryLogin: true,
					   tryRegister: false
		})

		/* remove this, this automatically signs in on click */
		this.props.onLogin();

	}

	registerClick(){
		this.setState({tryRegister: true,
				       tryLogin: false
		})
	}

	render(){

		let form;

		if(this.state.tryLogin == true){
			form = <Login />
		}

		if(this.state.tryRegister == true){
			form = <Register />
		}

		return(
			<div class="FormsContainer">
				<div class='LoginRegisterButtonContainer'>
					<Button onClick={this.loginClick} variant="success" className="myButton"> Login </Button>
					<Button onClick={this.registerClick} variant="primary" className="myButton">Register</Button>
				</div>
				
				{form}
			</div>
		)
	}
}

function Login(props){
	return (
	<Form className = "myForms">
	    <Form.Group controlId="formBasicEmail">
		    <Form.Label>Email address</Form.Label>
		    <Form.Control type="email" placeholder="Enter email" />
	    </Form.Group>

	    <Form.Group controlId="formBasicPassword">
		    <Form.Label>Password</Form.Label>
		    <Form.Control type="password" placeholder="Password" />
	    </Form.Group>
  	  	<Button variant="secondary" type="submit">
    	Submit
    	</Button>
	</Form>
	)
}

function Register(props){
	return (
	<Form className="myForms">
	    <Form.Group controlId="formBasicDisplayName">
		    <Form.Label>Display Name</Form.Label>
		    <Form.Control type="displayname" placeholder="Enter A Super Cool Display Name" />
	    </Form.Group>

	     <Form.Group controlId="formBasicEmail">
		    <Form.Label>Email</Form.Label>
		    <Form.Control type="email" placeholder="Enter Oracle Email" />
	    </Form.Group>

	    <Form.Group controlId="formBasicPassword">
		    <Form.Label>Password</Form.Label>
		    <Form.Control type="password" placeholder="Password" />
	    </Form.Group>
  	  	<Button variant="secondary" type="submit">
    	Submit
    	</Button>
	</Form>
	)
}

export default LoginRegisterContainer;