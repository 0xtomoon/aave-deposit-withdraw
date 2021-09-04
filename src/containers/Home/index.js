import React, { useEffect, useState, useRef } from "react";
import AccountCard from "../../components/common/AccountCard";
import Chart from "../../components/common/Chart";
import TextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import * as api from "../../services/api";

import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers'
import {formatUnits, parseUnits} from "@ethersproject/units";

import { injected } from "../../components/wallet/connectors";
import { formatData, TOKENS_BY_SYMBOL, LP_ADDRESS_PROVIDER_ADDRESS } from "../../utils";

import LendingPoolAddressProviderABI from '../../abi/AddressProvider.json'
import LendingPoolABI from '../../abi/LendingPool.json'

import { Grid, Row, Col } from 'react-flexbox-grid';
import "./style.scss";

function Home() {
  const { chainId, account, library: provider, activate, active } = useWeb3React();
  const url = "https://api.pro.coinbase.com";
  const [pastData, setPastData] = useState({});
  const depositRef = useRef();
  const withdrawRef = useRef();
  const [daiBalance, setDaiBalance] = useState(0);
  const [aDaiBalance, setADaiBalance] = useState(0);
  const { fetchHistoricalData } = api;
  
  useEffect(() => {
    // get chart data
    const today = new Date();
    let start = new Date();
    start.setDate(start.getDate() - 30);
    start = start.toISOString();
    const end = today.toISOString();
    
    const historicalDataURL = `${url}/products/ETH-USD/candles?start=${start}&end=${end}&granularity=86400`;
    const getData = async () => {
      const graphData = await fetchHistoricalData(historicalDataURL);
      setPastData(graphData);
    }
    getData();
  }, []);

  useEffect(() => {
    if(!account || !provider) {
      return;
    }

    updateBalance();
  }, [account]);
  
  const updateBalance = async () => {
    const daiContract = new ethers.Contract(TOKENS_BY_SYMBOL['DAI'].address, TOKENS_BY_SYMBOL['DAI'].abi, provider)
    const daiBal = await daiContract.balanceOf(account);
    setDaiBalance(parseFloat(formatUnits(daiBal, TOKENS_BY_SYMBOL['DAI'].decimals)).toPrecision(4));

    const aDaiContract = new ethers.Contract(TOKENS_BY_SYMBOL['aDAI'].address, TOKENS_BY_SYMBOL['aDAI'].abi, provider)
    const aDaiBal = await aDaiContract.balanceOf(account);
    setADaiBalance(parseFloat(formatUnits(aDaiBal, TOKENS_BY_SYMBOL['aDAI'].decimals)).toPrecision(4));
  }

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  // Create the LendingPoolAddressProvider contract instance
  const getLendingPoolAddressProviderContract = () => {
    const lpAddressProviderAddress = LP_ADDRESS_PROVIDER_ADDRESS; // kovan address, https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    const lpAddressProviderContract = new ethers.Contract(lpAddressProviderAddress, LendingPoolAddressProviderABI, provider);
    return lpAddressProviderContract;
  }

  // Get the latest LendingPool address
  const getLendingPoolAddress = async () => {
    const lpAddress = await getLendingPoolAddressProviderContract()
      .getLendingPool()
      .catch((e) => {
        throw Error(`Error getting lendingPool address: ${e.message}`)
      })
    
    return lpAddress
  }

  const approveDai = async () => {
    if(!account || !provider) {
      return;
    }

    try {
      const depositVal = depositRef.current.value;
      const lpAddress = await getLendingPoolAddress();
      // Approve the LendingPoolCore address with the DAI contract
      const daiContract = new ethers.Contract(TOKENS_BY_SYMBOL['DAI'].address, TOKENS_BY_SYMBOL['DAI'].abi, provider.getSigner())
      const gaslimit = await daiContract
        .estimateGas.approve(lpAddress, parseUnits(depositVal, TOKENS_BY_SYMBOL['DAI'].decimals));

      const tx = await daiContract
        .approve(lpAddress, parseUnits(depositVal, TOKENS_BY_SYMBOL['DAI'].decimals), {gasLimit: gaslimit})
        .catch((e) => {
          throw Error(`Error approving DAI allowance: ${e.message}`)
        })

      await tx.wait();
    } catch (e) {
      alert(e.message)
      console.log(e.message)
    }
  }

  const depositDai = async () => {
    if(!account || !provider) {
      return;
    }

    try {
      const depositVal = depositRef.current.value;
      const lpAddress = await getLendingPoolAddress()
      const lpContract = new ethers.Contract(lpAddress, LendingPoolABI, provider.getSigner())
      const referralCode = "0x0"
      
      const gaslimit = await lpContract
        .estimateGas.deposit(TOKENS_BY_SYMBOL['DAI'].address, parseUnits(depositVal, TOKENS_BY_SYMBOL['DAI'].decimals).toString(), account, referralCode)
      const tx = await lpContract
        .deposit(TOKENS_BY_SYMBOL['DAI'].address, parseUnits(depositVal, TOKENS_BY_SYMBOL['DAI'].decimals).toString(), account, referralCode, {gasLimit: gaslimit})
        .catch((e) => {
          throw Error(`Error depositing to the LendingPool contract: ${e.message}`)
        })

      await tx.wait();
      updateBalance();
    } catch (e) {
      alert(e.message)
      console.log(e.message)
    }
  }

  const withdrawDai = async () => {
    if(!account || !provider) {
      return;
    }

    try {
      const withdrawVal = withdrawRef.current.value;
      const lpAddress = await getLendingPoolAddress()
      const lpContract = new ethers.Contract(lpAddress, LendingPoolABI, provider.getSigner())
      const referralCode = "0x0"

      const gaslimit = await lpContract
        .estimateGas.withdraw(TOKENS_BY_SYMBOL['DAI'].address, parseUnits(withdrawVal, TOKENS_BY_SYMBOL['DAI'].decimals).toString(), account)
      const tx = await lpContract
        .withdraw(TOKENS_BY_SYMBOL['DAI'].address, parseUnits(withdrawVal, TOKENS_BY_SYMBOL['DAI'].decimals).toString(), account, {gasLimit: gaslimit})
        .catch((e) => {
          throw Error(`Error withdrawing : ${e.message}`)
        })
        
      await tx.wait();
      updateBalance();
    } catch (e) {
      alert(e.message)
      console.log(e.message)
    }
  }

  return (
    <Grid className="container">
      <Row className="head-row">
        <Button onClick={connectWallet}> Connect Wallet </Button>
      </Row>
      <div className="account-row">
        <AccountCard
          title="Connected Account"
          text={ account == undefined ? '' : account.substring(0, 11) + '...' }
        />
        <AccountCard
          title="DAI Balance"
          text={ daiBalance + ' DAI' }
        />
        <AccountCard
          title="Connected Account"
          text={ aDaiBalance + ' aDAI' }
        />
      </div>
      <Row className="body-row">
        <Col md={7}>
          <div className="chart-wrapper">
            <Chart data={pastData} />
          </div>
        </Col>
        <Col md={5}>
          <div className="deposit-card">
            <h3>Deposit DAI into Aave v2</h3>
            <div>
              <TextInput inputRef={depositRef}></TextInput>
              <div className="action-div">
                <Button onClick={approveDai}>Approve</Button>
                <Button onClick={depositDai}>Deposit</Button>
              </div>
            </div>
          </div>

          <div className="withdraw-card">
            <h3>Withdraw DAI from Aave v2</h3>
            <div>
              <TextInput inputRef={withdrawRef}></TextInput>
              <div className="action-div">
                <Button onClick={withdrawDai}>Withdraw</Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Grid>
  );
}

export default Home;
