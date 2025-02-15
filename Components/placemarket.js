// /* pages/my-artifacts.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import Link from "next/link";
import { selectUser } from "../slices/userSlice";
import { useSelector } from "react-redux";
import HomeComp from "./homeComp";
import { useRouter } from "next/router";
import BuyAsset from "../Components/buyAssetModal";
import { request } from "graphql-request";
import Tradhub from '../artifacts/contracts/tradehub/TradeHub.sol/TradeHub.json'
import Loader from "./Loader";
import { saleStartedQuery } from "../utils/gqlUtil";
import etherContract from "../utils/web3Modal";
import { useData } from "../context/data";
import axios from "axios";
import DateTimePicker from './Datetimepicker';
import { removeItem } from "../pages/api/removeitem";
import { updatePrice } from "../pages/api/updateprice";
import { updateTime } from "../pages/api/updatetime";
import { startAuction } from "../pages/api/startauction";
import { acceptbidendauction } from "../pages/api/acceptbidendauction";
import { useAccount } from "wagmi";

const MyAssets = () => {

  const walletAddr = useAccount().address;

  const { resdata } = useData();

  const graphql = resdata?.Storefront.subgraphUrl;
  console.log(graphql);

  const regex = /^(.*?)(?=\/graphql)/;

  // Use the regular expression to extract the URL
  const match = graphql?.match(regex);

  // Extract the matched URL or set it to null if no match was found
  const graphqlAPI = match ? match[0] : null;
  console.log(graphqlAPI);

  const tradhubAddress = resdata?.TradehubAddress;
  const accessmasterAddress = resdata?.accessMasterAddress;

  const apiUrl = `https://testnet.gateway.myriadflow.com/api/v1.0/webapp/contracts/${resdata?.Storefront.id}`;

  const router = useRouter();
  const [data, setData] = useState([]);
  const [auctiondata, setDataauction] = useState([]);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [wlt, setwlt] = useState();
  const [formInput, updateFormInput] = useState({ price: "" });
  const [model, setmodel] = useState(false);
  const [modelmsg, setmodelmsg] = useState("Transaction in progress!");
  const [alertMsg, setAlertMsg] = useState("Something went wrong");
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [price, setPrice] = useState(0);

  const [updatesaleprice, setupdatesaleprice] = useState(0);

  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);

  // Function to update the state when values change
  const handleMonthsChange = (e) => setMonths(parseInt(e.target.value, 10));
  const handleDaysChange = (e) => setDays(parseInt(e.target.value, 10));
  const handleHoursChange = (e) => setHours(parseInt(e.target.value, 10));

  const fetchUserAssests = async () => {
    const refineArray = {};
          refineArray.saleStarteds = [];

          if(walletAddr && graphqlAPI){

          const endPoint = `${graphqlAPI}`;
      const headers = {
        "Content-Type": "application/json",
      };

      const AllBuildingQuery = `{
        saleStarteds(orderBy: id, where:{seller: "${walletAddr}"}) {
          itemId
        metaDataURI
        nftContract
        seller
        tokenId
        id
        price
        transactionHash
        blockTimestamp
        blockNumber
    }
  }`;

      const graphqlQuery = {
        operationName: "saleStarteds",
        query: `query saleStarteds ${AllBuildingQuery}`,
        variables: {},
      };

      const response = await axios.post(endPoint, graphqlQuery, { headers: headers });
      const result = await response.data.data;

          setLoading(true);

          const status = async () => {
            const tokenTimestampMap = {};

            for (const obj of result.saleStarteds) {
              const tradhubAddress = resdata?.TradehubAddress;
              const tradhubContarct = await etherContract(
                tradhubAddress,
                Tradhub.abi
              );
              const transaction = await tradhubContarct.idToMarketItem(obj.itemId);
              console.log("id" + obj.itemId);
              console.log("transaction", transaction);
              console.log("transaction", transaction.status == 1);

              if (transaction.status == 1) {
                // Check if tokenId exists in tokenTimestampMap
                if (!tokenTimestampMap[obj.itemId]) {
                  // If tokenId doesn't exist, add it with the current obj
                  tokenTimestampMap[obj.itemId] = obj;
                } else {
                  // If tokenId exists, compare timestamps and update if current obj has a more recent timestamp
                  const currentTimestamp = obj.blockTimestamp;
                  const existingTimestamp = tokenTimestampMap[obj.itemId].blockTimestamp;
                  if (currentTimestamp > existingTimestamp) {
                    tokenTimestampMap[obj.itemId] = obj;
                  }
                }
              }
      
              console.log("tokenTimestampMap", tokenTimestampMap);
              // Only add items with transaction.status equal to 1 to the filtered array
              // Iterate over tokenTimestampMap and push each object to refineArray.saleStarteds
              refineArray.saleStarteds = Object.values(tokenTimestampMap);
            }
          };
      
            await status();
        }
            console.log(refineArray);
       console.log("self sale assets count",refineArray.saleStarteds.length);
    setLoading(true);

// Fetch contract data from the API
const contractData = await fetch(apiUrl);
const contractnamefind = await contractData.json();
// Add contractName to each asset in refineArray.saleStarteds
refineArray.saleStarteds = refineArray.saleStarteds.map((asset) => {
  const matchingContract = contractnamefind?.find(
    (contract) => 
    {
      console.log("Comparing to contract:", contract.contractAddress);
    return contract.contractAddress.toLowerCase() === asset.nftContract;
    // contract.contractAddress == asset.nftContract
    }
  );

  console.log("findContractname",contractnamefind);
  console.log("nftcontract",asset.nftContract);

  return {
    ...asset,
    contractName: matchingContract ? matchingContract.contractName : '',
  };
});

    setData(refineArray.saleStarteds);
    setLoading(false);
  };
  useEffect(() => {
    fetchUserAssests();
  }, [walletAddr, graphqlAPI]);

  const fetchUserAssestsauction = async () => {
    const refineArray = {};
          refineArray.auctionStarteds = [];

          if(walletAddr && graphqlAPI){

          const endPoint = `${graphqlAPI}`;
      const headers = {
        "Content-Type": "application/json",
      };

      const AllBuildingQuery = `{
        auctionStarteds(
          where: {auctioneer: "${walletAddr}"}) 
        {
          auctioneer
          blockNumber
          basePrice
          blockTimestamp
          endTime
          id
          itemId
          metaDataURI
          nftContract
          tokenId
          transactionHash
        }
  }`;

      const graphqlQuery = {
        operationName: "auctionStarteds",
        query: `query auctionStarteds ${AllBuildingQuery}`,
        variables: {},
      };

      const response = await axios.post(endPoint, graphqlQuery, { headers: headers });
      const result = await response.data.data;

      console.log("auction", result);

          setLoading(true);

          const status = async () => {
            const tokenTimestampMap = {};

            for (const obj of result.auctionStarteds) {
              const tradhubAddress = resdata?.TradehubAddress;
              const tradhubContarct = await etherContract(
                tradhubAddress,
                Tradhub.abi
              );
              const transaction = await tradhubContarct.idToMarketItem(obj.itemId);
              console.log("id" + obj.itemId);
              console.log("transaction auction", transaction);
              console.log("transaction", transaction.status == 2);

              if (transaction.status == 2) {
                // Check if tokenId exists in tokenTimestampMap
                if (!tokenTimestampMap[obj.itemId]) {
                  // If tokenId doesn't exist, add it with the current obj
                  tokenTimestampMap[obj.itemId] = obj;
                } else {
                  // If tokenId exists, compare timestamps and update if current obj has a more recent timestamp
                  const currentTimestamp = obj.blockTimestamp;
                  const existingTimestamp = tokenTimestampMap[obj.itemId].blockTimestamp;
                  if (currentTimestamp > existingTimestamp) {
                    tokenTimestampMap[obj.itemId] = obj;
                  }
                }
              }
      
              console.log("tokenTimestampMap", tokenTimestampMap);
              // Only add items with transaction.status equal to 1 to the filtered array
              // Iterate over tokenTimestampMap and push each object to refineArray.saleStarteds
              refineArray.auctionStarteds = Object.values(tokenTimestampMap);
            }
          };
      
            await status();
        }
            console.log(refineArray);
       console.log("self auction assets count",refineArray.auctionStarteds.length);
    setLoading(true);

// Fetch contract data from the API
const contractData = await fetch(apiUrl);
const contractnamefind = await contractData.json();
// Add contractName to each asset in refineArray.saleStarteds
refineArray.auctionStarteds = refineArray.auctionStarteds.map((asset) => {
  const matchingContract = contractnamefind?.find(
    (contract) => 
    {
      console.log("Comparing to contract:", contract.contractAddress);
    return contract.contractAddress.toLowerCase() === asset.nftContract;
    // contract.contractAddress == asset.nftContract
    }
  );

  console.log("findContractname",contractnamefind);
  console.log("nftcontract",asset.nftContract);

  return {
    ...asset,
    contractName: matchingContract ? matchingContract.contractName : '',
  };
});

    setDataauction(refineArray.auctionStarteds);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserAssestsauction();
  }, [walletAddr, graphqlAPI]);

  const listItem = async (tokenId, price) => {
    let transaction;
    console.table(price);
    try {
      setmodelmsg("Transaction 2 in progress");
      const tradhubContarct = await etherContract(tradhubAddress,Tradhub.abi)
      transaction = await tradhubContarct.listItem(accessmasterAddress, tokenId, price, false,0);
      await transaction.wait();
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

    

    try {
      
      const price = ethers.utils.parseUnits(formInput.price, "ether");
      await listItem(tokenId, price);
    } catch (e) {
      console.log(e);
      setmodelmsg("Transaction failed");
      return;
    }
    router.push("/explore");
  }

  const submitNft = (nft) => {
    // Implement your logic for selling the NFT here
    // You can set isPriceInputVisible to true when you want to show the input field.
    // setIsPriceInputVisible(true);
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const submitNft2 = (nft) => {
    // Implement your logic for selling the NFT here
    // You can set isPriceInputVisible to true when you want to show the input field.
    // setIsPriceInputVisible(true);
    setSelectedNFT(nft);
    setShowModal2(true);
  };

  const handlePriceChange = (event) => {
    const newPrice = event.target.valueAsNumber; // Parse the input value as a number
    setPrice(newPrice);
  };

  const handlesalePriceChange = (event) => {
    const newPrice = event.target.valueAsNumber; // Parse the input value as a number
    setupdatesaleprice(newPrice);
  };

  async function removeNft(nft) {
    setLoading(true);
    await removeItem(nft,tradhubAddress);
    setLoading(false);
  }

  async function updatepricesale(nft, saleprice) {
    setLoading(true);
    const newprice = ethers.utils.parseEther(saleprice.toString());
    await updatePrice(nft,tradhubAddress,newprice);
    setLoading(false);
    setShowModal(false);
  }

  async function updateauctionfield(nft, saleprice) {
    setLoading(true);
    const newprice = ethers.utils.parseEther(saleprice.toString());
    await updatePrice(nft,tradhubAddress,newprice);
    const updateauctiontime = (months * 30 * 24) + (days * 24) + (hours);
    await updateTime(nft, tradhubAddress, updateauctiontime*60*60);
    setLoading(false);
    setShowModal2(false);
  }

  async function auctionNft(nft) {
    setLoading(true);
    const updateauctiontime = (months * 30 * 24) + (days * 24) + (hours);
    await startAuction(nft, tradhubAddress, updateauctiontime*60*60);
    setLoading(false);
    setShowModal(false);
  }

  async function acceptbid(nft) {
    setLoading(true);
    await acceptbidendauction(nft, tradhubAddress);
    setLoading(false);
    setShowModal2(false);
  }

  const handleInputChange = () => {
    setToggle1(!toggle1); // Toggle the state
  };
  
  const handleInputChange2 = () => {
    setToggle2(!toggle2); // Toggle the state
  };

  return (
    <div className="p-4 px-10 min-h-screen dark:body-back body-back-light">
      {model && <BuyAsset open={model} setOpen={setmodel} message={modelmsg} />}

      {showModal && selectedNFT ? (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none dark:body-back body-back-light">
              <div
                className="py-12 transition duration-150 ease-in-out z-10 absolute top-0 right-0 bottom-0 left-0"
                id="modal"
              >
                <div
                  role="alert"
                  className="container mx-auto w-1/2 rounded-lg"
                >
                  <div className="relative py-4 bg-white shadow-md rounded border border-gray-400 rounded-2xl">
                    <div className="w-full flex justify-start text-gray-600 mb-3">
                      <button onClick={() => setShowModal(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-x mr-4 ml-4"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>

                      <h3 className="text-2xl font-semibold text-gray-900 ml-6">
                        Manage Asset
                      </h3>
                    </div>

                    <div class="flex p-10 ml-10">
                      {/* <input type="file" className="btn btn-primary btn-md ml-36" style={{ marginBottom: 20, marginTop: 20, width: "50%" }} onChange={(e) => { uploadImage(e) }} /> */}
                      <div className="w-1/2">
                        <div class="flex items-center mb-4 justify-between">
                          <div>
                          <button
                                className="text-white bg-blue-600 text-sm px-20 py-3 mt-4 rounded-lg border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                // onClick={() => sellNft(selectedNFT, price)}
                                onClick={()=> handleInputChange2()}
                              >
                                Set to Auction
                              </button>

                              {
                          toggle2 && (
                            <>
                              {/* <p className="font-semibold text-gray-900 mt-4 mb-2">
                                Set starting Price
                              </p>
                              <div className="mb-2">
                                <input
                                  type="number"
                                  id="default-input"
                                  placeholder="Enter Price"
                                  value={price}
                                  onChange={handlePriceChange}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                              </div> */}
                              <p className="font-semibold text-gray-900 mt-4 mb-2">Set Duration</p>
                        {/* <div className="mb-2"> */}
                        <button
                  className="flex gap-x-2 items-center justify-center lg:px-10 md:px-10 px-3 py-3 my-4 text-sm font-medium rounded-lg dark:bg-blue-500 border"
                >
                        <DateTimePicker 
                  months={months}
                  days={days}
                  hours={hours}
                  onMonthsChange={handleMonthsChange}
                  onDaysChange={handleDaysChange}
                  onHoursChange={handleHoursChange}
                  />
                  </button>
                          {/* <input type="text" id="default-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        </div> */}
                              <button
                                className="text-white bg-blue-500 text-sm px-20 py-3 mt-4 rounded-full border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => auctionNft(selectedNFT)}
                              >
                                Set
                              </button>
                            </>
                          )
                        }

                            <h3 className="text-2xl font-semibold text-gray-900 text-center pt-10">
                              or
                            </h3>

                            <p className="font-semibold text-gray-900 mt-4 mb-2">
                                Update Price
                              </p>
                              <div className="mb-2">
                                <input
                                  type="number"
                                  id="default-input"
                                  placeholder="Enter Price"
                                  value={updatesaleprice}
                                  onChange={handlesalePriceChange}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                              </div>

                              <button
                                className="text-white bg-blue-500 text-sm px-20 py-3 mt-4 rounded-full border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => updatepricesale(selectedNFT, updatesaleprice)}
                              >
                                Update
                              </button>
                          </div>
                        </div>
                        
                      </div>
                      <div class="w-1/3 ml-10">
                        <img src="/vr.png" className="rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}

{showModal2 && selectedNFT ? (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none dark:body-back body-back-light">
              <div
                className="py-12 transition duration-150 ease-in-out z-10 absolute top-0 right-0 bottom-0 left-0"
                id="modal"
              >
                <div
                  role="alert"
                  className="container mx-auto w-1/2 rounded-lg"
                >
                  <div className="relative py-4 bg-white shadow-md rounded border border-gray-400 rounded-2xl">
                    <div className="w-full flex justify-start text-gray-600 mb-3">
                      <button onClick={() => setShowModal2(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-x mr-4 ml-4"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>

                      <h3 className="text-2xl font-semibold text-gray-900 ml-6">
                        Manage Asset
                      </h3>
                    </div>

                    <div class="flex p-10 ml-10">
                      {/* <input type="file" className="btn btn-primary btn-md ml-36" style={{ marginBottom: 20, marginTop: 20, width: "50%" }} onChange={(e) => { uploadImage(e) }} /> */}
                      <div className="w-1/2">
                        <div class="flex items-center mb-4 justify-between">
                          <div>
                              <button
                                className="text-white bg-blue-600 text-sm px-20 py-3 mt-4 rounded-lg border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => acceptbid(selectedNFT)}
                                // onClick={()=> handleInputChange()}
                              >
                                Set to Sale
                              </button>

                              {
                          toggle1 && (
                            <>
                              <p className="font-semibold text-gray-900 mt-4 mb-2">
                                Set starting Price
                              </p>
                              <div className="mb-2">
                                <input
                                  type="number"
                                  id="default-input"
                                  placeholder="Enter Price"
                                  value={price}
                                  onChange={handlePriceChange}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                              </div>
                              {/* <p className="font-semibold text-gray-900 mt-4 mb-2">Duration</p>
                        <div className="mb-2">
                          <input type="text" id="default-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                        </div> */}
                              <button
                                className="text-white bg-blue-500 text-sm px-20 py-3 mt-4 rounded-full border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => sellNft(selectedNFT, price)}
                              >
                                Set
                              </button>
                            </>
                          )
                        }

                            <h3 className="text-2xl font-semibold text-gray-900 text-center pt-10">
                              or
                            </h3>

                            <p className="font-semibold text-gray-900 mt-4 mb-2">
                                Update Base Price
                              </p>
                              <div className="mb-2">
                                <input
                                  type="number"
                                  id="default-input"
                                  placeholder="Enter Price"
                                  value={updatesaleprice}
                                  onChange={handlesalePriceChange}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                              </div>

                              <p className="font-semibold text-gray-900 mt-4 mb-2">
                                Update Time
                              </p>
                              <div className="mb-2">
                              <button
                  className="flex gap-x-2 items-center justify-center lg:px-10 md:px-10 px-3 py-3 my-4 text-sm font-medium rounded-lg dark:bg-blue-500 border"
                >
                        <DateTimePicker 
                  months={months}
                  days={days}
                  hours={hours}
                  onMonthsChange={handleMonthsChange}
                  onDaysChange={handleDaysChange}
                  onHoursChange={handleHoursChange}
                  />
                  </button>
                              </div>

                              <button
                                className="text-white bg-blue-500 text-sm px-20 py-3 mt-4 rounded-full border border-white shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => updateauctionfield(selectedNFT, updatesaleprice)}
                              >
                                Update
                              </button>
                          </div>
                        </div>
                        
                      </div>
                      <div class="w-1/3 ml-10">
                        <img src="/vr.png" className="rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}

      <div className="text-3xl ml-4">Your NFTs on sale</div>
      <div className=" p-4 mt-10  h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.length > 0 ? (
          data?.map((item) => {
            return (
              <div
                key={item.itemId}
                className=" border-2 p-2.5 dark:bg-[#1c1c24]  rounded-lg shadow-lg w-full lg:w-72 hover:scale-105 duration-200 transform transition cursor-pointer border-2 dark:border-gray-800"
              >
                <Link key={item?.itemId} href={`/collections/${item?.contractName}/${item?.nftContract}/${item?.tokenId}`}>
                  <div>
                    <HomeComp uri={item ? item?.metaDataURI : ""} />
                  </div>
                </Link>
              
                <div className="flex justify-between mt-3 text-gray-500 dark:text-white">
                  <div className="font-bold">Price :</div>
                  <div className="text-xs">{ethers.utils.formatEther(item?.price)} MATIC</div>
                </div>
                <div className="px-4 py-4 bg-white flex justify-center mt-3">
                  <button
                    // onClick={() => placeNft(item?.tokenId)}
                    onClick={() => submitNft(item)}
                    className="text-blue-500 hover:text-blue-400 font-bold"
                  >
                    Manage
                  </button>
                </div>
                <div className="px-4 py-4 flex justify-center mt-3 border border-red-500">
                  <button
                    onClick={() => removeNft(item)}
                    className="text-white hover:text-blue-400 font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : loading ? (
          <Loader />
        ) : (
          <div className="text-2xl pb-10 font-bold text-center">
            You haven&apos;t Placed any item on sale
          </div>
        )}
      </div>

      <div className="text-3xl mt-20 ml-4">Your NFTs on auction</div>
      <div className=" p-4 mt-10  h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {auctiondata.length > 0 ? (
          auctiondata?.map((item) => {
            return (
              <div
                key={item.itemId}
                className=" border-2 p-2.5 dark:bg-[#1c1c24]  rounded-lg shadow-lg w-full lg:w-72 hover:scale-105 duration-200 transform transition cursor-pointer border-2 dark:border-gray-800"
              >
                <Link key={item?.itemId} href={`/collections/${item?.contractName}/${item?.nftContract}/${item?.tokenId}`}>
                  <div>
                    <HomeComp uri={item ? item?.metaDataURI : ""} />
                  </div>
                </Link>
              
                <div className="flex justify-between mt-3 text-gray-500 dark:text-white">
                  <div className="font-bold">Base Price :</div>
                  <div className="text-xs">{ethers.utils.formatEther(item?.basePrice)} MATIC</div>
                </div>
                <div className="px-4 py-4 bg-white flex justify-center mt-3">
                  <button
                    // onClick={() => placeNft(item?.tokenId)}
                    onClick={() => submitNft2(item)}
                    className="text-blue-500 hover:text-blue-400 font-bold"
                  >
                    Manage
                  </button>
                </div>
                <div className="px-4 py-4 flex justify-center mt-3 border border-red-500">
                  <button
                    onClick={() => removeNft(item)}
                    className="text-white hover:text-blue-400 font-bold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : loading ? (
          <Loader />
        ) : (
          <div className="text-2xl pb-10 font-bold text-center">
            You haven&apos;t Placed any item on auction.
          </div>
        )}
      </div>
    </div>
  );
};
export default MyAssets;
