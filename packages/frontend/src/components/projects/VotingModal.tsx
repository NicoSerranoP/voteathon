import Modal from 'react-modal'
import { styled } from 'styled-components'

type Props = {
    open: boolean
    projectId: number
    onDeselect: () => void
}

const VotingModal = ({ open, projectId, onDeselect }: Props) => {
    return (
        <StyledModal
            isOpen={open}
            onRequestClose={onDeselect}
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                    overflowY: 'scroll',
                },
            }}
        >
            <h2>Vote for your favorite project</h2>
            <p>Project ID: {projectId}</p>
        </StyledModal>
    )
}

const StyledModal = styled(Modal)`
    background: rgba(255, 233, 77, 0.9);
    color: #151616;
    blocksize: 'fit-content';
    width: 50%;
    border: none;
    padding-block: 40px;
    position: fixed;
    top: 35%;
    right: 100px;
    bottom: auto;
`

export default VotingModal
