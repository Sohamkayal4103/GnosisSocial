// @ts-nocheck comment
import React, { useState, useRef } from "react";
import { useWalletClient } from "wagmi";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { Hex, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  chakra,
  VisuallyHidden,
  Text,
  Stack,
  ring,
} from "@chakra-ui/react";
import {
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V06,
  getRequiredPrefund,
} from "permissionless";
import { gnosisChiado } from "@wagmi/core/chains";
import { useToast } from "@chakra-ui/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ethers } from "ethers";
import usersideabi from "../../../utils/abis/usersideabi.json";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";

const RegisterForm = () => {
  const toast = useToast();
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const { primaryWallet } = useDynamicContext();

  const { data: walletClient } = useWalletClient();

  const changeHandler = () => {
    setProfileImage(inputRef.current?.files[0]);
  };
  const uploadIPFS = async () => {
    const form = new FormData();
    form.append("file", profileImage ? profileImage : "");

    const options = {
      method: "POST",
      body: form,
      headers: {
        Authorization: import.meta.env.VITE_NFTPort_API_KEY,
      },
    };

    await fetch("https://api.nftport.xyz/v0/files", options)
      .then((response) => response.json())
      .then((response) => {
        // console.log(response);
        console.log(response.ipfs_url);
        setIpfsUrl(response.ipfs_url);
        if (profileImage) {
          toast({
            title: "Image Uploaded to the IPFS.",
            description: "Congratulations 🎉 ",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Image not Uploaded to the IPFS.",
            description: "Please attach the Image.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = async () => {
    const signer1 = await primaryWallet.connector.ethers?.getSigner();

    const signer = walletClientToSmartAccountSigner(walletClient);

    console.log(signer);

    const paymasterClient = createPimlicoPaymasterClient({
      transport: http(import.meta.env.VITE_BUNDLER_URL),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    console.log(paymasterClient);

    const publicClient = createPublicClient({
      transport: http("https://rpc.chiadochain.net"),
    });

    const simpleSmartAccountClient = await signerToSimpleSmartAccount(
      publicClient,
      {
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        signer: signer,
        factoryAddress: "0x9406Cc6185a346906296840746125a0E44976454",
      }
    );

    console.log(simpleSmartAccountClient);

    const smartAccountClient = createSmartAccountClient({
      account: simpleSmartAccountClient,
      chain: gnosisChiado, // or whatever chain you are using
      bundlerTransport: http(import.meta.env.VITE_BUNDLER_URL),
      entryPoint: ENTRYPOINT_ADDRESS_V06,
      middleware: {
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
      },
    });

    console.log(smartAccountClient);

    const userSideInstance = new ethers.Contract(
      import.meta.env.VITE_USERSIDE_ADDRESS,
      usersideabi,
      signer1
    );

    const data1 = userSideInstance.interface.encodeFunctionData("createUser", [
      name,
      email,
      bio,
      ipfsUrl,
      signer1._address,
    ]);

    console.log(data1);

    const txHash = await smartAccountClient.sendTransaction({
      to: import.meta.env.VITE_USERSIDE_ADDRESS,

      data: data1,
      value: 0,
      maxFeePerGas: 12710000001,
      maxPriorityFeePerGas: 12709999993,
    });

    console.log("transaction hash is " + txHash);

    if (txHash) {
      toast({
        title: "User Created",
        description: "User Created Successfully",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }

    // toast({
    //   title: "User Created",
    //   description: "User Created Successfully",
    //   status: "success",
    //   duration: 1000,
    //   isClosable: true,
    //   position: "top-right",
    // });
  };

  const getUser = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        import.meta.env.USERSIDE_ADDRESS,
        usersideabi,
        signer
      );
      const tempUser = await userSideInstance.userIdtoUser(2);
      console.log(tempUser);
    } else {
      console.log("No Metamask Found");
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <SimpleGrid columns={1} spacing={6}>
          <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
            Join Now!🎯
          </Heading>
          <FormControl mr="2%">
            <FormLabel htmlFor="name" fontWeight={"normal"}>
              User Name
            </FormLabel>
            <Input
              id="name"
              placeholder="Name"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email" fontWeight={"normal"}>
              Email Address
            </FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="abc@gmail.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="bio">
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Bio
            </FormLabel>
            <Textarea
              placeholder="Write a short bio for yourself"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: "sm",
              }}
              onChange={(e) => setBio(e.target.value)}
            />
            <FormHelperText>Short Bio. URLs are hyperlinked.</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel
              fontWeight={"normal"}
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Profile Image
            </FormLabel>

            <Flex
              mt={1}
              justify="center"
              px={6}
              pt={5}
              pb={6}
              borderWidth={2}
              _dark={{
                color: "gray.500",
              }}
              borderStyle="dashed"
              rounded="md"
            >
              <Stack spacing={1} textAlign="center">
                <Icon
                  mx="auto"
                  boxSize={12}
                  color="gray.400"
                  _dark={{
                    color: "gray.500",
                  }}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Icon>
                <Text>{profileImage?.name}</Text>
                <Flex
                  fontSize="sm"
                  color="gray.600"
                  _dark={{
                    color: "gray.400",
                  }}
                  alignItems="baseline"
                >
                  <chakra.label
                    cursor="pointer"
                    rounded="md"
                    fontSize="md"
                    color="brand.600"
                    _dark={{
                      color: "brand.200",
                    }}
                    pos="relative"
                    _hover={{
                      color: "brand.400",
                      _dark: {
                        color: "brand.300",
                      },
                    }}
                  >
                    <span>{"Upload Image"}</span>
                    <VisuallyHidden>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        ref={inputRef}
                        onChange={changeHandler}
                        accept=".png, .jpg, .jpeg"
                      />
                    </VisuallyHidden>
                  </chakra.label>
                  <Text pl={1}>or drag and drop</Text>
                </Flex>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  _dark={{
                    color: "gray.50",
                  }}
                >
                  PNG, JPG, JPEG up to 10MB
                </Text>
              </Stack>
            </Flex>
          </FormControl>
          <Button onClick={uploadIPFS}>Upload to IPFS</Button>
        </SimpleGrid>
        <Button
          display="block"
          mx="auto"
          mt={6}
          w="10rem"
          colorScheme="purple"
          variant="solid"
          onClick={handleSubmit}
        >
          Register
        </Button>
      </Box>
    </>
  );
};

export default RegisterForm;
