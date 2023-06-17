import { styled } from 'styled-components'
import VoteSection from './VoteSection'

type Props = {
    index: number
    project: any
}

const Row = ({ index }: Props) => {
    return (
        <Container>
            <LeftContainer>
                <h3>Project Name {index}</h3>
                <p>Here goes the project description</p>
            </LeftContainer>
            <VoteSection />
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    border: 3px solid #fff294;
    min-height: 190px;
    margin-block: 15px;
    gap: 12px;
`

const LeftContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    padding: 10px;
`

export default Row
