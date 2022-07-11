import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import LZ_ENDPOINTS from "../constants/layerzeroEndpoints.json";
import { ContractFactory, utils } from "ethers";
import { accounts } from "../src/accounts";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import _ from "lodash";

const deployer: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const endpointAddr = _.get(LZ_ENDPOINTS, hre.network.name);
  console.log(
    `[${hre.network.name}] LayerZero Endpoint address: ${endpointAddr}`
  );
  const { deployAccount } = await getNamedAccounts();
  await deploy("Jtoken", {
    from: deployAccount,
    args: [endpointAddr],
    log: true,
    waitConfirmations: 1,
  });
};
export default deployer;
deployer.tags = ["target"];
