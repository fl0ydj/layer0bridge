import _ from "lodash";

const path = require("path");
const fs = require("fs");

export function getDeploymentAddresses(networkName: any) {
  const DEPLOYMENT_PATH = path.resolve(__dirname, "deployments");

  let folderName = networkName;
  if (networkName === "hardhat") {
    folderName = "localhost";
  }

  const networkFolderName = fs
    .readdirSync(DEPLOYMENT_PATH)
    .filter((f: any) => f === folderName)[0];
  if (networkFolderName === undefined) {
    throw new Error("missing deployment files for endpoint " + folderName);
  }

  let rtnAddresses = {};
  const networkFolderPath = path.resolve(DEPLOYMENT_PATH, folderName);
  const files = fs
    .readdirSync(networkFolderPath)
    .filter((f: any) => f.includes(".json"));
  files.forEach((file: any) => {
    const filepath = path.resolve(networkFolderPath, file);
    const data = JSON.parse(fs.readFileSync(filepath));
    const contractName = file.split(".")[0];
    _.set(rtnAddresses, contractName, data.address);
  });

  return rtnAddresses;
}
