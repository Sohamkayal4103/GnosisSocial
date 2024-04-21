import {ethers, upgrades} from 'hardhat'

async function main() {
    const Factory = await ethers.getContractFactory('Counter')
    const instance = await Factory.deploy([]),
    const contract = await instance.waitForDeployment()
    console.log('Counter',await contract.getAddress());

}

void main()
