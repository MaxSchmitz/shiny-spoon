import { LCDClient, MnemonicKey } from '@terra-money/terra.js';
import dotenv from "dotenv";

dotenv.config();

const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to columbus-5 mainnet through quicknode endpoint
const terra = new LCDClient({
	URL: `https://divine-spring-glitter.terra-mainnet.quiknode.pro/${process.env.AUTH_TOKEN}/`,
	chainID: 'columbus-5',
  });

// connect to columbus-5 mainnet
// const terra = new LCDClient({
//   URL: 'https://lcd.terra.dev',
//   chainID: 'columbus-5',
// });

const wallet = terra.wallet(mk);

// 
// Returns current wallet balance
// 
export async function getBalance() {
	const [balance] = await terra.bank.balance(wallet.key.accAddress);
	// console.log(balance.toData());
	return balance.toData();
}

// 
// Returns current CW20 contract_address balance for wallet
// 
export async function getCW20Balance(contract_address) {
	const response = await terra.wasm.contractQuery(contract_address, { balance: { address: wallet.key.accAddress }});
	console.log(response);
	return response.balance;
}