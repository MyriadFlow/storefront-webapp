// /* pages/my-artifacts.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { FaEthereum } from "react-icons/fa";
import Link from "next/link";
import Layout from "./Layout";
import { selectUser } from "../slices/userSlice";
import { useSelector } from "react-redux";
import HomeComp from "./homeComp";
import HomeComp2 from "./homecomp2";
import Loader from "./Loader";
import { useRouter } from 'next/router'
import BuyAsset from "../Components/buyAssetModal";
// import { gql } from "@apollo/client";
import client from "../apollo-client";
import { request, gql } from "graphql-request";
import Creatify from '../artifacts/contracts/Creatify.sol/Creatify.json'
import Marketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'
const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const creatifyAddress = process.env.NEXT_PUBLIC_CREATIFY_ADDRESS;
const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHQL_API;

const MyAssets = () => {
  const walletAddr = useSelector(selectUser);
  var wallet = walletAddr ? walletAddr[0] : "";

  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading,setLoading]=useState(true);
  const [wlt, setwlt] = useState();
  const [formInput, updateFormInput] = useState({ price: ''});
  const [model, setmodel] = useState(false);
  const [modelmsg, setmodelmsg] = useState("Transaction in progress!");
  const [alertMsg, setAlertMsg] = useState("Something went wrong");

  const fetchUserAssests = async (walletAddr) => {
    const query = gql`
    query Query($where: MarketItem_filter) {
      tokens(first: 100, where: {creator: "${walletAddr}"}) {
        id
        metaDataUri
      }
    }
    `;
    const result = await request(graphqlAPI, query);
    setLoading(true);
    setData(result.tokens);
    setLoading(false);
    console.log(result);
  };
	function getEthPrice(price){
		return ethers.utils.formatEther(price)
	}
  useEffect(() => {

    if(!localStorage.getItem('platform_wallet')&& wallet!==undefined)
    {
      localStorage.setItem("platform_wallet",wallet);
    }
    else
    {
       setwlt(localStorage.getItem('platform_wallet'));
    }
    fetchUserAssests(`${localStorage.getItem('platform_wallet')}`);
  },[]);

  const listItem = async ( tokenId, price, signer) => {
    let contract;
    let transaction;
    try {
      setmodelmsg("Transaction 2 in progress");
      contract = new ethers.Contract(
        marketplaceAddress,
        Marketplace.abi,
        signer
      );
      transaction = await contract.createMarketItem(
        creatifyAddress,
        tokenId,
        price
      );
      await transaction.wait();
      console.log("transaction completed");
      setmodelmsg("Transaction 2 Complete !!");
    } catch (e) {
      console.log(e);
      setmodelmsg("Transaction 2 failed");
    }
  };

  async function placeNft(tokenId) {
    const { price } = formInput;
    if (!price) {
      setAlertMsg("Please Fill the Required Fields");
      setOpen(true);
      return;
    }
    setmodelmsg("Transaction in progress");
    setmodel(true);

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let contract = new ethers.Contract(creatifyAddress, Creatify.abi, signer)

    try {
      // let transaction = await contract.createArtifact(url);
      // let tx = await transaction.wait();
      // setmodelmsg("Transaction 1 Complete");
      // let event = tx.events[0]
      // let value = event.args[2]
      // let tokenId = value.toNumber()
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      await listItem(tokenId, price, signer);
    } catch (e) {
      console.log(e);
      setmodelmsg("Transaction failed");
      return;
    }
    router.push('/home')
  }

  return (
    <div className="p-4 px-10 min-h-screen">
      {model && <BuyAsset open={model} setOpen={setmodel} message={modelmsg} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-4 lg:gap-24 p-4 mt-20  h-auto">
            { 
            data?.map((item) => {
              console.log(item);
              console.log(item.metaDataUri.substr(7, 50));

              return (
                <div
                  key={item.id}
                  className="bg-[white] dark:bg-[#1c1c24]  rounded-lg shadow-lg w-full lg:w-72 hover:scale-105 duration-200 transform transition cursor-pointer border-2 dark:border-gray-800"
                >
                <Link key={item.id} href={`/tokens/${item.id}`}>
                  <div>
                  <HomeComp uri={item ? item.metaDataUri.substr(7, 50) : ""} />

                  <div className="flex px-4 py-6">
                    <HomeComp2
                      uri={item ? item.metaDataUri.substr(7, 50) : ""}
                    />
                  </div>
                  {/* <div className=" flex items-center justify-between px-4 mb-2">
                    <p className="font-1 text-sm font-bold">Price </p>
                    <div className="flex items-center">
                      <FaEthereum className="h-4 w-4 text-blue-400" />
                      <p className="font-extralight dark:text-gray-400">
                        {getEthPrice(item.price)} MATIC
                      </p>
                    </div>
                  </div> */}
                  
                </div>
                  </Link>
                  <div className="form-item w-full">
                      <input type="text" placeholder="Asset Price in Matic" className="w-full input_background bg-white dark:bg-gray-900 rounded-md shadow-sm p-3 outline-none "
                        onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                      />
                    </div>  
                  <div className="px-4 py-4 bg-gray-100 dark:bg-gray-700 flex justify-between">
                    <button
                      onClick={() => placeNft(item.tokenId)}
                      className="text-blue-500 hover:text-blue-400 font-bold"
                    >
                      Place asset to market
                    </button>
                  </div>
                </div>
              );
            })
          //    : (loading?<Loader/>:<div className="text-xl pb-10">
          //   You haven&apos;t created any asset.
          // </div>) 
           }
          </div>
      </div>
  );
};
export default MyAssets;