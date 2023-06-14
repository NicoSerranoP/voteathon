import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './start.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import logo from '../assets/voteathon-emblem.png';

import User from '../contexts/User'
// import imageName from '../../public/yellow-curve-bg.png';

export default observer(() => {
    const userContext = React.useContext(User)
    const [claimCode, setClaimCode] = useState('TEST-TEST')
    const [claimCodeError, setClaimCodeError] = useState(true)

    const handleClaimCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const regex = /^\w+-\w+/
        setClaimCode(event.target.value)
        if (regex.test(event.target.value) && event.target.value != "TEST-TEST") {
            setClaimCodeError(false)
        } else {
            setClaimCodeError(true)
        }
    }

    // if (!userContext.userState) {
    //     return (
    //     <div className="container">
    //         Loading...
    //     </div>
    //     )
    // }

    return (
        <div className="main-container" style={{ backgroundImage: `url("/yellow-curve-bg.png")` }}>
            <div className="right-container">
                <img src={logo} alt="voteathon" />

                <div className="info-title">
                    Please Enter your full name to claim the ID
                </div>
            </div>

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
        </div>
    )
})
