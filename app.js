import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins } from '@terra-money/terra.js';
import fetch from 'isomorphic-fetch';

const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to columbus-5 mainnet
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
});

const wallet = terra.wallet(mk);

const anchor_contract_address = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu'
const orca_contract_address = 'terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z'

async function getBalance() {
	const [balance] = await terra.bank.balance(wallet.key.accAddress);
	console.log(balance.toData());

}
async function getAnchorBalance() {
	const response = await terra.wasm.contractQuery(anchor_contract_address, { balance: { address: wallet.key.accAddress }});

	console.log(response);
}


function submitBid(uaustAmount = 5000000, premium = 2) {
	
	// executeMsg Submit Bid aUST on Orca aUST Vault on Columbus-5 Mainnet
	const executeMsg = {
	  "send": {
	    "msg": {"submit_bid":{"premium_slot":premium,"collateral_token":"terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp","strategy":{"activate_at":{"ltv":99,"cumulative_value":"1000000000000"},"deactivate_at":{"ltv":99,"cumulative_value":"100000000000"}}}},
	    "amount": uaustAmount,
	    "contract": "terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z"
	  }
	};

	const execute = new MsgExecuteContract(
	  wallet.key.accAddress, // sender
	  anchor_contract_address, // contract account address
	  { ...executeMsg } // handle msg
	);

	wallet
	  .createAndSignTx({
	    msgs: [execute],
	    memo: 'deposit to orca!',
	  })
	  .then(tx => terra.tx.broadcast(tx))
	  .then(result => {
	    console.log(`TX hash: ${result.txhash}`);
	  });		  
}

async function getIdxs() {

	const queryMsg = {
	  "bids_by_user": {
	      "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
	      "bidder": wallet.key.accAddress
	  }
	};
	const response = await terra.wasm.contractQuery(orca_contract_address, queryMsg);

	// console.log(response.bids.length);
	// console.log(response.bids[0].idx);
	for (const x of response.bids) {
	  console.log(x.idx);
	}
}


function claimLiquidations(bids_idx) {
	// executeMsg Claim Liquidations on Orca aUST Vault on Columbus-5 Mainnet
	const executeMsg = {
	  "claim_liquidations": {
	    "bids_idx": bids_idx,
	    "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
	  }
	};

	const execute = new MsgExecuteContract(
	  wallet.key.accAddress, // sender
	  orca_contract_address, // contract account address
	  { ...executeMsg } // handle msg
	);


	wallet
	  .createAndSignTx({
	    msgs: [execute],
	    memo: 'claim liquidations on orca!',
	  })
	  .then(tx => terra.tx.broadcast(tx))
	  .then(result => {
	    console.log(`TX hash: ${result.txhash}`);
	  });
}


