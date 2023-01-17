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
import { request, gql } from "graphql-request";

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHQL_API;

const MyAssets = () => {
  const walletAddr = useSelector(selectUser); 
  var wallet = walletAddr ? walletAddr[0] : "";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wlt, setwlt] = useState();

  const fetchUserAssests = async (walletAddr) => {
    const query = gql`
    query Query($where: AssetCreated_filter) {
      assetCreateds(first:100, where:{creator: "${walletAddr}"}){
        id
        tokenID
        creator
        blockNumber
        blockTimestamp
        metaDataURI
      }
          }
          `;
    const result = await request(graphqlAPI, query);
    setLoading(true);
    setData(result.assetCreateds);
    setLoading(false);
    console.log(result);
  };
  function getEthPrice(price) {
    return ethers.utils.formatEther(price);
  }
  useEffect(() => {
    if (!localStorage.getItem("platform_wallet") && wallet !== undefined) {
      localStorage.setItem("platform_wallet", wallet);
    } else {
      setwlt(localStorage.getItem("platform_wallet"));
    }
    fetchUserAssests(`${localStorage.getItem("platform_wallet")}`);
  }, []);
console.log("My artifact Data",data);
  return (
    <div className="p-4 px-10 min-h-screen">
      <div className="flex">
        <button className="bg-blue-100 text-blue-800 text-lg font-medium mr-3 px-2 py-2 rounded dark:bg-blue-900 dark:text-blue-300">All</button>
        <button className="bg-gray-100 text-gray-800 text-lg font-medium mr-3 px-2 py-2 rounded dark:bg-gray-700 dark:text-gray-300">Art</button>
        <button className="bg-red-100 text-red-800 text-lg font-medium mr-3 px-2 py-2 rounded dark:bg-red-900 dark:text-red-300">Games</button>
        <button className="bg-purple-100 text-purple-800 text-lg font-medium mr-3 px-2 py-2 rounded dark:bg-purple-900 dark:text-purple-300">Metaverses</button>

      </div>
      <div className="p-4 mt-10  h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" >
        {data?.length > 0 ? (
          data.map((item) => {
            console.log(item);
            return (
              <div
                key={item.tokenID}
                className="bg-[white] dark:bg-[#1c1c24]  rounded-lg shadow-lg w-full lg:w-72 hover:scale-105 duration-200 transform transition cursor-pointer border-2 dark:border-gray-800"
              >
                <Link key={item.tokenID} href={`/create/${item.tokenID}`}>
                  <div style={{padding:"25px"}}>
                    <HomeComp uri={item ? item.metaDataURI : ""} />

                    <div className="flex px-4 py-6">
                      <HomeComp2 uri={item ? item.metaDataURI : ""} />
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
                  <div className="px-3 ">
                  <div className="font-bold">Name</div>
                  <div className="font-bold">Price</div>
                  <div style={{color:"blue"}}>Place a bid</div>
                  </div>
                  </div>
                </Link>
                {/* <div className="px-4 py-4 bg-gray-100 dark:bg-gray-700 flex justify-between">
                    <button
                      onClick={() => buyNft(nft)}
                      className="text-blue-500 hover:text-blue-400 font-bold"
                    >
                      Place asset to market
                    </button>
                  </div> */}
              </div>
            );
          })
        ) : loading ? (
          <Loader />
        ) : (
          <div className="text-xl pb-10 ">
            You haven&apos;t created any asset.
          </div>
        )}
      </div>
    </div>
  );
};
export default MyAssets;
