import React from "react";
import Routes from "./router";

import { Web3ReactProvider } from '@web3-react/core';
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Routes />
    </Web3ReactProvider>
  );
}
