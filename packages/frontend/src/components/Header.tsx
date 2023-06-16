import { styled } from 'styled-components'
import VoteathonIcon from '../assets/logo.svg'
import GithubIcon from '../assets/github.svg'

const Header = () => {
    const onClickClaim = () => {
        console.log('claiming reward')
    }

    return (
        <Container>
            <RightContainer>
                <img src={VoteathonIcon} width={'40px'} />
                <h4>voteathon</h4>
            </RightContainer>
            <LeftContainer>
                <ClaimButton onClick={onClickClaim}>Claim reward</ClaimButton>
                <img src={GithubIcon} width={'30px'} />
            </LeftContainer>
        </Container>
    )
}

const RightContainer = styled.div`
    gap: 10px;
    display: flex;
    align-items: center;
`

const LeftContainer = styled.div`
    gap: 30px;
    display: flex;
    align-items: center;
`

const ClaimButton = styled.button`
    background: #ffe94d;
    border-radius: 10px;
    border: none;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
`

const Container = styled.div`
    display: flex;
    padding-inline: 20px;
    min-height: 80px;
    align-items: center;
    justify-content: space-between;
`

export default Header
