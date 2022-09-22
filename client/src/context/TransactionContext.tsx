import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractAbi, contractAddress } from '../utils/constants';
import { TransactionInterface } from '../utils/interfaces';

interface FormDataInterface {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}

interface TransactionContextInterface {
  currentAccount?: string;
  transactions: TransactionInterface[];
  isLoading: boolean;
  formData: FormDataInterface;
  setFormData: React.Dispatch<React.SetStateAction<FormDataInterface>>;
  connectWallet: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  sendTransaction: () => void;
}

export const TransactionContext =
  React.createContext<TransactionContextInterface | null>(null);

const { ethereum } = window;

const getEthereumContract = (): ethers.Contract => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }: any) => {
  const [currentAccount, setCurrentAccount] = useState<string>();

  const [formData, setFormData] = useState<FormDataInterface>({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount')
  );
  const [transactions, setTransactions] = useState<TransactionInterface[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');
      const transactionContract = getEthereumContract();

      const availableTransactions: [] =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction: any) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      console.log(structuredTransactions);

      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts: [] = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts.at(0));

        // Get all the Transactions
        getAllTransactions();
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);

      throw new Error('No Ethereum Object');
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem('transactionCount', transactionCount);
    } catch (error) {}
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts: [] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts.at(0));
    } catch (error) {
      console.log(error);

      throw new Error('No Ethereum Object');
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208', // Hex in eth (21000 GEWI)
            value: parsedAmount._hex, // 0.00001
          },
        ],
      });

      // Transaction Id (adding the transaction to the blockchain)
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);

      // Wait till the Transaction is finished
      await transactionHash.wait();

      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());

      // get the data from the form
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        currentAccount,
        transactions,
        isLoading,
        formData,
        setFormData,
        connectWallet,
        handleChange,
        sendTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
