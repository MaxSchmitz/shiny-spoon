import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';
import dotenv from "dotenv";

dotenv.config();

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

// connect to columbus-5 mainnet through quicknode endpoint
// const terra = new LCDClient({
// 	URL: 'https://divine-spring-glitter.terra-mainnet.quiknode.pro/3caffc39244bcd807ad92c93aced227c6d5bb160/',
// 	chainID: 'columbus-5',
//   });


const wallet = terra.wallet(mk);

const router_contract_address = 'terra16t7dpwwgx9n3lq6l6te3753lsjqwhxwpday9zx';

// Simulate bLUNA -> LUNA -> UST
export async function simulateSwap(offer_amount="123") {
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



const swap_rate = await simulateSwap();

console.log(swap_rate);
