import { NetworkFactory } from "web3-gear";

export const Config = {
  network: NetworkFactory.NetworkType.BSC,
  contract: {
    pancake: {
      router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
      masterChef: "0xa5f8c5dbd5f286960b9d90548680ae5ebff07652",
      lpToken: "0x0ed7e52944161450477ee417de9cd3a859b14fd0", //cake-BNB
    },
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  },
  NFTStorageAPIKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5MzRmMGRjM0REYUUwRkQ0NDlFZjI0Nzk4NzIzOUMwMEE0Mzc5ODkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MjM2OTM4OTA4NSwibmFtZSI6IkxQRG9nZSJ9.5k5l7DXzEYOxzVQ5ww5eiAP43jrdn-aHrzg4D3TbROE", // replace with your own API key
};
