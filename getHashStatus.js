import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';
import dotenv from "dotenv";

dotenv.config();

// connect to columbus-5 mainnet through quicknode endpoint
const terra = new LCDClient({
	URL: 'https://divine-spring-glitter.terra-mainnet.quiknode.pro/3caffc39244bcd807ad92c93aced227c6d5bb160/',
	chainID: 'columbus-5',
  });

// Replace with TX hash to lookup.
const hash = '80B7EAA401FFAD0A83028457CCC9B38460F090A55921F8369ABADD92C3B66B5F';
const txInfo = await terra.tx.txInfo(hash);
console.log(txInfo);