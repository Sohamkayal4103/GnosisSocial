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
  Divider,
} from "@chakra-ui/react";
import usersideabi from "../../../utils/abis/usersideabi.json";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { TokenboundClient } from "@tokenbound/sdk";
import { FaCommentsDollar } from "react-icons/fa";

const DAOAdmin = () => {
  const apiKey = import.meta.env.VITE_WITNESS_API_KEY;
  const witness = new WitnessClient(apiKey);
  const [inviteAdd, setInviteAdd] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [accCode, setAccCode] = useState("");
  const [restrict, setRestrict] = useState(true);
  const [proofObj, setProofObj] = useState("");
  const [leafInd, setLeafInd] = useState("");
  const [proofSig, setProofSig] = useState(false);
  const { primaryWallet } = useDynamicContext();
  const [leafH, setLeafH] = useState("");
  const [mintH, setMintH] = useState("");

  const [nftAdd, setNftAdd] = useState("");
  const params = useParams();

  const generateProof = async () => {
    const signer = await primaryWallet.connector.ethers?.getSigner();

    //generating invite code for a given address  => random num + invite add + admin add
    const val = Math.floor(Math.random() * 90000) + 10000;
    setInviteCode(val.toString());
    let finalString = val.toString();
    finalString += inviteAdd;
    finalString += signer._address;
    //console.log(finalString);
    // generating leaf hash for final string
    const inviteLeafHash = witness.hash(finalString);
    console.log(`Timestamping leaf ${inviteLeafHash}`);
    setLeafH(inviteLeafHash);

    // posting leafHash to witness server
    const headers = {
      Authorization: apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    };
    const body = JSON.stringify({
      leafHash: inviteLeafHash,
    });
    const response = await fetch("https://api.witness.co/postLeafHash", {
      headers,
      body,
      method: "POST",
    });
    console.log(response);
    const leafIndRes = await fetch(
      `https://api.witness.co/getLeafIndexByHash?leafHash=${inviteLeafHash}`,
      {
        headers,
        method: "GET",
      }
    );
    const leafIndData = await leafIndRes.json();
    console.log("leaf Index: " + leafIndData);
    // Wait for the data to be included in an onchain checkpoint.
    await witness.waitForCheckpointedLeafHash(inviteLeafHash);
    setProofSig(true);

    // once leafHash is included, get the proof
    const proofRes = await fetch(
      `https://api.witness.co/getProofForLeafHash?leafHash=${inviteLeafHash}`,
      {
        headers,
        method: "GET",
      }
    );
    console.log(proofRes);
    const data = await proofRes.json();
    const strData = JSON.stringify(data);
    console.log(data);
    setProofObj(strData);
  };

  const checkAdmin = async () => {
    if (!primaryWallet?.connector || !params) {
      setRestrict(true);
    } else {
      const signer = await primaryWallet.connector.ethers?.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_USERSIDE_ADDRESS,
        usersideabi,
        signer
      );
      console.log(params.id);
      const tempId = Number(await contract.userWallettoUserId(signer._address));
      const tempDaoInfo = await contract.daoIdtoDao(params.id);
      console.log(tempId);
      console.log(Number(tempDaoInfo.creator));
      if (tempId === Number(tempDaoInfo.creator)) {
        console.log("Admin verified");
        setRestrict(false);
      } else {
        setRestrict(true);
      }
    }
  };

  const airdropNFT = async () => {
    // console.log(nftAdd);
    // const sampleStr = "Hello World";
    // const abi = ethers.utils.defaultAbiCoder;
    // const params = abi.encode(
    //   ["string"], // encode as address array
    //   [sampleStr]
    // );
    // console.log(params);
    // const labelhash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(params));
    // console.log(labelhash);

    // console.log("Using witness sdk");
    // const leafHash = witness.hash(sampleStr);
    // console.log(leafHash);

    const val = Math.floor(Math.random() * 90000) + 10000;
    let leafStr = "";
    const valStr = val.toString();
    setAccCode(valStr);
    leafStr += valStr;
    const signer = await primaryWallet.connector.ethers?.getSigner();
    const ownerAdd = signer._address;
    leafStr += ownerAdd;
    const mintLeafHash = witness.hash(leafStr);
    setMintH(mintLeafHash);
    const headers = {
      Authorization: apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    };
    const body = JSON.stringify({
      leafHash: mintLeafHash,
    });
    const response = await fetch("https://api.witness.co/postLeafHash", {
      headers,
      body,
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    if (params && primaryWallet) {
      checkAdmin();
    }
  }, [params, primaryWallet]);

  if (restrict) {
    return (
      <Center>
        <Heading>Access Denied...</Heading>
      </Center>
    );
  }

  return (
    <Box>
      <VStack spacing={4}>
        <Heading as="h2" size="xl">
          Invite Members to the DAO:
        </Heading>
        <Flex spacing={8}>
          <Input
            type="text"
            value={inviteAdd}
            onChange={(e) => {
              setInviteAdd(e.target.value);
            }}
            placeholder="0x..."
            mr={2}
            w="320px"
          />
          <Button onClick={generateProof}>Invite</Button>
        </Flex>
        <Box
          spacing={4}
          rounded="md"
          w="60%"
          p={4}
          color="white"
          boxShadow="outline"
        >
          <Text>Invite Code: {inviteCode}</Text>
          <Text>Dao Id: {params.id}</Text>
          <Text>
            LeafHash Generated: <Code>{leafH}</Code>
          </Text>
          {proofObj && (
            <Text>
              Proof: <Code>{setProofObj}</Code>
            </Text>
          )}
        </Box>
        <Text>
          Ask the opposite party to join the dao using the Invite code
          generated.
        </Text>
        {proofSig ? (
          <Alert status="success" variant="subtle" w="30%">
            <AlertIcon />
            LeafHash uploaded on Witness. The invite code is now valid.
          </Alert>
        ) : (
          <Alert status="warning" w="30%">
            <AlertIcon />
            Note: This uses witness protocol. It may take some time for hashleaf
            to be posted on the server and the invite code to be active.{" "}
          </Alert>
        )}

        <Divider orientation="horizontal" />
        <Heading as="h2" size="xl">
          Airdrop NFTs to DAO members:
        </Heading>
        <Heading as="h2" size="md">
          NFT Address
        </Heading>
        <Input
          onChange={(e) => {
            setNftAdd(e.target.value);
          }}
          value={nftAdd}
          type="text"
          placeholder="0x..."
          mr={2}
          w="320px"
        />
        <Button onClick={airdropNFT} colorScheme="teal" variant="solid">
          Submit
        </Button>
        <Box
          spacing={4}
          rounded="md"
          w="60%"
          p={4}
          color="white"
          boxShadow="outline"
        >
          <Text>Access Code: {accCode}</Text>
          <Text>Dao Id: {params.id}</Text>
          <Text>
            LeafHash Generated: <Code>{mintH}</Code>
          </Text>
          {proofObj && (
            <Text>
              Proof: <Code>{setProofObj}</Code>
            </Text>
          )}
        </Box>
        <Alert status="warning" w="30%">
          <AlertIcon />
          Note: This uses witness protocol. It may take some time for hashleaf
          to be posted on the server and the proof to be active.{" "}
        </Alert>
      </VStack>
    </Box>
  );
};

export default DAOAdmin;
