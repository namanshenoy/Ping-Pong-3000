import React from 'react';
import {Spring} from 'react-spring/renderprops';

class Component1 extends React.Component {

	render(){
		return(
			<Spring
  				from={{ opacity: 0, marginLeft: -500}}
  				to={{ opacity: 1 , marginLeft: 0}}>
  				{props => <div style={props}>hello</div>}
			</Spring>
		)
	}

}

export default Component1