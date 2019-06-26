import React from 'react';
import Carousel from '/react-bootstrap/Carousel';
import logo from './Images/front.jpg';


class SlidingCarousel extends React.Component {

	render(){
		return(

			<Carousel className="test"> {this.GenerateMessage(this.props.messages)} </Carousel>

		)
	}

	GenerateMessage(array){
		return array.map((entry)=>
			<Carousel.Item>
			    <img
			      className="d-block w100"
			      src={logo}
			      alt="First slide"
			    />
			    <Carousel.Caption>
			      <h3>{entry.title}</h3>
			      <p>{entry.message}</p>
			    </Carousel.Caption>
		    </Carousel.Item>
			)
	}
}

export default SlidingCarousel;