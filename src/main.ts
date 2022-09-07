import { AbiItem } from "web3-utils";
import { NFTStorage, Blob } from "nft.storage";

import {
  ContractHelper,
  SwissKnife,
  LoggerFactory,
  SwapRouter,
} from "web3-gear";
import BigNumber from "bignumber.js";
import { Config } from "./config";
import ChefABI from "./abi/BSC/pancake.swap/master.chef.v2.json";

type LPSnapshot = {
  myLPTBalance: string;
  lptTotalSupply: string;
  token0: {
    token: any;
    amount: string;
    price: string;
  };
  token1: {
    token: any;
    amount: string;
    price: string;
  };
};

const NFTStorageAPIKey = Config.NFTStorageAPIKey;

const client = new NFTStorage({ token: NFTStorageAPIKey });

const userAddress = "0x1582B06D8C4b6c5990E2bA951D88A88363DaB891";

const logger = LoggerFactory.getInstance().getLogger("main");

const swissKnife = new SwissKnife(Config.network);

const chef = new ContractHelper(
  Config.contract.pancake.masterChef,
  ChefABI as AbiItem[],
  Config.network
);

const router = new SwapRouter(Config.contract.pancake.router, Config.network);

const main = async () => {
  const userInfo = await chef.callReadMethod("userInfo", 2, userAddress);
  logger.info(`my lpt amount: ${userInfo.amount}`);
  const lptDetails = await swissKnife.getPairedLPTokenDetails(
    Config.contract.pancake.lpToken
  );

  const myLPRatio = new BigNumber(userInfo.amount).dividedBy(
    lptDetails.totalSupply
  );

  const myToken0Amount = lptDetails.token0.readableAmountFromBN(
    myLPRatio.multipliedBy(lptDetails.reserve0)
  );
  logger.info(
    `my token0 - ${lptDetails.token0.symbol} amount: ${myToken0Amount.toFixed(
      4
    )}`
  );
  const myToken1Amount = lptDetails.token1.readableAmountFromBN(
    myLPRatio.multipliedBy(lptDetails.reserve1)
  );
  logger.info(
    `my token1 - ${lptDetails.token1.symbol} amount: ${myToken1Amount.toFixed(
      4
    )}`
  );

  const priceToken0 = await router.getAmountsOut(lptDetails.token0.address, 1, [
    lptDetails.token0.address,
    Config.contract.BUSD,
  ]);
  logger.info(
    `token0 - ${lptDetails.token0.symbol} price: ${priceToken0.toFixed(4)} USD`
  );

  const priceToken1 = await router.getAmountsOut(lptDetails.token1.address, 1, [
    lptDetails.token1.address,
    Config.contract.BUSD,
  ]);
  logger.info(
    `token1 - ${lptDetails.token1.symbol} price: ${priceToken1.toFixed(4)} USD`
  );

  const myTotalUSD =
    priceToken0 * myToken0Amount + priceToken1 * myToken1Amount;
  logger.info(`my total farming lp value: ${myTotalUSD.toFixed(4)} USD`);

  const myLPSnapshot: LPSnapshot = {
    myLPTBalance: new BigNumber(userInfo.amount)
      .dividedBy(1e18)
      .toNumber()
      .toFixed(4),
    lptTotalSupply: new BigNumber(lptDetails.totalSupply)
      .dividedBy(1e18)
      .toNumber()
      .toFixed(4),
    token0: {
      token: lptDetails.token0,
      amount: lptDetails.token1
        .readableAmountFromBN(lptDetails.reserve0)
        .toFixed(4),
      price: priceToken0.toFixed(6),
    },
    token1: {
      token: lptDetails.token1,
      amount: lptDetails.token1
        .readableAmountFromBN(lptDetails.reserve1)
        .toFixed(4),
      price: priceToken1.toFixed(6),
    },
  };

  const content = new Blob([JSON.stringify(myLPSnapshot, null, 2)], {
    type: "application/json",
  });
  // store into nft.storage
  const cid = await client.storeBlob(content);
  console.log(cid);
  console.log(myLPSnapshot);
};

main().catch((e) => {
  console.error(e.message);
});
