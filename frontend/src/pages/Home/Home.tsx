// @ts-nocheck comment
import React from "react";
import {
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  let navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const { setShowAuthFlow } = useDynamicContext();

  return (
    <>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex
          flexDir={"row"}
          alignItems={"center"}
          justifyContent={"center"}
          flex={1}
          px={28}
          ml={100}
        >
          <Flex p={8} flex={1} align={"center"} justify={"center"}>
            <Stack spacing={6} w={"full"} maxW={"lg"}>
              <Heading fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}>
                <Text
                  as={"span"}
                  position={"relative"}
                  _after={{
                    content: "''",
                    width: "full",
                    height: useBreakpointValue({ base: "20%", md: "30%" }),
                    position: "absolute",
                    bottom: 1,
                    left: 0,
                    bg: "blue.500",
                    zIndex: -1,
                  }}
                >
                  Unlocking DAO Potential
                </Text>
                <br />{" "}
                <Text color={"blue.500"} as={"span"}>
                  Seamless, Secure, Inclusive.
                </Text>{" "}
              </Heading>
              <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
                Empower your community with simplified DAO governance.
                Streamline decisions effortlessly for a decentralized
                revolution.
              </Text>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Button
                  rounded={"full"}
                  bg={"blue.500"}
                  color={"white"}
                  _hover={{
                    bg: "blue.600",
                  }}
                  width={{ base: "full", md: "auto" }}
                  onClick={
                    isLoggedIn
                      ? () => navigate("/register")
                      : () => setShowAuthFlow(true)
                  }
                >
                  Register
                </Button>

                <Button
                  width={{ base: "full", md: "auto" }}
                  rounded={"full"}
                  onClick={
                    isLoggedIn
                      ? () => navigate("/create-dao")
                      : () => setShowAuthFlow(true)
                  }
                >
                  Create a DAO
                </Button>
              </Stack>
            </Stack>
          </Flex>
          <Flex flex={1}>
            <Image
              alt={"Login Image"}
              objectFit={"cover"}
              src="/assets/DAOLanding.svg"
              width={450}
              height={450}
            />
          </Flex>
        </Flex>
      </Stack>
    </>
  );
}
