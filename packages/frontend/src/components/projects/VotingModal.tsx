import React, { useState } from 'react'
import Modal from 'react-modal'
import { styled } from 'styled-components'
import VoteathonIconBlack from '../../assets/logo-black.svg'
import User from '../../contexts/User'

type Props = {
    open: boolean
    projectId: number
    projectName: string
    onDeselect: () => void
}

const VotingModal = ({ open, projectId, projectName, onDeselect }: Props) => {
    const userContext = React.useContext(User)

    const [voting, setVoting] = useState(false);
    const [voteComplete, setVoteComplete] = useState(false);

    const handleVoteClick = async () => {
        setVoting(true);
        try {
            const thumbsUpEmoji = 0
            await userContext.vote(projectId, thumbsUpEmoji)
            setVoteComplete(true)
            localStorage.setItem('alreadyVoted', 'true')
        } catch (err) {
            console.error(err)
        }
        setVoting(false)
    };

    const getVotingMessage = (): string => {
        if (voting) {
            return 'Submitting vote...'
        }
        if (voteComplete) {
            return 'Vote Submtted!'
        }

        return 'Are you sure to vote on this project?'
    }

    return (
        <StyledModal
            isOpen={open}
            onRequestClose={onDeselect}
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                    overflowY: 'scroll',
                },
            }}
        >
            <img
                src={VoteathonIconBlack}
                width={'90px'}
                style={{ margin: 'auto' }}
            />
            <h2 style={{ marginBottom: '5px' }}>
                {getVotingMessage()}
            </h2>
            <p style={{ marginBottom: '15px' }}>
                {projectName} - id: {projectId}
            </p>
            {!voteComplete && <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                }}
            >
                <Button disabled={voting} onClick={handleVoteClick}>Yes</Button>
                <Button disabled={voting} onClick={onDeselect}>No</Button>
            </div>}
        </StyledModal>
    )
}

const StyledModal = styled(Modal)`
    cursor: auto;
    background: rgba(255, 233, 77, 0.9);
    color: #151616;
    blocksize: 'fit-content';
    width: 50%;
    border: none;
    padding-block: 10px;
    padding-inline: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
`

const Button = styled.button`
    cursor: pointer;
    background: #151616;
    color: #fcfcfc;
    border-radius: 10px;
    border: none;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
    font-weight: 500;
`

export default VotingModal
