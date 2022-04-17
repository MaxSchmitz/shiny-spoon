import fetch from 'isomorphic-fetch';
import { MsgSend, MnemonicKey, Coins, LCDClient } from '@terra-money/terra.js';

// connect to columbus-5 mainnet
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
});

const contractAddress = 'terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z';
const walletAddress = 'terra17ewvzl9tlkg5guhrct99luvgjly4m96dk6qrd8';

const queryMsg = {
  "bids_by_user": {
      "collateral_token": "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
      "bidder": walletAddress
  }
};
const response = await terra.wasm.contractQuery(contractAddress, queryMsg);

// console.log(response.bids.length);
// console.log(response.bids[0].idx);
for (const x of response.bids) {
  console.log(x.idx);
}

