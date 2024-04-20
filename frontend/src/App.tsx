// @ts-nocheck comment
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import CreateDAO from "./pages/CreateDAO/CreateDAO";
import RegisterUser from "./pages/RegisterUser/RegisterUser";
import Explore from "./pages/Explore";
import DAOAdmin from "./pages/DAOAdmin/DAOAdmin";
import InviteCode from "./pages/InviteCode/InviteCode";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import Navbar from "./components/Navbar/Navbar";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

import "./App.css";

import { EthersExtension } from "@dynamic-labs/ethers-v5";

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
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-dao" element={<CreateDAO />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/dao/admin/:id" element={<DAOAdmin />} />
          <Route path="/invitecode" element={<InviteCode />} />
        </Routes>
      </Router>
    </DynamicContextProvider>
  );
}

export default App;
