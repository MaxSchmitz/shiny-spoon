import { LCDClient, MsgSend, MnemonicKey, MsgExecuteContract, Coins, Coin } from '@terra-money/terra.js';

const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
});

// connect to columbus-5 mainnet
const terra = new LCDClient({
    URL: 'https://lcd.terra.dev',
    chainID: 'columbus-5',
  });

const wallet = terra.wallet(mk);

// Anchor aUST Token
const aust_contract_address = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu'
// Anchor Market
const anchor_market_contract_address = 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s';

async function getCW20Balance(contract_address) {
	const response = await terra.wasm.contractQuery(contract_address, { balance: { address: wallet.key.accAddress }});
	console.log(response);
	return response.balance;
}

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
  
    console.log(result);
  }  


// subtracting 10 ust to always keep some ust in wallet for transaction fees
const deposit_amount = await getCW20Balance(aust_contract_address) - 10000000;
console.log(`deposit amount is ${deposit_amount}`);

// this will deposit and amount in uust to anchor earn on MAINNET
// anchorDeposit("1000000");