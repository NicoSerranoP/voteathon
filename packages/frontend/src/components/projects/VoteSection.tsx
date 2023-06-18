import { useState } from 'react'
import { styled } from 'styled-components'
import VoteathonIconBlack from '../../assets/logo-black.svg'
import VotingModal from './VotingModal'

type Props = {
    projectId: number
    projectName: string
}

const VoteSection = ({ projectId, projectName }: Props) => {
    const [open, setOpen] = useState(false)

    const handleVoteClick = () => {
        setOpen(true)
    }

    return (
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
