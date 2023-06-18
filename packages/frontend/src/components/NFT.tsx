import React from 'react'
import { observer } from 'mobx-react-lite'
import { styled } from 'styled-components'
import { useState } from 'react';
import User from '../contexts/User';

export default observer(() => {
    const userContext = React.useContext(User)
    const [inputField, setinputField] = useState("0x");
    const onClickMint = async () => {
        console.log('ust')
        await userContext.stateTransition()
        console.log('claim')
        await userContext.claimPrize(inputField)
    }
    const handleInputChange = (event: any) => {
        setinputField(event.target.value);
    };

    return (
        <Container>
            <Image>
                <img
                    src={
                        'https://i.seadn.io/gcs/files/7762d77540c7f4c9d3718b6a5f8e59ad.png'
                    }
                    width={'50%'}
                />
            </Image>
            <div>Your project is {userContext.projectID ?? 'undefined'}, here is the NFT for you.
Please enter your wallet address to receive it.</div>
            <div>
                <input value={inputField} onChange={(event) => {handleInputChange(event)}} />
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

const Image = styled.div`
    display: flex;
    padding-inline: 20px;
    min-height: 80px;
    align-items: center;
`

const Container = styled.div`
    display: flex;
    padding-inline: 20px;
    min-height: 80px;
    align-items: center;
    justify-content: space-between;
`
