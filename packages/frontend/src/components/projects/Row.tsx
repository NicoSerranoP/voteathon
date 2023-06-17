import { styled } from 'styled-components'
import VoteSection from './VoteSection'

type Props = {
    index: number
    project: any
}

const Row = ({ index }: Props) => {
    return (
        <Container>
            <h3>Project Name {index}</h3>
            <VoteSection />
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    border: 3px solid #fff294;
    margin-block: 15px;
    gap: 12px;
`

export default Row
