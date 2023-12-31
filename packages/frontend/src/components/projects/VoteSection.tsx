import User from '../../contexts/User'
import { useEffect, useState, useContext } from 'react'
import { styled } from 'styled-components'
import VoteathonIconBlack from '../../assets/logo-black.svg'
import PathCheckIcon from '../../assets/path-check.svg'
import VotingModal from './VotingModal'
import Voteathon from '../../contexts/Voteathon'

type Props = {
    projectId: number
    projectName: string
}

const VoteSection = ({ projectId, projectName }: Props) => {
    const voteathonContext = useContext(Voteathon)
    const userContext = useContext(User)
    const [alreadyVoted, setAlreadyVoted] = useState(true)
    const [isResultTime, setIsResultTime] = useState(false)
    const [open, setOpen] = useState(false)

    const syncAlreadyVoted = () => {
        const alreadyVoted = localStorage.getItem('alreadyVoted')
        if (!alreadyVoted) {
            setAlreadyVoted(false)
        } else {
            setAlreadyVoted(true)
        }
    }

    useEffect(() => {
        syncAlreadyVoted()
    }, [])

    useEffect(() => {
        const seconds =
            userContext.userState?.sync.calcEpochRemainingTime() || 0
        if (seconds <= 0) {
            setIsResultTime(true)
        }

        console.log(voteathonContext.contract.scores)
    }, [userContext])

    // TODO re-add in
    /**
     *             {isResultTime ? (
                <>
                    <Container style={{ color: '#151616', fontWeight: '800' }}>
                        # votes
                    </Container>
                </>
            ) : (
                <>
     */

    const handleVoteClick = () => {
        setOpen(true)
    }

    return (
        <>
            {alreadyVoted ? (
                <Container
                    style={{
                        background: 'transparent',
                        textAlign: 'center',
                    }}
                >
                    <img src={PathCheckIcon} width={'20px'} />
                    <p style={{ lineHeight: '15px' }}>You already voted.</p>
                </Container>
            ) : (
                <Container>
                    <img src={VoteathonIconBlack} width={'90px'} />
                    <Button onClick={handleVoteClick}>Vote for me</Button>
                    <VotingModal
                        open={open}
                        projectId={projectId}
                        projectName={projectName}
                        onDeselect={() => {
                            setOpen(false)
                            syncAlreadyVoted()
                        }}
                    />
                </Container>
            )}
        </>
    )
}

const Container = styled.div`
    display: flex;
    background: #ffe94d;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: 12px;
`

const Button = styled.button`
    cursor: pointer;
    background: #fcfcfc;
    border-radius: 10px;
    border: none;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
    font-weight: 500;
`

export default VoteSection
