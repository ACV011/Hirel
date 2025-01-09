import React from "react";
import './Inputicon.css';

function Inputicon(props) {
    return (
        <div className="inputicon">
            <label>{props.text}</label>
            <div className="inputicon_main">
                <input type={props.type}
                    name={props.name}
                    placeholder={props.placeholder}
                    onChange={props.onChange} />
                <img className="inputicon_img" src={props.image} alt={props.type} />
            </div>
        </div>
    );
}

export default Inputicon;