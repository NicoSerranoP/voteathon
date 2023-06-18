import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import VoteathonIconBlack from '../../assets/logo-black.svg'
import PathCheckIcon from '../../assets/path-check.svg'
import VotingModal from './VotingModal'

type Props = {
    projectId: number
    projectName: string
}

const VoteSection = ({ projectId, projectName }: Props) => {
    const [alreadyVoted, setAlreadyVoted] = useState(true)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const alreadyVoted = localStorage.getItem('alreadyVoted')
        if (!alreadyVoted) {
            setAlreadyVoted(false)
        } else {
            setAlreadyVoted(true)
        }
    }, [])

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
                        onDeselect={() => setOpen(false)}
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
