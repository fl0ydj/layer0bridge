export const accounts = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    pvKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    age: 20,
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    pvKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    age: 10,
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    pvKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    age: -1,
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    pvKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    age: 70,
  },
];
export interface account {
  address: string;
  pvKey: string;
  age: number;
}
