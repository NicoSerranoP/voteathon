import React from 'react'
import { observer } from 'mobx-react-lite'
import { styled } from 'styled-components'
import { useState } from 'react'
import User from '../contexts/User'

export default observer(() => {
    const userContext = React.useContext(User)
    const [inputField, setinputField] = useState('0x')
    const onClickMint = async () => {
        console.log('ust')
        await userContext.stateTransition()
        console.log('claim')
        await userContext.claimPrize(inputField)
    }
    const handleInputChange = (event: any) => {
        setinputField(event.target.value)
    }

    return (
        <Container>
            <img
                src={
                    'https://i.seadn.io/gcs/files/7762d77540c7f4c9d3718b6a5f8e59ad.png'
                }
                width={'250px'}
            />
            <div
                style={{
                    maxWidth: '450px',
                    textAlign: 'center',
                    paddingTop: '15px',
                }}
            >
                Your project is {userContext.projectID ?? 'undefined'}, here is
                the NFT for you. Please enter your wallet address to receive it.
            </div>
            <div>
                <Input
                    value={inputField}
                    onChange={(event) => {
                        handleInputChange(event)
                    }}
                />
            </div>

            <MintButton onClick={onClickMint}>Mint</MintButton>
        </Container>
    )
})

const MintButton = styled.button`
    cursor: pointer;
    background: #ffe94d;
    border-radius: 10px;
    border: none;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
`

const Input = styled.input`
    width: 450px;
    color: #fcfcfc;
    border: 3px solid #fcfcfc;
    margin-block: 20px;
    border-radius: 10px;
    padding-inline: 20px;
    padding-block: 10px;
    font-family: inherit;
    font-weight: 400;
    background: transparent;
`

const Container = styled.div`
    height: 60vh;
    display: flex;
    flex-direction: column;
    padding-inline: 20px;
    min-height: 80px;
    align-items: center;
    justify-content: space-between;
`
