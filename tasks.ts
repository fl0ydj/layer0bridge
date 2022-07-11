import { task } from "hardhat/config";
import _ from "lodash";
import { getDeploymentAddresses } from "./readStatic";
const CHAIN_ID = {
  ethereum: 1,
  bsc: 2,
  avalanche: 6,
  polygon: 9,
  arbitrum: 10,
  optimism: 11,
  fantom: 12,

  rinkeby: 10001,
  "bsc-testnet": 10002,
  fuji: 10006,
  mumbai: 10009,
  "arbitrum-rinkeby": 10010,
  "optimism-kovan": 10011,
  "fantom-testnet": 10012,
};
export const setTrustedRemote = task(
  "setTrustedRemote",
  "Sets trusted network",
  async function (taskArgs, hre) {
    let srcContractName: string;
    let dstContractName: string;
    const args = taskArgs as {
      srcContract?: string;
      dstContract?: string;
      targetNetwork: string;
    };
    if (args.srcContract && args.dstContract) {
      srcContractName = args.srcContract;
      dstContractName = args.dstContract;
    } else {
      srcContractName = "Jtoken";
      dstContractName = srcContractName;
      if (args.targetNetwork == "rinkeby") {
        // if its the base chain, we need to grab a different contract
        // Note: its reversed though!
        dstContractName = "BasedJtoken";
      }
      if (hre.network.name == "rinkeby") {
        srcContractName = "BasedJtoken";
      }
    }

    const dstChainId = _.get(CHAIN_ID, args.targetNetwork);
    // console.log(getDeploymentAddresses(taskArgs.targetNetwork))
    const dstAddr = _.get(
      getDeploymentAddresses(args.targetNetwork),
      dstContractName
    );
    // get local contract instance
    const srcAddress = _.get(
      getDeploymentAddresses(
        args.targetNetwork == "rinkeby" ? "bsc-testnet" : "rinkeby"
      ),
      srcContractName
    );
    const contractInstance = await hre.ethers.getContractAt(
      srcContractName,
      srcAddress
    );
    console.log(`[source] contract address: ${contractInstance.address}`);
    const isTrustedRemoteSet = await contractInstance.isTrustedRemote(
      dstChainId,
      dstAddr
    );
    if (!isTrustedRemoteSet) {
      // setTrustedRemote() on the local contract, so it can receive message from the source contract
      try {
        let tx = await (
          await contractInstance.setTrustedRemote(dstChainId, dstAddr)
        ).wait();
        console.log(
          `✅ [${hre.network.name}] setTrustedRemote(${dstChainId}, ${dstAddr})`
        );
        console.log(` tx: ${tx.transactionHash}`);
      } catch (e: any) {
        if (
          e.error.message.includes("The chainId + address is already trusted")
        ) {
          console.log("*source already set*");
        } else {
          console.log(
            `❌ [${hre.network.name}] setTrustedRemote(${dstChainId}, ${dstAddr})`
          );
        }
      }
    } else {
      console.log("*source already set*");
    }
  }
).addParam("targetNetwork", "the target network to set as a trusted remote");

task(
  "oftSend",
  "basedOFT.send()  tokens to another chain",
  async function (taskArgs, hre) {
    let signers = await hre.ethers.getSigners();
    let owner = signers[0];
    let tx;
    const args = taskArgs as { targetNetwork: string; qty: string };
    const dstChainId = _.get(CHAIN_ID, args.targetNetwork);
    const qty = hre.ethers.utils.parseEther(args.qty);

    let srcContractName = "Jtoken";
    let dstContractName = srcContractName;
    if (args.targetNetwork == "rinkeby") {
      // if its the base chain, we need to grab a different contract
      // Note: its reversed though!
      dstContractName = "BasedJtoken";
    }
    if (hre.network.name == "rinkeby") {
      srcContractName = "BasedJtoken";
    }
    // console.log(getDeploymentAddresses(taskArgs.targetNetwork))
    const dstAddr = _.get(
      getDeploymentAddresses(args.targetNetwork),
      dstContractName
    );
    // get local contract instance
    const srcAddress = _.get(
      getDeploymentAddresses(
        args.targetNetwork == "rinkeby" ? "bsc-testnet" : "rinkeby"
      ),
      srcContractName
    );
    const contractInstance = await hre.ethers.getContractAt(
      srcContractName,
      srcAddress
    );
    console.log(`[source] contract address: ${contractInstance.address}`);

    tx = await (
      await contractInstance.approve(contractInstance.address, qty)
    ).wait();
    console.log(`approve tx: ${tx.transactionHash}`);

    let adapterParams = hre.ethers.utils.solidityPack(
      ["uint16", "uint256"],
      [1, 200000]
    ); // default adapterParams example

    tx = await (
      await contractInstance.sendFrom(
        owner.address,
        dstChainId, // destination LayerZero chainId
        owner.address, // the 'to' address to send tokens
        qty, // the amount of tokens to send (in wei)
        owner.address, // the refund address (if too much message fee is sent, it gets refunded)
        hre.ethers.constants.AddressZero,
        adapterParams,
        { value: hre.ethers.utils.parseEther("1") } // estimate/guess 1 eth will cover
      )
    ).wait();
    console.log(
      `✅ Message Sent [${hre.network.name}] sendTokens() to OFT @ LZ chainId[${dstChainId}] token:[${dstAddr}]`
    );
    console.log(` tx: ${tx.transactionHash}`);
    console.log(
      `* check your address [${owner.address}] on the destination chain, in the ERC20 transaction tab !"`
    );
  }
)
  .addParam("qty", "qty of tokens to send")
  .addParam(
    "targetNetwork",
    "the target network to let this instance receive messages from"
  );
