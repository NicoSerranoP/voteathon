import { styled } from 'styled-components'

import { useState } from 'react';

const NFT = () => {
    const [inputFields, setInputFields] = useState("0x");
    const onClickMint = () => {
        console.log('mint')
    }
    const handleInputChange = (event: any) => {
        setInputFields(event.target.value);
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
            <div>
                <input value={inputFields} onChange={(event) => {handleInputChange(event)}} />
            </div>

            <MintButton onClick={onClickMint}>Mint</MintButton>
        </Container>
    )
}

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

export default NFT
