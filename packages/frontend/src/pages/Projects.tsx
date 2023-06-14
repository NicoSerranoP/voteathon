import Header from '../components/Header'
import Row from '../components/projects/Row'
import TopDescription from '../components/projects/TopDescription'

const Projects = () => {
    const projects = [1, 2, 3, 4, 5]

    return (
        <div>
            <Header />
            <TopDescription />
            {projects.map((project, i) => (
                <Row index={i} project={project}></Row>
            ))}
        </div>
    )
}

export default Projects
