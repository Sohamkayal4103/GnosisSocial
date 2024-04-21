// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { WitnessClient } from "@witnessco/client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Center,
  Input,
  Flex,
  Button,
  VStack,
  Heading,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Highlight,
  Code,
  useToast,
} from "@chakra-ui/react";
import usersideabi from "../../../utils/abis/usersideabi.json";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import erc721pabi from "../../../utils/abis/erc721pabi.json";

const Claim = () => {
  const apiKey = import.meta.env.VITE_WITNESS_API_KEY;
  const { primaryWallet } = useDynamicContext();
  const witness = new WitnessClient(apiKey);
  const params = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [proofSig, setProofSig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nftAdd, setNftAdd] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const checkValidity = async () => {
    setSubmitting(true);
    console.log(accessCode);
    console.log(nftAdd);
    let str1 = accessCode;
    const signer = await primaryWallet.connector.ethers?.getSigner();
    const ownerAdd = signer._address;
    str1 += ownerAdd;
    let leafH = witness.hash(str1);
    //await witness.waitForCheckpointedLeafHash(leafH);
    leafH =
      "0xa9055fc4574d9945b24b32d8e7cd63b0751d4057540c47869c7d8bb820396b68";
    const tempProof = await witness.getProofForLeafHash(leafH);
    const verifiedChain = await witness.verifyProofChain(tempProof);
    console.log(verifiedChain);
    if (verifiedChain) {
      const contract = new ethers.Contract(nftAdd, erc721pabi, signer);
      const _nftName = "AirdropNFT";
      const _nftDesc = `Airdropped to ${signer._address}`;
      console.log(contract);
      try {
        const tx = await contract.verifyAndmint(
          _nftName,
          _nftDesc,
          signer._address
        );
        await tx.wait();
        console.log(tx);
        toast({
          title: "Success! The access code is valid.",
          description: `NFT Transferred`,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Something went wrong",
          description: `Proof is invalid`,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
        setSubmitting(false);
      }
    } else {
      toast({
        title: "Proof is Invalid",
        description: `Proof is invalid`,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    }
    setSubmitting(false);
  };

  return (
    <Box mt={8}>
      <VStack spacing={4}>
        <Heading as="h2" size="xl">
          Claim Airdrop:
        </Heading>
        <Heading as="h2" size="md">
          NFT address:
        </Heading>

        <Input
          type="text"
          placeholder="xx"
          mr={2}
          w="320px"
          onChange={(e) => {
            setNftAdd(e.target.value);
          }}
          value={nftAdd}
        />
        <Heading as="h2" size="md">
          Access Code
        </Heading>

        <Input
          type="text"
          placeholder="xxxxx"
          mr={2}
          w="320px"
          value={accessCode}
          onChange={(e) => {
            setAccessCode(e.target.value);
          }}
        />
        <Button
          isLoading={submitting}
          colorScheme="teal"
          variant="solid"
          onClick={checkValidity}
        >
          Submit
        </Button>

        <Heading as="h2" size="sm">
          Enter the NFT Address and access code that you received from the DAO
          admin.
        </Heading>
        {proofSig ? (
          <Alert status="success" variant="subtle" w="30%">
            <AlertIcon />
            LeafHash uploaded on Witness. The invite code is now valid.
          </Alert>
        ) : (
          <Alert status="warning" w="30%">
            <AlertIcon />
            Note: This uses witness protocol. It may take some time for hashleaf
            to be posted on the server and the access code to be active.{" "}
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default Claim;
