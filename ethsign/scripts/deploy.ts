import {ethers, upgrades} from 'hardhat'

async function main() {
    const Factory = await ethers.getContractFactory('UserSide')
    const instance = await Factory.deploy([]),
    const contract = await instance.waitForDeployment()
    console.log('UserSide:',await contract.getAddress());

}

void main()
