import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';
import dotenv from "dotenv";
import {getBalance, getCW20Balance} from './getbalance.js';

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


// 
// 
// 
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

// 
// 
// 
async function getPendingLiquidatedCollateral() {
	let liquidated_collateral = 0;
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
	if (response) {
		for (const x of response.bids) {
			liquidated_collateral += x?.proxied_bid?.pending_liquidated_collateral;
			// console.log(x.proxied_bid.idx);
			// console.log(x.proxied_bid.pending_liquidated_collateral);
		}
	}
	
	return liquidated_collateral;
}

// 
// 
// 
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

// 
// 
// 
async function simulateSwap(offer_amount="123") {
    const queryMsg = {
        "simulate_swap_operations": {
          "offer_amount": offer_amount,
          "operations": [
           {
              "astro_swap": {
                "offer_asset_info": {
                  "token": {
                      "contract_addr": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
                    }
                },
                "ask_asset_info": {
                  "native_token": {
                      "denom": "uluna"
                    }
                }
              }
            },
            {
              "native_swap": {
                "offer_denom": "uluna",
                "ask_denom": "uusd"
              }
            }
          ]
        }
      }
	const response = await terra.wasm.contractQuery(router_contract_address, queryMsg);
	// console.log(response.amount);
	return response.amount;
}

// 
// 
// 
async function swapbLunaUst(offer_amount, minimum_receive, max_spread="0.15") {

	const swapMsg = {
	  "execute_swap_operations": {
		"offer_amount": offer_amount,
		"operations": [
		  {
			 "astro_swap": {
			   "offer_asset_info": {
				 "token": {
					 "contract_addr": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp"
				   }
			   },
			   "ask_asset_info": {
				 "native_token": {
					 "denom": "uluna"
				   }
			   }
			 }
		   },
		   {
			 "native_swap": {
			   "offer_denom": "uluna",
			   "ask_denom": "uusd"
			 }
		   }
		 ],
		"minimum_receive": minimum_receive,
		"max_spread": max_spread
	  }
	};
  
	const encodedStr = btoa(JSON.stringify(swapMsg));
  
	const executeMsg = {
	  "send": {
		"msg": encodedStr,
		"amount": offer_amount,
		"contract": router_contract_address
	  }
	};
	console.log(JSON.stringify(swapMsg));
	console.log(executeMsg);
  
	const execute = new MsgExecuteContract(
	  wallet.key.accAddress, // sender
	  bluna_contract_address, // mainnet contract account address
	  { ...executeMsg } // handle msg
	);
  
	const tx = await wallet.createAndSignTx({ msgs: [execute] });
	const result = await terra.tx.broadcast(tx);
  
	console.log(result);
	return result.txhash;
  }  

// 
// 
// 
async function anchorDeposit(uust_amount) {
  
    const executeMsg = {
        "deposit_stable": {}
      };
    
    console.log(executeMsg);
  
    const execute = new MsgExecuteContract(
      wallet.key.accAddress, // sender
      anchor_market_contract_address, // mainnet contract account address
      { ...executeMsg }, // handle msg
      new Coins({ uusd: uust_amount }),
    );
  
    // wallet
    // .createAndSignTx({
    //   msgs: [execute],
    //   memo: 'deposit to orca!',
    // })
    // .then(tx => terra.tx.broadcast(tx))
    // .then(result => {
    //   console.log(`TX hash: ${result.txhash}`);
    // });	
  
    const tx = await wallet.createAndSignTx({ msgs: [execute] });
    const result = await terra.tx.broadcast(tx);
  
    // console.log(result);
	return result;
  }  

// 
// 
// 
async function submitBid(amount_str, premium_slot = 3) {
	
	const submitMsg = {
		"submit_bid": {
		  "premium_slot": premium_slot,
		  "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
		  "strategy": {
			"activate_at": {
			  "ltv": 98,
			  "cumulative_value": "500000000000"
			},
			"deactivate_at": {
			  "ltv": 99,
			  "cumulative_value": "50000000000"
			}
		  }
		}
	  }

	const encodedStr = btoa(JSON.stringify(submitMsg));

	const executeMsg = {
	  "send": {
	    "msg": encodedStr,
	    "amount": amount_str,
	    "contract": orca_contract_address
	  }
	};

	const execute = new MsgExecuteContract(
	  wallet.key.accAddress, // sender
	  aust_contract_address, // contract account address
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


// 
// 
// 
async function runOrcaArb(threshold=1000000) {
	const pending_liquidated_collateral = await getPendingLiquidatedCollateral();
	console.log(`Pending Liquidated Collateral: ${pending_liquidated_collateral}`);
	if (pending_liquidated_collateral > threshold) {
		console.log(`Getting bids`);
		const my_bids = await getIdxs();
		console.log(`Claiming bLuna from liquidations Orca aUST Vault`);
		const claimTxHash = await claimLiquidations(my_bids);
		console.log(`claim luna Tx: ${claimTxHash}`);
		
	}
	const my_bluna = await getCW20Balance(bluna_contract_address);
	console.log(`ubLuna in wallet is ${my_bluna}`)
	if (my_bluna > threshold) {
		console.log(`Simulating swap bLUNA -> LUNA -> UST`)
		const minimum_receive = await simulateSwap(my_bluna);
		console.log(`Expecting ${minimum_receive-1000} uUST for ${my_bluna} ubluna`)
		console.log(`Executing Swap Operations on Astroport Router`);
		const swapTxHash = await swapbLunaUst(my_bluna, minimum_receive-1000);
		console.log(`swap bluna Tx: ${swapTxHash}`);
	}
	const my_ust = await getBalance();
	console.log(`uUST in wallet is ${my_ust[0].amount}`);
	if (my_ust[0].amount > 10000000) {
		console.log(`Depositing Stable uUST on Anchor Market`);
		const deposit_amount = my_ust[0].amount - 10000000;
		console.log(`Deposit amount is ${deposit_amount}`);
		const anchorHashTx = await anchorDeposit(deposit_amount);
		console.log(`anchor deposit Tx: ${anchorHashTx}`);
	}
	const my_aust = await getCW20Balance(aust_contract_address);
	console.log(`uaUST in wallet is ${my_aust} `)
	if (my_aust > 100) {
		console.log(`Submiting aUST Bid on Orca UST Vault`);
		await submitBid(my_aust, 2);
	}
	console.log(`Nothing left to do. Retrying in ${retry_interval/60000} Minutes		${Date()}`);

}

const claimable_bLuna = 0;
// retry interval in millseconds
const retry_interval = 300000;

console.log(`Starting Orca Arbs ${Date()}`);
console.log(`Address:  ${wallet.key.accAddress}`);
// run on interval
setInterval(runOrcaArb, retry_interval);

