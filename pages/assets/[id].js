import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import AssetComp from "../../Components/assetComp";
import HomeComp2 from "../../Components/homecomp2";
import AssetImage from "../../Components/assetImage";
import AssetDesc from "../../Components/assetDesc";
import AssetHead from "../../Components/assetHead";
import AssetProps from "../../Components/assetProperties";
import AssetCategories from "../../Components/AssetCategories";
import { BsArrowUpRight } from "react-icons/bs";
import { FaCopy } from "react-icons/fa";
import { gql } from "@apollo/client";
import client from "../../apollo-client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { buyNFT } from "../api/buyNFT";
import BuyAsset from "../../Components/buyAssetModal";
import Layout from "../../Components/Layout";
import {ethers} from "ethers"


function Asset({ asset }) {
    function getEthPrice(price){
        return ethers.utils.formatEther(price)
    }
    const [model, setmodel] = useState(false);
    const [modelmsg, setmodelmsg] = useState("buying in progress!");
    console.log(asset);
    const nfturl = `https://ipfs.io/ipfs/${asset.marketItems[0].metaDataUri.substr(7, 50)}`;

    const [response, setResponse] = useState([]);
    const [image, setImage] = useState("");

    const metadata = async () => {
        const { data } = await axios.get(
            `https://ipfs.io/ipfs/${asset.marketItems[0].metaDataUri.substr(7, 50)}`
        );
        setResponse(data);
        setImage(data.image);
        let preuri = image.substr(7, 50);
    }

    useEffect(() => {
        metadata();
    }, [asset.marketItems[0].metaDataUri.substr(7, 50)]);
    let preuri = image.substr(7, 50);

    const imgurl = `https://ipfs.io/ipfs/${preuri}`;
    const transaction = `https://mumbai.polygonscan.com/token/${asset.marketItems[0].nftContract}?a=${asset.marketItems[0].tokenId}`;
    // const transaction = `https://etherscan.io/token/${asset.marketItems[0].nftContract}?a=${asset.marketItems[0].tokenId}`;

    const copy = asset.marketItems[0].nftContract;
    return (
        // <div className="w-full">
        <Layout>
            <div className="grid place-items-center h-max bg-gray-100 dark:bg-gray-300">
                <div className="cursor-pointer w-full lg:w-1/2 md:w-1/2">
                    {/* <div className="scale-150"> */}
                    <AssetComp uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} />
                    {/* </div> */}
                </div>
            </div>

            <div className="bg-white md:mx-20 dark:bg-gray-900">
                <main className="my-10">
                    <div className="container mx-auto px-6">
                        <h3 className="text-gray-700 text-2xl font-medium"><AssetHead uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} /></h3>

                        <div className="flex flex-col lg:flex-row my-8">
                            <div className="w-full lg:w-1/2 order-2">
                                <div className="border rounded-md w-full px-4 py-3">
                                    <div className="flex items-center justify-between my-3">
                                        <h3 className="text-gray-500 font-medium dark:text-white">NFT Details</h3>
                                    </div>
                                    <div className="flex items-center justify-between my-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">Contract Address</h3>
                                        {/* <span className="text-gray-600 text-sm dark:text-gray-400">{asset.marketItems[0].nftContract}</span> */}
                                        <span className="text-gray-600 text-sm dark:text-gray-400 cursor-pointer" onClick={() => { navigator.clipboard.writeText(copy) }}><FaCopy /></span>
                                    </div>
                                    <div className="flex items-center justify-between my-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">Token ID</h3>
                                        <span className="text-gray-600 text-sm dark:text-gray-400">{asset.marketItems[0].tokenId}</span>
                                    </div>
                                    <div className="flex items-center justify-between my-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">Blockchain</h3>
                                        <span className="text-gray-600 text-sm dark:text-gray-400">Polygon Testnet</span>
                                    </div>
                                    <div className="flex items-center justify-between -my-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">IPFS</h3>
                                        <span className="text-gray-600 text-sm"><a href={imgurl} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-400"><BsArrowUpRight /></a></span>
                                    </div>
                                    <div className="flex items-center justify-between -my-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">IPFS Metadata</h3>
                                        <span className="text-gray-600 text-sm"><a href={nfturl} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-400"><BsArrowUpRight /></a></span>
                                    </div>
                                    <div className="flex items-center justify-between -my-4 pb-4">
                                        <h3 className="text-gray-700 font-medium dark:text-gray-300">Etherscan Transaction</h3>
                                        <span className="text-gray-600 text-sm"><a href={transaction} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-400"><BsArrowUpRight /></a></span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full mb-8 flex-shrink-0 order-1 lg:w-1/2 lg:mb-0 lg:order-2">
                                <div className="flex justify-center lg:justify-end">
                                    <div className="border rounded-md max-w-md w-full px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-gray-700 font-medium dark:text-white">Asset Worth</h3>
                                            
                                        </div>
                                        <div className="flex justify-between mt-6 flex-row">
                                        <div className="text-gray-600 text-sm dark:text-white">Price</div>
                                            <div className="text-gray-600 dark:text-gray-400">{getEthPrice(asset.marketItems[0].price)}</div>
                                            
                                            
                                        </div>
                                        <div className="flex">
                                                <div className="lg:h-40 lg:w-40">
                                                    <AssetImage uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} />
                                                    <div className="mx-3 my-3">
                                                </div>
                                                </div>
                                                
                                                
                                            </div>
                                        <h3 className="text-sm text-gray-600"><AssetDesc uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} /></h3>

                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() =>
                                                    buyNFT(asset.marketItems[0], setmodel, setmodelmsg)
                                                }
                                                className="px-3 py-2 w-1/3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 focus:outline-none focus:bg-blue-500">
                                                <span>Buy NFT</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row my-8">
                            <div className="w-full lg:w-1/2 order-2">

                                <AssetProps uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} />

                            </div>
                            <div className="w-full mb-8 flex-shrink-0 order-1 lg:w-1/2 lg:mb-0 lg:order-2">
                                <div className="flex justify-center lg:justify-end">

                                    <AssetCategories uri={asset.marketItems[0] ? asset.marketItems[0].metaDataUri.substr(7, 50) : ""} />

                                </div>
                            </div>
                        </div>

                    </div>
                </main>
                {model && <BuyAsset open={model} setOpen={setmodel} message={modelmsg} />}
            </div>
        </Layout>
        // </div>
    )
}

export async function getServerSideProps(context) {
    const { id } = context.query

    const { data } = await client.query({
        query: gql`
        query Query($where: MarketItem_filter) {
            marketItems(where: {id:${id}}) {
              price
              itemId
              seller
              forSale
              tokenId
              metaDataUri
              owner
              nftContract
            }
          }
    `,
    });

    return {
        props: {
            asset: data,
        }
    }
}


export default Asset