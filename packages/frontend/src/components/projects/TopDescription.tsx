import { useState } from 'react'
import { styled } from 'styled-components'

const TopDescription = () => {
    // TODO: get the epoch start & epoch end
    // to calculate how long would it take to finish voting
    const [isVotingTime, setIsVotingTime] = useState(false)
    const [isResultTime, setIsResultTime] = useState(true)
    const [numberOfProjects, setNumberofProjects] = useState(7)
    const [numberOfVoters, setNumberOfVoters] = useState(32)
    return (
        <Container>
            <Title>{isVotingTime ? 'Projects' : 'Voting result'}</Title>
            <Description>
                {isVotingTime
                    ? `Total of ${numberOfProjects} projects. Only 1 vote per person and you can’t vote on your project.`
                    : `${numberOfVoters} people voted.`}
            </Description>
            <Highlight>
                {isVotingTime
                    ? `Voting ends: hh:mm:ss`
                    : `Voting starts at: Date. Close at: Date`}
            </Highlight>
            <BlockDescription>
                {isVotingTime
                    ? 'Voting started. LFG'
                    : isResultTime &&
                      'You already voted. Let’s wait for result.'}
            </BlockDescription>
        </Container>
    )
}

const Title = styled.h1`
    margin: 0px;
`

const Description = styled.p`
    margin-block: 12px;
    max-width: 70%;
    line-height: 16px;
    text-align: center;
`

const Highlight = styled.p`
    margin-block: 5px;
    font-weight: 800;
`

const BlockDescription = styled.h5`
    margin: 0px;
    margin-top: 10px;
    color: #000000;
    background: #fcfcfc;
    padding-inline: 10px;
    padding-block: 10px;
`

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

export default TopDescription
