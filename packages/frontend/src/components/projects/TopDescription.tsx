import User from '../../contexts/User'
import { useContext, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { END_DATE, START_DATE } from '../../constants'
import data from '../../../../../projects-partipants.json'

const startHour = new Date(START_DATE).toLocaleTimeString('en-US')
const startDay = new Date(START_DATE).getDate()
const startMonth = new Date(START_DATE).toLocaleString('default', {
    month: 'long',
})
const endHour = new Date(END_DATE).toLocaleTimeString('en-US')
const endDay = new Date(END_DATE).getDate()
const endMonth = new Date(END_DATE).toLocaleString('default', { month: 'long' })

const TopDescription = () => {
    const userContext = useContext(User)
    // to calculate how long would it take to finish voting
    const [isVotingTime, setIsVotingTime] = useState(false)
    const [isResultTime, setIsResultTime] = useState(false)
    const [votingEnds, setVotingEnds] = useState('hh:mm:ss')
    const [numberOfProjects, setNumberofProjects] = useState(7)
    const [numberOfVoters, setNumberOfVoters] = useState(32)

    const countDownInit = () => {
        setInterval(() => {
            const seconds =
                userContext.userState?.sync.calcEpochRemainingTime() || 0

            // 1 epoch = 300 seconds. It is configured in contracts/scripts/deploy.ts
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            const remainingSeconds = seconds % 60

            setVotingEnds(`
                ${hours.toString().padStart(2, '0')}:
                ${minutes.toString().padStart(2, '0')}:
                ${remainingSeconds.toString().padStart(2, '0')}
            `)
            if (seconds > 0) {
                setIsVotingTime(true)
            }
            if (numberOfVoters > 0) {
                setIsResultTime(true)
            }
            // TODO: get the number of voters
        }, 1000)
    }

    useEffect(() => {
        if (!userContext) return

        setNumberofProjects(data.projects.length - 1) // project -1 does not count
        countDownInit()
    }, [])

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
                    ? `Voting ends: ${votingEnds}`
                    : `Voting starts at: ${startMonth} ${startDay}, ${startHour}. Close at: ${endMonth} ${endDay}, ${endHour}.`}
            </Highlight>
            <BlockDescription>
                {isVotingTime
                    ? 'Voting started. LFG'
                    : isResultTime
                    ? 'You already voted. Let’s wait for results.'
                    : 'Wait for voting to start.'}
            </BlockDescription>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
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
