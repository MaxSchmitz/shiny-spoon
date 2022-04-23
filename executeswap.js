import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';

const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});
// connect to bombay testnet
// const terra = new LCDClient({
//   URL: 'https://bombay-lcd.terra.dev',
//   chainID: 'bombay-12',
// });

// connect to columbus-5 mainnet
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
});

// To use LocalTerra
// const terra = new LCDClient({
//   URL: 'http://localhost:1317',
//   chainID: 'localterra'
// });

const wallet = terra.wallet(mk);

async function butter() {
  const oracleDenoms = await terra.oracle.exchangeRates();
  console.log(oracleDenoms);
}

// butter();

async function getBalance() {
	const [balance] = await terra.bank.balance(wallet.key.accAddress);
	console.log(balance.toData());
	return balance.toData();
}

// getBalance();

const bluna_contract_address_testnet = 'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x';
const bluna_contract_address = 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp';
const aust_contract_address_testnet = 'terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl';
const aust_contract_address = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu';

async function getbLunaBalance() {
	const response = await terra.wasm.contractQuery(bluna_contract_address, { balance: { address: wallet.key.accAddress }});
	// console.log(response);
	return response.balance;
}

async function getAustBalance() {
	const response = await terra.wasm.contractQuery(aust_contract_address, { balance: { address: wallet.key.accAddress }});
	console.log(response);
	return response.balance;
}



const my_bluna_balance = await getbLunaBalance();
console.log(`wallet bluna balance: ${my_bluna_balance}`);

const router_contract_address = 'terra16t7dpwwgx9n3lq6l6te3753lsjqwhxwpday9zx';
// Anchor bLuna Token

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

  console.log(result);
}  

const offer_amount = "10000"
const minimum_receive = await simulateSwap(offer_amount);
console.log(minimum_receive);
// subtracting 1000 from minimum recieve because sometimes transactions are off by a tiny bit casuing them to fail.
// figure out how to fix this


// This will swap on MAINNET
// swapbLunaUst(offer_amount, minimum_receive-1000);