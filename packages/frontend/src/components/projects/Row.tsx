import VoteSection from './VoteSection'

type Props = {
    index: number
    project: any
}

const Row = ({ index }: Props) => {
    return (
        <div id={'project-row' + index}>
            <h3>Project Name {index}</h3>
            <VoteSection />
        </div>
    )
}

export default Row
