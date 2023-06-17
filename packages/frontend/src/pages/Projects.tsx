import { styled } from 'styled-components'
import Header from '../components/Header'
import Row from '../components/projects/Row'
import TopDescription from '../components/projects/TopDescription'

const Projects = () => {
    // TODO: read from contract directly
    const projects = [
        {
            id: 0,
            name: 'Hack All Da IPs',
            description: 'Hack the planet',
            challenge: 'Will it blend?',
            deliverables: 'Stuxnet executable',
            repoUrl:
                'https://github.com/EnterpriseQualityCoding/FizzBuzzEnterpriseEdition',
            members: [
                {
                    participantId: 2,
                },
            ],
        },
        {
            id: 1,
            name: 'Beaknet',
            description: 'Skynet, but with Furbies',
            challenge: 'What if AI was soft & cute?',
            deliverables: 'Fluffy extinction',
            repoUrl:
                'https://github.com/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            members: [
                {
                    participantId: 3,
                },
                {
                    participantId: 4,
                },
            ],
        },
    ]

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
