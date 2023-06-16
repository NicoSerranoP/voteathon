import { styled } from 'styled-components'
import VoteathonIcon from '../assets/logo.svg'
import GithubIcon from '../assets/github.svg'

const Header = () => {
    return (
        <Container>
            <LogoContainer>
                <img src={VoteathonIcon} width={'40px'}></img>
                <h1>voteathon</h1>
            </LogoContainer>
            <img src={GithubIcon} width={'30px'}></img>
        </Container>
    )
}

const LogoContainer = styled.div`
    gap: 10px;
    display: flex;
    align-items: center;
`

const Container = styled.div`
    display: flex;
    padding-inline: 20px;
    min-height: 80px;
    justify-content: space-between;
`

export default Header
