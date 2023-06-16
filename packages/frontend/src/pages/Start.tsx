import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './start.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'

import User from '../contexts/User'

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
        <>
            <div className="bg">
                <img
                    src={require('../../public/hummingbird.svg')}
                    alt="hummingbird at a flower"
                />
            </div>
            <div className="content">
                <div style={{ fontSize: '70px', fontWeight: '600' }}>
                    Congratulations
                </div>
                <div className="attester">
                    <div style={{ marginRight: '12px' }}>
                        You have created a new UniRep attester{' '}
                    </div>
                    <Tooltip text="Attesters define their own data systems and are able to attest to users, giving them data." />
                </div>
                <p>
                    Clicking 'Join' adds a user to this attester's membership
                    group.
                </p>
                <div className="join">
                    {!userContext.hasSignedUp ? (
                        <>
                            <div>
                                <label htmlFor="claimCode">Claim Code:</label>
                                <input type="text" id="claimCode" value={claimCode} onChange={handleClaimCodeChange} />
                                {claimCodeError && <div className="error">Claim code should be in the format of WORD-WORD</div>}
                            </div>
                            <Button
                                onClick={async () => {
                                    if (!userContext.userState || claimCodeError) return
                                    const { projectID } = await userContext.signup(claimCode)
                                    await userContext.joinProject(projectID)
                                }}
                            >
                                {userContext.userState ? 'Join' : 'Initializing...'}
                                <span style={{ marginLeft: '12px' }}>
                                    <img
                                        src={require('../../public/arrow.svg')}
                                        alt="right arrow"
                                    />
                                </span>
                            </Button>
                        </>
                    ) : (
                        <div>
                            <p
                                style={{
                                    fontWeight: '400',
                                    lineHeight: '.5em',
                                }}
                            >
                                USER ADDED!
                            </p>
                            <Link to="/dashboard">
                                <Button>
                                    Dashboard
                                    <span style={{ marginLeft: '12px' }}>
                                        <img
                                            src={require('../../public/arrow.svg')}
                                            alt="right arrow"
                                        />
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
                <p>
                    After joining, the member can interact with data in the
                    attester's application.{' '}
                </p>
                <p>
                    Customize this landing page to onboard new users to your
                    app.
                </p>
            </div>
        </>
    )
})
