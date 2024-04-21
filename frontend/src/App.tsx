// @ts-nocheck comment
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import CreateDAO from "./pages/CreateDAO/CreateDAO";
import RegisterUser from "./pages/RegisterUser/RegisterUser";
import Explore from "./pages/Explore";
import IndividualDAO from "./pages/IndividualDAO/IndividualDAO";
import DAOAdmin from "./pages/DAOAdmin/DAOAdmin";
import InviteCode from "./pages/InviteCode/InviteCode";
import Profile from "./pages/Profile/Profile";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { gnosisChiado } from "@wagmi/core/chains";

import "./App.css";

import { EthersExtension } from "@dynamic-labs/ethers-v5";

const config = createConfig({
  chains: [gnosisChiado],
  multiInjectedProviderDiscovery: false,
  transports: {
    [gnosisChiado.id]: http(),
  },
});

const evmNetworks = [
  {
    blockExplorerUrls: ["https://blockscout.chiadochain.net"],
    chainId: 10200,
    chainName: "Gnosis Chaido Testnet",
    iconUrls: [
      "https://openseauserdata.com/files/bf23594802bc31b77dafeb42705a686a.jpg",
    ],
    name: "Gnosis Chaido Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "xDAI",
      symbol: "xDAI",
    },
    networkId: 10200,

    rpcUrls: ["https://rpc.chiadochain.net"],
    vanityName: "Gnosis Chaido Testnet",
  },
];

const queryClient = new QueryClient();

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "93021a16-f70d-49ff-b5c4-e0b4ad6bff7e",
        walletConnectors: [EthereumWalletConnectors],
        walletConnectorExtensions: [EthersExtension],
        overrides: { evmNetworks },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Router>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create-dao" element={<CreateDAO />} />
                  <Route path="/register" element={<RegisterUser />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/dao/:daoId" element={<IndividualDAO />} />
                  <Route path="/dao/admin/:id" element={<DAOAdmin />} />
                  <Route path="/invitecode" element={<InviteCode />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
                <Footer />
              </Router>
            </div>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

export default App;
