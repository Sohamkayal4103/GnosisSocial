import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  Image,
  useColorModeValue,
  Stack,
  Link,
} from "@chakra-ui/react";
import React from "react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import {
  DynamicWidget,
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Navbar() {
  const { isAuthenticated } = useDynamicContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue("white", "gray.800")} px={10}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="26px"
            fontWeight="0"
            color="brand.00"
          >
            <Link href="/" mt={1}>
              Scaling Ethereum 2024
            </Link>
          </HStack>
          <Flex alignItems={"center"}>
            <div style={{ display: "flex" }}>
              {isAuthenticated && (
                <>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/register">
                      <Button w="full" variant="ghost">
                        Register
                      </Button>
                    </Link>
                  </HStack>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/create-dao">
                      <Button w="full" variant="ghost">
                        Create DAO
                      </Button>
                    </Link>
                  </HStack>
                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/explore">
                      <Button w="full" variant="ghost">
                        Explore
                      </Button>
                    </Link>
                  </HStack>

                  <HStack
                    as={"nav"}
                    spacing={4}
                    display={{ base: "none", md: "flex" }}
                    marginRight={4}
                  >
                    <Link href="/profile">
                      <Button w="full" variant="ghost">
                        Profile
                      </Button>
                    </Link>
                  </HStack>
                </>
              )}

              <HStack>
                <DynamicWidget />
              </HStack>
            </div>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            {isAuthenticated && (
              <>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/register">
                    <Button w="full" variant="ghost">
                      Register
                    </Button>
                  </Link>
                </Stack>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/create-dao">
                    <Button w="full" variant="ghost">
                      Create DAO
                    </Button>
                  </Link>
                </Stack>
                <Stack as={"nav"} spacing={4}>
                  <Link href="/explore">
                    <Button w="full" variant="ghost">
                      Explore
                    </Button>
                  </Link>
                </Stack>

                <Stack as={"nav"} spacing={4}>
                  <Link href="/profile">
                    <Button w="full" variant="ghost">
                      Profile
                    </Button>
                  </Link>
                </Stack>
              </>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
}
