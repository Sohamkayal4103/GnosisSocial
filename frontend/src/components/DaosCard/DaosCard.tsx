// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V06,
  getRequiredPrefund,
} from "permissionless";
import { gnosisChiado } from "@wagmi/core/chains";
import { useWalletClient } from "wagmi";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { Hex, createPublicClient, http } from "viem";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import {
  useDisclosure,
  Lorem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Heading,
  Text,
  Divider,
  HStack,
  Tag,
  Image,
  Wrap,
  WrapItem,
  SpaceProps,
  useColorModeValue,
  Container,
  VStack,
  Button,
  useToast,
  Center,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { AddIcon } from "@chakra-ui/icons";
import { RiTokenSwapFill } from "react-icons/ri";
import { MdOutlineGroups3 } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import usersideabi from "../../../utils/abis/usersideabi.json";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface IBlogTags {
  tags: Array<string>;
  marginTop?: SpaceProps["marginTop"];
}

interface Props {
  marginTop?: number;
  tags: any[];
}

const BlogTags = (props: Props) => {
  const { marginTop = 0, tags } = props;

  return (
    <HStack spacing={2} marginTop={marginTop}>
      {tags.map((tag) => {
        return (
          <Tag size={"md"} variant="solid" colorScheme="orange" key={tag}>
            {tag}
          </Tag>
        );
      })}
    </HStack>
  );
};

interface BlogAuthorProps {
  date: Date;
  name: string;
}

const BlogAuthor = (props: BlogAuthorProps) => {
  return (
    <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
      <Image
        borderRadius="full"
        boxSize="40px"
        src="https://100k-faces.glitch.me/random-image"
        alt={`Avatar of ${props.name}`}
        width={{ base: "40px", sm: "40px", md: "40px" }}
        height={{ base: "40px", sm: "40px", md: "40px" }}
      />
      <Text fontWeight="medium">{props.name}</Text>
      <Text>—</Text>
      <Text>{props.date.toLocaleDateString()}</Text>
    </HStack>
  );
};

const DaosCard = ({
  daoName,
  tokenName,
  joiningThreshold,
  tokenSymbol,
  creatorName,
  totalDaoMember,
  daoId,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [txHash, setTxHash] = useState("");
  const [added, setAdded] = useState(false);
  const { primaryWallet } = useDynamicContext();
  console.log("Inside DAO Card: " + totalDaoMember);
  const [submitting, setSubmitting] = useState(false);
  const { data: walletClient } = useWalletClient();

  const joinDao = async () => {
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
      const signer_pimlico = walletClientToSmartAccountSigner(walletClient);

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
          signer: signer_pimlico,
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

      const contract = new ethers.Contract(
        import.meta.env.VITE_USERSIDE_ADDRESS,
        usersideabi,
        signer
      );

      // check dao membership
      const res = await contract.checkMembership(daoId, signer._address);
      if (res) {
        toast({
          title: "Already a member!",
          description: "You are already a member of this DAO.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setSubmitting(false);
        return;
      }
      try {
        const data = await contract.interface.encodeFunctionData("joinDao", [
          daoId,
          signer._address,
        ]);

        const txHash = await smartAccountClient.sendTransaction({
          to: import.meta.env.VITE_USERSIDE_ADDRESS,
          data: data,
          value: 0,
          maxFeePerGas: 12710000001,
          maxPriorityFeePerGas: 12709999993,
        });

        if (txHash !== undefined) {
          setTxHash(txHash);

          toast({
            title: "Congratulations!",
            description: "You have successfully joined the DAO",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          const daoIdNum = Number(daoId);
          navigate(`/dao/${daoIdNum}`);
        }
      } catch (e) {
        console.log(e.data === undefined);

        toast({
          title: e.data === undefined ? "Error" : e.message,
          description:
            e.data === undefined ? "Not enough tokens" : e.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setSubmitting(false);
    }
  };

  return (
    <Center>
      <Box
        marginTop={{ base: "1", sm: "8" }}
        display="flex"
        flexDirection={{ base: "column", sm: "row" }}
        justifyContent="center"
        mb={8}
        marginLeft={{ base: "0", sm: "5%" }}
        width={{ base: "100%", sm: "65%" }}
        rounded={{ base: "none", sm: "xl" }}
        boxShadow={{ base: "lg", sm: "xxl" }}
        borderWidth="1px"
        overflow="hidden"
        // on hover raise the card

        _hover={{
          boxShadow: "xl",
          transform: "translateY(-4px)",
        }}
      >
        <Box
          display="flex"
          flex="1"
          marginRight="3"
          position="relative"
          alignItems="center"
        >
          {/* <Box
            width={{ base: "100%", sm: "85%" }}
            zIndex="2"
            marginLeft={{ base: "0", sm: "5%" }}
            marginTop="5%"
          > */}
          <Box textDecoration="none" _hover={{ textDecoration: "none" }}>
            <Image
              borderRadius="lg"
              src="/assets/dao.png"
              alt="Cover Image"
              //   objectFit="contain"
              _placeholder={blur}
              width={{ base: "100%", sm: "100%" }}
              rounded={{ base: "none", sm: "xl" }}
              height={{ base: "100%", sm: "100%" }}
              zIndex="2"
              alignItems={"center"}
              display={"flex"}
              alignContent={"center"}
              justifyContent={"center"}
            />
          </Box>
          {/* </Box> */}
          <Box zIndex="1" width="100%" position="absolute" height="100%">
            <Box
              bgGradient={useColorModeValue(
                "radial(orange.600 1px, transparent 1px)",
                "radial(orange.300 1px, transparent 1px)"
              )}
              backgroundSize="20px 20px"
              opacity="0.4"
              height="100%"
            />
          </Box>
        </Box>
        <Box
          display="flex"
          flex="1"
          flexDirection="column"
          justifyContent="center"
          marginTop={{ base: "3", sm: "0" }}
        >
          <Heading marginTop="1">
            <Center>
              <Text textDecoration="none" _hover={{ textDecoration: "none" }}>
                {daoName}
              </Text>
            </Center>
          </Heading>
          <Center>
            {" "}
            <Text
              as="p"
              marginTop="6"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              Minimum Tokens Required: {joiningThreshold.toString() / 1e18}{" "}
              {tokenSymbol}
            </Text>
          </Center>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
            alignItems={"center"}
          >
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenName}
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              <RiTokenSwapFill size={35} color="teal" />
            </Text>
            <Text
              as="p"
              marginTop="2"
              color={useColorModeValue("gray.700", "gray.200")}
              fontSize="lg"
            >
              {tokenSymbol}
            </Text>
          </Flex>
          <Flex
            justifyContent={"space-between"}
            marginLeft={10}
            marginRight={10}
            marginTop={6}
          >
            {" "}
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Total Members">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <MdOutlineGroups3 size={30} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {totalDaoMember}
              </Text>
            </Flex>
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Tooltip label="Admin">
                <Text
                  as="p"
                  marginTop="2"
                  color={useColorModeValue("gray.700", "gray.200")}
                  fontSize="lg"
                >
                  <RiAdminLine size={25} />
                </Text>
              </Tooltip>
              <Text
                as="p"
                marginTop="2"
                color={useColorModeValue("gray.700", "gray.200")}
                fontSize="lg"
              >
                {creatorName}
              </Text>
            </Flex>
          </Flex>
          <Button isLoading={submitting} margin={6} mb={2} onClick={joinDao}>
            <AddIcon mx="2px" /> Join DAO
          </Button>
          <Button
            marginRight={6}
            marginLeft={6}
            marginBottom={2}
            mt={2}
            onClick={() => navigate(`/dao/${daoId}`)}
          >
            View More <ExternalLinkIcon mx="2px" />
          </Button>
        </Box>
      </Box>
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join DAO</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {added ? (
              <Text>
                {" "}
                ✔️ Added to Bandada group <br />
                🚀 Group id : <span>{process.env.NEXT_PUBLIC_GROUP_ID} </span>
              </Text>
            ) : (
              <Text>Adding to Bandada grp</Text>
            )}

            {txHash === "" ? (
              <Text> Adding to DAO </Text>
            ) : (
              <Text>
                ✔️Added to DAO{" "}
                <Link
                  href={`https://goerli.etherscan.io/tx/${txHash}`}
                  isExternal
                >
                  View Transaction
                </Link>
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

export default DaosCard;
