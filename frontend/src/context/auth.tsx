import { createContext, useEffect, useState, ReactNode } from "react";
import { ethers } from "ethers";

import {
  AuthKitSignInData,
  SafeAuthInitOptions,
  SafeAuthPack,
  SafeAuthUserInfo,
} from "@safe-global/auth-kit";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({});

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [safeAuthPack, setSafeAuthPack] = useState<SafeAuthPack>();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!safeAuthPack?.isAuthenticated
  );
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<AuthKitSignInData | null>(null);
  const [userInfo, setUserInfo] = useState<SafeAuthUserInfo | null>(null);
  const [chainId, setChainId] = useState<string>();
  const [balance, setBalance] = useState<string>();
  const [consoleMessage, setConsoleMessage] = useState<string>("");
  const [consoleTitle, setConsoleTitle] = useState<string>("");
  const [provider, setProvider] = useState();

  useEffect(() => {
    (async () => {
      const options: SafeAuthInitOptions = {
        enableLogging: true,
        buildEnv: "production",
        chainConfig: {
          chainId: "0x10200",
          displayName: "ChiadoChain",
          rpcTarget: "https://rpc.chiadochain.net",
          blockExplorerURL: "https://blockscout.chiadochain.net",
          ticker: "xDAI",
          tickerName: "Gnosis Chain",
        },
      };

      const authPack = new SafeAuthPack();

      await authPack.init(options);

      console.log("safeAuthPack:safeEmbed", authPack.safeAuthEmbed);

      setSafeAuthPack(authPack);

      authPack.subscribe("accountsChanged", async (accounts) => {
        console.log(
          "safeAuthPack:accountsChanged",
          accounts,
          authPack.isAuthenticated
        );
        if (authPack.isAuthenticated) {
          const signInInfo = await authPack?.signIn();

          setSafeAuthSignInResponse(signInInfo);
          setIsAuthenticated(true);
        }
      });

      authPack.subscribe("chainChanged", (eventData) =>
        console.log("safeAuthPack:chainChanged", eventData)
      );
    })();
  }, []);

  useEffect(() => {
    if (!safeAuthPack || !isAuthenticated) return;
    (async () => {
      const web3Provider = safeAuthPack.getProvider();
      const userInfo = await safeAuthPack.getUserInfo();

      setUserInfo(userInfo);

      if (web3Provider) {
        const provider = new ethers.providers.Web3Provider(
          safeAuthPack.getProvider()
        );
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();

        setChainId((await provider.getNetwork()).chainId.toString());
        setBalance(
          ethers.formatEther(
            (await provider.getBalance(signerAddress)) as ethers.BigNumberish
          )
        );
        setProvider(provider);
      }
    })();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        safeAuthPack,
        isAuthenticated,
        safeAuthSignInResponse,
        setIsAuthenticated,
        setSafeAuthSignInResponse,
        userInfo,
        chainId,
        balance,
        provider,
        consoleMessage,
        consoleTitle,
        setConsoleMessage,
        setConsoleTitle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
