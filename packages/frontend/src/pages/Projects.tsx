import { styled } from 'styled-components'
import Header from '../components/Header'
import Row from '../components/projects/Row'
import TopDescription from '../components/projects/TopDescription'
import data from '../../../../projects-partipants.json'
import { useEffect, useState } from 'react'
import { Project } from '../types/projects'

const Projects = () => {
    const [shownProjects, setShownProjects] = useState<Project[]>([])

    useEffect(() => {
        const { projects } = data
        projects.shift()
        setShownProjects(projects)
    }, [])

    return (
        <div>
            <Header />
            <Container>
                <TopDescription />
                {shownProjects.map((project, i) => (
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
