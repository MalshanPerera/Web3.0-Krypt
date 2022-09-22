import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/LHqUAUteXdufpQlqjKKUJ7goMdtNPpQ8`,
      accounts: [
        'ed90707ca1df825cde561911765570ac877df901d7568f366ce639e3ccefd649',
      ],
    },
  },
};

export default config;
