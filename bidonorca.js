import { LCDClient, MsgSend, MnemonicKey } from '@terra-money/terra.js';
import { MsgExecuteContract } from '@terra-money/terra.js';


// create a key out of a mnemonic
// this needs to be securely stored only use testnet
const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to bombay testnet
const terra = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainID: 'bombay-12',
});

// To use LocalTerra
// const terra = new LCDClient({
//   URL: 'http://localhost:1317',
//   chainID: 'localterra'
// });

// a wallet can be created out of any key
// wallets abstract transaction building
const wallet = terra.wallet(mk);

// contract addresses for contracts
// maybe this can be stored better?
const contract_address = ['terra18j0wd0f62afcugw2rx5y8e6j5qjxd7d6qsc87r', 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu'];

// executeMsg on Testnet
const executeMsg = {"submit_bid": {"premium_slot": 1, "collateral_token": "terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x"}};

const execute = new MsgExecuteContract(
  wallet.key.accAddress, // sender
  contract_address[0], // contract account address
  { ...executeMsg }, // handle msg
  { uusd: 1000000 } // coins  { "denom": "uusd", "amount": "1000000", "key": 0 }
);

// executeMsg Submit Bid aUST on Orca aUST Vault on Columbus-5 Mainnet
// const executeMsg = {
//   "send": {
//     "msg": "eyJzdWJtaXRfYmlkIjp7InByZW1pdW1fc2xvdCI6MSwiY29sbGF0ZXJhbF90b2tlbiI6InRlcnJhMWtjODdtdTQ2MGZ3a3F0ZTI5cnF1aDRoYzIwbTU0Znh3dHN4N2dwIiwic3RyYXRlZ3kiOnsiYWN0aXZhdGVfYXQiOnsibHR2Ijo5OSwiY3VtdWxhdGl2ZV92YWx1ZSI6IjEwMDAwMDAwMDAwMDAifSwiZGVhY3RpdmF0ZV9hdCI6eyJsdHYiOjk5LCJjdW11bGF0aXZlX3ZhbHVlIjoiMTAwMDAwMDAwMDAwIn19fX0=",
//     "amount": "4061872",
//     "contract": "terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z"
//   }
// };

// const execute = new MsgExecuteContract(
//   wallet.key.accAddress, // sender
//   contract_address[1], // contract account address
//   { ...executeMsg } // handle msg
// );


wallet
  .createAndSignTx({
    msgs: [execute],
    memo: 'test deposit to orca!',
  })
  .then(tx => terra.tx.broadcast(tx))
  .then(result => {
    console.log(`TX hash: ${result.txhash}`);
  });



