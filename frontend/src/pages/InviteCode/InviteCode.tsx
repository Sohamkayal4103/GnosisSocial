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

const InviteCode = () => {
  const apiKey = import.meta.env.VITE_WITNESS_API_KEY;
  const witness = new WitnessClient(apiKey);
  const [inviteAdd, setInviteAdd] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [proofObj, setProofObj] = useState();
  const [leafInd, setLeafInd] = useState("");
  const [proofSig, setProofSig] = useState(false);
  const { primaryWallet } = useDynamicContext();
  const [leafH, setLeafH] = useState("");
  const params = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [daoId, setDAOId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generateProof = async () => {
    const signer = await primaryWallet.connector.ethers?.getSigner();

    //generating invite code for a given address
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
    console.log(data);
    setProofObj(data);
  };

  const checkValidity = async () => {
    if (!primaryWallet?.connector) {
      console.log("User Signed out");
      toast({
        title: "User Signed out",
        description: `Please sign in to access`,
        status: "error",
        duration: 10000,
        isClosable: true,
      });
    } else {
      setSubmitting(true);
      const signer = await primaryWallet.connector.ethers?.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_USERSIDE_ADDRESS,
        usersideabi,
        signer
      );
      const tempDaoInfo = await contract.daoIdtoDao(daoId);
      const tempCreatorId = tempDaoInfo.creator;
      const tempCreatorInfo = await contract.userIdtoUser(tempCreatorId);
      const tempCreatorWallet = tempCreatorInfo.userWallet;
      console.log(tempCreatorWallet);

      // constuct leafHash => random num + invite add + admin add
      let str = "";
      str += inviteCode;
      const currAdd = signer._address;
      str += currAdd;
      str += tempCreatorWallet;
      console.log(str);
      const tempLeaf = witness.hash(str);
      console.log(tempLeaf);

      // generate proof and check validity

      // const headers = {
      //   Authorization: apiKey,
      //   "Content-Type": "application/json",
      //   accept: "application/json",
      // };
      // const proofRes = await fetch(
      //   `https://api.witness.co/getProofForLeafHash?leafHash=${tempLeaf}`,
      //   {
      //     headers,
      //     method: "GET",
      //   }
      // );
      // console.log(proofRes);
      // const data = await proofRes.json();
      // console.log(data);
      // const strData = JSON.stringify(data);
      // console.log(strData);
      // const res = await fetch("https://api.witness.co/postProof", {
      //   headers,
      //   strData,
      //   method: "POST",
      // });
      // const dataRes = await res.json();
      // console.log(dataRes);

      const tempProof = await witness.getProofForLeafHash(tempLeaf);

      const verifiedChain = await witness.verifyProofChain(tempProof);
      console.log(verifiedChain);
      if (verifiedChain) {
        // witness proof verified
        setProofSig(true);
        toast({
          title: "Success! The invite code is valid.",
          description: `Admitting you into the DAO`,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
        const checkMem = await contract.checkMembership(daoId, signer._address);
        if (checkMem) {
          toast({
            title: "Error.",
            description: `You have already joined the dao.`,
            status: "error",
            duration: 10000,
            isClosable: true,
          });
          setSubmitting(false);
          navigate(`/dao/${daoId}`);
          return;
        }
        const tx = await contract.addMembertoDao(
          daoId,
          signer._address,
          tempCreatorWallet
        );
        await tx.wait();
        console.log(tx);
        navigate(`/dao/${daoId}`);
        toast({
          title: "Success! Welcome to Secret Society.",
          description: `You are now, a member of the DAO`,
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } else {
        // invalid proof
        toast({
          title: "Invalid Invite Code",
          description: `Please contact the admin to solve the issue`,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
      }
      setSubmitting(false);
    }
  };

  return (
    <Box mt={8}>
      <VStack spacing={4}>
        <Heading as="h2" size="xl">
          Join DAO:
        </Heading>
        <Heading as="h2" size="md">
          DAO Id
        </Heading>

        <Input
          type="text"
          value={daoId}
          onChange={(e) => {
            setDAOId(e.target.value);
          }}
          placeholder="xx"
          mr={2}
          w="320px"
        />
        <Heading as="h2" size="md">
          Invite Code
        </Heading>

        <Input
          type="text"
          value={inviteCode}
          onChange={(e) => {
            setInviteCode(e.target.value);
          }}
          placeholder="xxxxx"
          mr={2}
          w="320px"
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
          Enter the DAOId and invite code that you received from the DAO admin.
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
            to be posted on the server and the invite code to be active.{" "}
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default InviteCode;
