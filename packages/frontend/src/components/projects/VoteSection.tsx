import { styled } from 'styled-components'
import VoteathonIconBlack from '../../assets/logo-black.svg'

const VoteSection = () => {
    return (
        <Container>
            <img src={VoteathonIconBlack} width={'90px'} />
            <Button>Vote for me</Button>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    background: #ffe94d;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    gap: 12px;
`

const Button = styled.button`
    background: #fcfcfc;
    border-radius: 10px;
    border: none;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
    font-weight: 500;
`

export default VoteSection
