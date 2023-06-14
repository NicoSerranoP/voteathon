import { styled } from 'styled-components'
import VoteathonIcon from '../assets/logo.svg'

const Header = () => {
    return (
        <Container>
            <img src={VoteathonIcon}></img>
            <h1>voteathon</h1>
        </Container>
    )
}

const Container = styled.div`
    width: 100%;
    display: flex;
    background: red;
    min-height: 80px;
`

export default Header
