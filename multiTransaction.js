import { LCDClient, MsgSend, MnemonicKey } from '@terra-money/terra.js';
import { MsgExecuteContract } from '@terra-money/terra.js';
import dotenv from "dotenv";

dotenv.config();

// create a key out of a mnemonic
// this needs to be securely stored only use testnet
const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to columbus-5 mainnet through quicknode endpoint
// const terra = new LCDClient({
// 	URL: 'https://divine-spring-glitter.terra-mainnet.quiknode.pro/3caffc39244bcd807ad92c93aced227c6d5bb160/',
// 	chainID: 'columbus-5',
//   });

// connect to columbus-5 mainnet
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
});

// a wallet can be created out of any key
// wallets abstract transaction building
const wallet = terra.wallet(mk);

// Anchor aUST Token
const aust_contract_address = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu';
// Anchor bLuna Token
const bluna_contract_address = 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp';
// Kujira Orca aUST Vault
const orca_contract_address = 'terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z';
// Astroport Router
const router_contract_address = 'terra16t7dpwwgx9n3lq6l6te3753lsjqwhxwpday9zx';
// Anchor Market
const anchor_market_contract_address = 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s';
// White Whale UST Vault
const white_whale_contract_address = 'terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy';

// We need to pass bids_idx to the claim liquidations msg
// Get bids_idx first
async function getIdxs() {
	let bids_idx = [];
	const queryMsg = {
	  "bids_by_user": {
	      "collateral_token": bluna_contract_address,
	      "bidder": wallet.key.accAddress
	  }
	};
	const response = await terra.wasm.contractQuery(orca_contract_address, queryMsg);
	// console.log(response);
	// console.log(response.bids.length);
	// console.log(response.bids[0].idx);
	for (const x of response.bids) {
		bids_idx.push(x.idx);
		// console.log(x.proxied_bid.idx);
		// console.log(x.proxied_bid.pending_liquidated_collateral);
	}
	return bids_idx;
}

const bids_idx = await getIdxs();

async function claimLiquidations(bids_idx) {
  // executeMsg Claim Liquidations on Orca aUST Vault on Columbus-5 Mainnet
  const executeMsg = {
    "claim_liquidations": {
      "bids_idx": bids_idx,
      "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
    }
  }

  const execute = new MsgExecuteContract(
    wallet.key.accAddress, // sender
    orca_contract_address, // contract account address
    { ...executeMsg } // handle msg
  );

  console.log(executeMsg);

  const tx = await wallet.createAndSignTx({ msgs: [execute] });
  const result = await terra.tx.broadcast(tx);

  return result.txhash;
}


console.log('claiming bluna');
const claimTxHash = await claimLiquidations(bids_idx);
console.log(`claimTxHash: ${claimTxHash}`);


// TX hash to lookup.
const txInfo = await terra.tx.txInfo(claimTxHash);
console.log(txInfo);