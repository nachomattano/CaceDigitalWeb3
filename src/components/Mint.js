import { Web3Button, useAddress } from "@thirdweb-dev/react";
import { CACE_CONTRACT } from '../const/addresses'
import { useEffect, useState } from 'react';
import CACE_LOGO from '../assets/logo.jpg'

import {
    Box,
    Center,
    Stack,
    Image,
    Heading,
} from '@chakra-ui/react'

const axios = require('axios');

export default function Mint() {
    const address = useAddress();

    const [urlImg, seturlImg] = useState("")

    const [errores, setErrores] = useState({
        data: "",
        status: false,
        style: ""
    })

    const querystring = window.location.search

    const params = new URLSearchParams(querystring)

    const userId = params.get('userId')
    const eventId = params.get('eventId')

    const apiUrl = 'https://apiregistros.cace.org.ar/api/web3/getUrlCertificate';
    const saveMintResultApiUrl = 'https://apiregistros.cace.org.ar/api/web3/saveMintResult';

    const credentials = 'usr_appplication_wb3:k!Z7p$6u&v8@Qw*301Mn!5LCP9zF0X$';
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const authorizationHeader = `Basic ${encodedCredentials}`;

    axios.get(apiUrl, {
        params: {
            userId,
            eventId
        },
        headers: {
            'Authorization': authorizationHeader
        }
    })
        .then((response) => {
            console.log(response.data);
            const certificateUrl = decodeURIComponent(response.data.message.image);
            console.log(certificateUrl)
            seturlImg(certificateUrl)
        })
        .catch((error) => {
            console.error(error);
            const responseData = JSON.parse(error.request.response);
            if (responseData.message === "This certificate HAS ALREADY been minted") {
                setErrores({
                    data: "Certificado ya convertido a NFT",
                    status: true,
                    style: "red"
                })
            } else if (responseData.message === "Event not found") {
                setErrores({
                    data: "Evento no encontrado",
                    status: true,
                    style: "red"
                })
            }
        });
    useEffect(() => {
        if (userId == null || eventId == null) {
            setErrores({
                data: "Cargando usuario y evento...",
                status: true,
                style: "black"
            })
        } else {
            setErrores({
                data: "",
                status: false,
                style: "black"
            })
        }
    }, [userId, eventId])

    return (
        <Center py={20}>
            <Box
                role={'group'}
                p={6}
                maxW={'330px'}
                w={'full'}
                bg={'white'}
                boxShadow={'2xl'}
                rounded={'lg'}
                pos={'relative'}
                zIndex={1}>
                <Box
                    rounded={'lg'}
                    mt={10}
                    pos={'relative'}
                    height={'230px'}
                    _after={{
                        transition: 'all .3s ease',
                        content: '""',
                        w: 'full',
                        h: 'full',
                        pos: 'absolute',
                        top: 5,
                        left: 0,
                        backgroundImage: `url(${CACE_LOGO})`,
                        filter: 'blur(15px)',
                        zIndex: -1,
                    }}
                    _groupHover={{
                        _after: {
                            filter: 'blur(20px)',
                        },
                    }}>
                    <Image
                        height={160}
                        width={282}
                        src={CACE_LOGO}
                        alt="CaceLogo"
                    />
                </Box>
                <Stack pt={1} align={'center'}>
                    {
                        !errores.status ? (
                            <Web3Button
                                connectWallet={{
                                    btnTitle: "Conectar Wallet"
                                }}
                                contractAddress={CACE_CONTRACT}
                                action={async (contract) => {
                                    await contract.call(
                                        "mintNFT",
                                        [address,
                                            "Certificado CACE",
                                            "Certificado CACE",
                                            urlImg
                                        ])

                                    const postData = {
                                        userId,
                                        eventId,
                                        successMint: true,
                                    };

                                    axios.post(saveMintResultApiUrl, JSON.stringify(postData), {
                                        headers: {
                                            Authorization: authorizationHeader,
                                            'Content-Type': 'application/json',
                                        },
                                    })
                                        .then((response) => {
                                            console.log(response);
                                            setErrores({
                                                data: "Certificado convertido a NFT exitosamente",
                                                status: true,
                                                style: "green"
                                            })
                                        })
                                        .catch((error) => {
                                            setErrores({
                                                data: "Certificado ya convertido a NFT",
                                                status: true,
                                                style: "red"
                                            })
                                        });
                                }}
                            >
                                Convertir certificado
                            </Web3Button>
                        ) : (
                            <Heading as='h6' size='xs'>
                                <p style={{ color: errores.style }}>  {errores.data}</p>
                            </Heading>
                        )}
                </Stack>
            </Box>
        </Center>
    )
}