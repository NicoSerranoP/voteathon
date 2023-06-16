import { useState } from 'react'
import { styled } from 'styled-components'
import { END_DATE, START_DATE } from '../../constants'

const startHour = new Date(START_DATE).toLocaleTimeString('en-US')
const startDay = new Date(START_DATE).getDate()
const startMonth = new Date(START_DATE).toLocaleString('default', {
    month: 'long',
})
const endHour = new Date(END_DATE).toLocaleTimeString('en-US')
const endDay = new Date(END_DATE).getDate()
const endMonth = new Date(END_DATE).toLocaleString('default', { month: 'long' })

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
            <BlockText>
                <Description>
                    {isVotingTime
                        ? `Total of ${numberOfProjects} projects. Only 1 vote per person and you can’t vote on your project.`
                        : `${numberOfVoters} people voted.`}
                </Description>
                <Highlight>
                    {isVotingTime
                        ? `Voting ends: hh:mm:ss`
                        : `Voting starts at: ${startMonth} ${startDay}, ${startHour}. Close at: ${endMonth} ${endDay}, ${endHour}.`}
                </Highlight>
                <BlockDescription>
                    {isVotingTime
                        ? 'Voting started. LFG'
                        : isResultTime &&
                          'You already voted. Let’s wait for results.'}
                </BlockDescription>
            </BlockText>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const BlockText = styled.div`
    max-width: 70%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const Title = styled.h1`
    margin: 0px;
`

const Description = styled.p`
    margin-block: 12px;
    line-height: 16px;
`

const Highlight = styled.p`
    margin-block: 5px;
    font-weight: 800;
    line-height: 16px;
`

const BlockDescription = styled.h5`
    margin: 0px;
    margin-top: 10px;
    color: #000000;
    background: #fcfcfc;
    padding-inline: 10px;
    padding-block: 10px;
`

export default TopDescription
