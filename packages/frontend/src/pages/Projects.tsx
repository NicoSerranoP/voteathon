import { styled } from 'styled-components'
import Header from '../components/Header'
import Row from '../components/projects/Row'
import TopDescription from '../components/projects/TopDescription'

const Projects = () => {
    const projects = [1, 2, 3, 4, 5]

    return (
        <div>
            <Header />
            <Container>
                <TopDescription />
                {projects.map((project, i) => (
                    <Row key={'project-' + i} index={i} project={project}></Row>
                ))}
            </Container>
        </div>
    )
}

const Container = styled.div`
    max-width: 70%;
    margin: auto;
`

export default Projects
