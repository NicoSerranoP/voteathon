import { styled } from 'styled-components'
import { Project } from '../../types/projects'
import VoteSection from './VoteSection'

type Props = {
    index: number
    project: Project
}

const Row = ({ index, project }: Props) => {
    return (
        <Container>
            <LeftContainer>
                <h3>{`${index + 1}: ${project.name}`}</h3>
                <p>{project.description}</p>
                <BoldText>{project.challenge}</BoldText>
            </LeftContainer>
            <VoteSection projectId={project.id} />
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

const BoldText = styled.h5`
    font-weight: 500;
`

export default Row
