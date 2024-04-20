// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import usersideabi from "../../../utils/abis/usersideabi.json";
import governancetokenabi from "../../../utils/abis/governancetokenabi.json";
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
  Badge,
  Code,
  Center,
  Grid,
  Container,
  AbsoluteCenter,
  useToast,
} from "@chakra-ui/react";
import DaosCard from "../../components/DaosCard/DaosCard";
import { Spinner } from "@chakra-ui/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const Explore = () => {
  const [daos, setDaos] = useState([]);
  const [totaluserDAO, setTotaluserDAO] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { primaryWallet } = useDynamicContext();
  const [frsig, setFrsig] = useState();
  const toast = useToast();
  let uesig = true;

  const onLoad = async () => {
    console.log("Screen loading");

    toast({
      title: "Signer Loaded...",
      description: `Please wait for a moment`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.chiadochain.net"
    );
    const userSideInstance = new ethers.Contract(
      import.meta.env.VITE_USERSIDE_ADDRESS,
      usersideabi,
      provider
    );
    const tempTotalDaos = Number(await userSideInstance.totalDaos());

    let tempCreatorId,
      tempDaoInfo,
      tempCreatorInfo,
      tempTokenAddress,
      tempTokenName,
      tempTokenSymbol;
    for (let i = 1; i <= tempTotalDaos; i++) {
      tempDaoInfo = await userSideInstance.daoIdtoDao(i);
      tempCreatorId = Number(tempDaoInfo.creator);
      console.log("Creator Id: " + tempCreatorId);
      tempCreatorInfo = await userSideInstance.userIdtoUser(tempCreatorId);
      console.log(tempCreatorInfo);
      tempTokenAddress = tempDaoInfo.governanceTokenAddress;
      console.log("TokenAddress: " + tempTokenAddress);
      const governanceTokenInstance = new ethers.Contract(
        tempTokenAddress,
        governancetokenabi,
        provider
      );
      console.log(governanceTokenInstance);
      tempTokenName = await governanceTokenInstance.name();
      console.log("Token Name: " + tempTokenName);
      tempTokenSymbol = await governanceTokenInstance.symbol();
      console.log("Token Symbol: " + tempTokenSymbol);
      console.log(tempDaoInfo);
      const totalUsersDAO = await userSideInstance.getAllDaoMembers(
        tempDaoInfo.daoId
      );
      setTotaluserDAO(totalUsersDAO.length);
      setDaos((daos) => [
        ...daos,
        {
          daoInfo: tempDaoInfo,
          creatorInfo: tempCreatorInfo,
          tokenName: tempTokenName,
          tokenSymbol: tempTokenSymbol,
          totalDaoMember: totalUsersDAO.length,
        },
      ]);
      console.log("This is: " + totalUsersDAO.length);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //onLoad();

    onLoad();
  }, []);

  return (
    <Box>
      {isLoading ? (
        <AbsoluteCenter>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="orange.500"
            size="xl"
          />
        </AbsoluteCenter>
      ) : (
        <Container
          maxW={"7xl"}
          p="12"
          templateRows="repeat(2, 1fr)"
          templateColumns="repeat(4, 1fr)"
          gap={4}
        >
          {daos &&
            daos
              .filter((dao) => dao.daoInfo.isPrivate === false)
              .map((dao) => (
                <GridItem rowSpan={1}>
                  <DaosCard
                    daoName={dao.daoInfo.daoName}
                    joiningThreshold={dao.daoInfo.joiningThreshold}
                    creatorName={dao.creatorInfo.userName}
                    tokenName={dao.tokenName}
                    tokenSymbol={dao.tokenSymbol}
                    totalDaoMember={dao.totalDaoMember}
                    daoId={dao.daoInfo.daoId}
                  />
                </GridItem>
              ))}
        </Container>
      )}
    </Box>
  );
};

export default Explore;
