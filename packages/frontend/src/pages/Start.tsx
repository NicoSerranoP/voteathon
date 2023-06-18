import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import './start.css'
import logo from '../assets/voteathon-emblem.png'

import User from '../contexts/User'
import { styled } from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'

const DEFAULT_CLAIM_CODE = 'FILL-ME'
const CLAIM_CODE_REGEX = /^\w+-\w+/

export default observer(() => {
    const navigate = useNavigate()
    const userContext = React.useContext(User)
    const { claimCode: claimCodeParam } = useParams()
    const [claimCode, setClaimCode] = useState(claimCodeParam ?? '')
    const [claimCodeError, setClaimCodeError] = useState<string | null>(null)
    const [claimingMessage, setClaimingMessage] = useState<string | null>(null)

    const handleClaimCodeChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const claimCode = event.target.value
        setClaimCode(claimCode)

        const isClaimCodeValid =
            CLAIM_CODE_REGEX.test(claimCode) && claimCode != DEFAULT_CLAIM_CODE
        if (!isClaimCodeValid) {
            setClaimCodeError('Claim code should be in the format of WORD-WORD')
        } else {
            setClaimCodeError(null)
        }
    }

    const handleClaimCodeClick = async () => {
        if (!userContext.userState) return
        setClaimingMessage(
            'Adding you to your project &  redirecting you to the voting page. This might take a while...'
        )
        const { projectID } = await userContext.signup(claimCode)
        localStorage.setItem('projectID', `${projectID}`)
        if (projectID >= 0) {
            await userContext.joinProject(projectID)
        }
        navigate('/projects')
        setClaimingMessage(null)
    }

    return (
        <Container>
            <LeftContainer>
                <MainTitle style={{ fontWeight: '800' }}>
                    voteathon is built for hackers by the hackers.
                </MainTitle>
                <MainTitle style={{ fontSize: '18px' }}>
                    How does it work?
                </MainTitle>

                <List>
                    <li>Claim your ID</li>
                    <li>Join the project that you are a part of</li>
                    <li>Vote for the project you like</li>
                    <li>Wait for the final result</li>
                    <li>Claim the reward</li>
                </List>
            </LeftContainer>
            <RightContainer>
                <img src={logo} alt="voteathon logo" width="150px" />
                <MainTitle style={{ textAlign: 'start' }}>
                    Please Enter your full name to claim the ID
                </MainTitle>
                <Input
                    type="text"
                    id="claimCode"
                    value={claimCode}
                    onChange={handleClaimCodeChange}
                    disabled={!userContext.userState || !!claimingMessage}
                    placeholder={DEFAULT_CLAIM_CODE}
                />
                {claimCodeError && (
                    <p style={{ fontSize: '11px', width: '100%' }}>
                        {claimCodeError}
                    </p>
                )}
                {claimingMessage ? (
                    <SuccessMessage>{claimingMessage}</SuccessMessage>
                ) : (
                    <Button onClick={handleClaimCodeClick}>
                        {userContext.userState ? 'Claim' : 'Initializing...'}
                    </Button>
                )}
            </RightContainer>
        </Container>
    )
})

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    background-image: url('/yellow-curve-bg.png');
    background-size: contain;
    background-repeat: no-repeat;
    width: 100%;
    height: 100vh;
    color: #151616;
`

const LeftContainer = styled.div`
    color: #151616;
    height: 100%;
    max-width: 400px;
    padding-left: 30px;
    font-size: 1.1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
`

const List = styled.ol`
    display: flex;
    flex-direction: column;
    letter-spacing: 1px;
    font-size: 0.7em;
    font-weight: 300;
    gap: 15px;
`

const RightContainer = styled.div`
    color: #fff;
    padding-right: 30px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const MainTitle = styled.p`
    font-size: 26px;
    font-weight: 600;
    line-height: 1.1em;
`

const Input = styled.input`
    color: inherit;
    font-family: inherit;
    letter-spacing: 1px;
    border: 1px solid #fff;
    border-radius: 5px;
    background: transparent;
    text-align: start;
    padding-block: 10px;
    padding-inline: 10px;
    margin-bottom: 7px;
`

const Button = styled.button`
    cursor: pointer;
    border: none;
    border-radius: 20px;
    font-weight: 600;
    font-family: inherit;
    margin-top: 25px;
    padding-block: 10px;
    padding-inline: 40px;
`

const SuccessMessage = styled.p`
    padding-block: 7px;
    padding-inline: 20px;
    background: #a6e275;
    color: #151616;
    font-size: 10px;
    font-weight: 500;
`
