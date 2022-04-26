import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';
import dotenv from "dotenv";

dotenv.config();
const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to columbus-5 mainnet through quicknode endpoint
const terra = new LCDClient({
	URL: 'https://divine-spring-glitter.terra-mainnet.quiknode.pro/3caffc39244bcd807ad92c93aced227c6d5bb160/',
	chainID: 'columbus-5',
  });

const wallet = terra.wallet(mk);

// Anchor aUST Token
const aust_contract_address = "terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu";
// Anchor bLuna Token
const bluna_contract_address = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp";
// Kujira Orca aUST Vault
const orca_contract_address = "terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z";
// Astroport Router
const router_contract_address = "terra16t7dpwwgx9n3lq6l6te3753lsjqwhxwpday9zx";
// Anchor Market
const anchor_market_contract_address = "terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s";

async function getPendingLiquidatedCollateral() {
	let liquidated_collateral = 0;
	const queryMsg = {
	  "bids_by_user": {
	      "collateral_token": bluna_contract_address,
	      "bidder": wallet.key.accAddress
	  }
	};
	const response = await terra.wasm.contractQuery(orca_contract_address, queryMsg);
	console.log(response);
	// console.log(response.bids.length);
	// console.log(response.bids[0].idx);
	for (const x of response.bids) {
		liquidated_collateral += x.proxied_bid.pending_liquidated_collateral;
		// console.log(x.proxied_bid.idx);
		// console.log(x.proxied_bid.pending_liquidated_collateral);
	}
	return liquidated_collateral;
}
// console.log(mk);
// console.log(bluna_contract_address);
console.log(wallet.key.accAddress);
const pending_liquidated_collateral = await getPendingLiquidatedCollateral();
console.log(`Pending Liquidated Collateral: ${pending_liquidated_collateral}`);