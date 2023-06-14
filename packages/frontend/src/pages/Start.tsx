import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './start.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import logo from '../images/voteathon-emblem.png';

import User from '../contexts/User'
// import imageName from '../../public/yellow-curve-bg.png';

export default observer(() => {
    const userContext = React.useContext(User)

    // if (!userContext.userState) {
    //     return (
    //     <div className="container">
    //         Loading...
    //     </div>
    //     )
    // }

    return (
        <div className="main-container" style={{ backgroundImage: `url("/yellow-curve-bg.png")` }}>
            <div className="title">
                voteathon is built for hackers by the hackers.
            </div>

            <div className="info">
                <div className="list-title">How does it work?</div>

                <ol>
                    <li>Claim your ID</li>
                    <li>Join the project that you are a part of</li>
                    <li>Vote for the project you like</li>
                    <li>Wait for the final result</li>
                    <li>Claim the reward</li>
                </ol>
            </div>

            <div className="right-container">
                <img src={logo} alt="voteathon" />
            </div>
        </div>
    )
})
