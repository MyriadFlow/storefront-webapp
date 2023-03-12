/* pages/index.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import Link from "next/link";
import { selectModel } from "../slices/modelSlice";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/userSlice";
import { logoutbalance } from "../slices/balanceSlice";
import { close } from "../slices/modelSlice";
import { request, gql } from "graphql-request";
import BuyAsset from "../Components/buyAssetModal";
import { buyNFT } from "./api/buyNFT";
import Layout from "../Components/Layout";
import { getMetaData, removePrefix } from "../utils/ipfsUtil";
import { MarketPlaceCard } from "../Components/Cards/MarketPlaceCard";
import { NavLink } from "reactstrap";
import { useRouter } from "next/router";
import { saleStartedQuery } from "../utils/gqlUtil";

const graphqlAPI = process.env.NEXT_PUBLIC_MARKETPLACE_API;

const Home = () => {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [shallowData, setShallowData] = useState([]);
  const logoutmodel = useSelector(selectModel);
  const dispatch = useDispatch();

  // function for logout
  const logoutmetamask = () => {
    dispatch(logout());
    dispatch(logoutbalance());
    dispatch(close());
  };

  // function for closing logout model
  const closelogoutmodel = () => {
    dispatch(close());
  };

  const datasort = [
    { id: 0, label: "Listed :Newest" },
    { id: 1, label: "Listed :Oldest" },
  ];

  const [isOpenSortOldNew, setOpenSortOldNew] = useState(false);
  const toggleDropdownSort = () => setOpenSortOldNew(!isOpenSortOldNew);

  const [isOpenMedia, setOpenMedia] = useState(false);
  const toggleDropdownMedia = () => setOpenMedia(!isOpenMedia);

  const [isOpenAvail, setOpenAvail] = useState(false);
  const toggleDropAvail = () => setOpenAvail(!isOpenAvail);

  const [isopenprice, setOpenPrice] = useState(false);
  const togglePriceDropdown = () => setOpenPrice(!isopenprice);
  const [items, setItem] = useState(datasort);

  const [hidefilter, setHideFilter] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMedia, setSelectMedia] = useState(null);
  const [selectedAvail, setSelectAvail] = useState(null);
  const [selectedPrice, setSelectPrice] = useState(null);

  const [filter, Setfilter] = useState(false);
  const [model, setmodel] = useState(false);
  const [modelmsg, setmodelmsg] = useState("buying in progress!");
  const [categories, setCategory] = useState([
    "All",
    "Music",
    "Image",
    "Video",
    "Document",
  ]);

  const HomeProps = (data) => {
    console.log("explore data", data.categories);
    setCategory(data.categories);
  };

  const toogle = () => {
    Setfilter(!filter);
  };

  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  });

  function getEthPrice(price) {
    return ethers.utils.formatEther(price);
  }

  async function loadNFTs() {
    setLoadingState("loaded");
  }
  const filterNFTs = (cat) => {
    if (cat === "All") {
      setData(shallowData);
      return;
    }
    let localData = [...shallowData];
    localData = localData.filter((item) => {
      if (item?.categories?.length && item?.categories?.includes(cat)) {
        return true;
      }
      return false;
    });
    console.log("Filter by category", localData);
    setData(localData);
  };
  async function buyNft(nft) {
    setmodelmsg("Buying in Progress");
    await buyNFT(nft, setmodel, setmodelmsg);
  }
  useEffect(() => {
    filterNFTs();
  }, []);

  const market = async () => {
    const result = await request(graphqlAPI, saleStartedQuery);
    const fResult = await Promise.all(
      result.saleStarteds.map(async function (obj, index) {
        const nftData = await getMetaData(obj.metaDataURI);
        const { name, description, categories, image } = nftData;
        return {
          ...obj,
          name,
          description,
          categories: categories,
          image: nftData?.image
            ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${removePrefix(image)}`
            : "",
        };
      })
    );
    const sortedNFts = fResult.sort((a, b) => {
      if (a.itemId < b.itemId) return -1;
    });
    setData(sortedNFts);
    setShallowData(sortedNFts);
  };

  useEffect(() => {
    market();
  }, []);

  const handleItemClick = (id) => {
    selectedItem == id ? setSelectedItem(null) : setSelectedItem(id);
  };
  return (
    <Layout
      title="Explore"
      description="Used to show the created categories of the Nfts"
    >
      {model && <BuyAsset open={model} setOpen={setmodel} message={modelmsg} />}
      {logoutmodel && (
        <div className="flex items-center  shadow-md justify-center w-full h-screen model-overlay fixed  top-0 z-50">
          <div className="h-56 w-80 bg-white  dark:bg-gray-800 shadow-lg rounded-md fixed z-50 flex items-center justify-center  ring-offset-2 ring-2 ring-blue-400">
            <div className="flex flex-col justify-center items-center">
              <div className="text-lg font-semibold dark:text-gray-200">
                {" "}
                Are You Sure Wanna Logout ?
              </div>
              <div className="flex items-center space-x-8 mt-10 ">
                <div>
                  <button
                    onClick={logoutmetamask}
                    className="font-semibold bg-blue-500 hover:bg-blue-700 shadow-md p-1 px-4 rounded-md"
                  >
                    Ok
                  </button>
                </div>
                <div>
                  {" "}
                  <button
                    onClick={closelogoutmodel}
                    className="font-semibold bg-gray-200 hover:bg-gray-300  dark:text-gray-400 flex items-center p-1 px-4 rounded-md shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="body-back">
        <div className="flex justify-between p-4 border-y-2">
          <div className="flex justify-center mt-5 ml-5 ">
            <div>
              <div className="flex gap-6">
                {categories.map((category, key) => {
                  return (
                    <div key={key}>
                      <button
                        onClick={() => filterNFTs(category)}
                        className="bg-blue-100 text-blue-800 text-lg mr-3 px-5 py-2 rounded dark:bg-blue-900 dark:text-blue-300 font-bold "
                      >
                        {category}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-5 mr-5">
            <Link href="/explore">
              <NavLink
                className={router.pathname == "/explore" ? "active " : ""}
              >
                <button className="bg-white py-3 px-6  text-gray-500 dark:text-black font-semibold mb-8 lg:mb-0">
                  More Sale
                </button>
              </NavLink>
            </Link>
          </div>
        </div>
        <div>
          <div
            className={`fa fa-chevron-right hide ${hidefilter && "open"}`}
            onClick={() => {
              setHideFilter(!hidefilter);
            }}
          >
            Hide Filter
          </div>
        </div>
        <div className="flex">
          {hidefilter && (
            <div className="p-4">
              <div className="dropdown">
                <div className="dropdown-header" onClick={toggleDropdownSort}>
                  {selectedItem
                    ? items.find((item) => item.id == selectedItem).label
                    : "Select Newest and Oldest"}
                  <i
                    className={`fa fa-chevron-right icon ${
                      isOpenSortOldNew && "open"
                    }`}
                  ></i>
                </div>
                <div className={`dropdown-body ${isOpenSortOldNew && "open"}`}>
                  {items.map((item) => (
                    <div
                      className="dropdown-item"
                      onClick={(e) => handleItemClick(e.target.id)}
                      id={item.id}
                      key={item.id}
                    >
                      <span
                        className={`dropdown-item-dot ${
                          item.id == selectedItem && "selected"
                        }`}
                      >
                        •{" "}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="dropdown">
                <div className="dropdown-header" onClick={toggleDropdownMedia}>
                  {selectedMedia
                    ? items.find((item) => item.id == selectedMedia).label
                    : "Media Type"}
                  <i
                    className={`fa fa-chevron-right icon ${
                      isOpenMedia && "open"
                    }`}
                  ></i>
                </div>
                <div className={`dropdown-body ${isOpenMedia && "open"}`}>
                  <div className="flex justify-between">
                    <div className="media-type">
                      {" "}
                      <input type="checkbox"></input>{" "}
                      <span className="ml-3">Music</span>
                    </div>
                    <div className="media-type">
                      {" "}
                      <input type="checkbox"></input>
                      <span className="ml-3">Image</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-5">
                    <div className="media-type">
                      {" "}
                      <input type="checkbox"></input>
                      <span className="ml-3">Audio</span>
                    </div>
                    <div className="media-type">
                      {" "}
                      <input type="checkbox"></input>
                      <span className="ml-3">Document</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dropdown">
                <div className="dropdown-header" onClick={toggleDropAvail}>
                  {selectedAvail
                    ? items.find((item) => item.id == selectedAvail).label
                    : "Availability"}
                  <i
                    className={`fa fa-chevron-right icon ${
                      isOpenAvail && "open"
                    }`}
                  ></i>
                </div>
                <div className={`dropdown-body ${isOpenAvail && "open"}`}>
                  <div className="flex justify-between">
                    <div className="all-buy"> All</div>
                    <div className="media-type"> Buy Now</div>
                  </div>
                </div>
              </div>

              <div className="dropdown">
                <div className="dropdown-header" onClick={togglePriceDropdown}>
                  {selectedPrice
                    ? items.find((item) => item.id == selectedPrice).label
                    : "price"}
                  <i
                    className={`fa fa-chevron-right icon ${
                      isopenprice && "open"
                    }`}
                  ></i>
                </div>
                <div className={`dropdown-body ${isopenprice && "open"}`}>
                  <div className="flex justify-between">
                    <div className="media-type"> Max</div>
                    <div className="media-type">Min</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-4 lg:gap-24 p-4">
              {data?.length
                ? data?.map((item) => {
                    return (
                      <div
                        key={item.itemId}
                        className=" border-white mycard p-3 shadow-lg w-full cursor-pointer"
                      >
                        <Link
                          key={item.itemId}
                          href={`/explore/${item.itemId}`}
                        >
                          <div>
                            <MarketPlaceCard {...item} />
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-bold text-gray-500 dark:text-white">
                                Price{" "}
                              </div>
                              <div className="flex items-center">
                                <FaEthereum className="w-4 text-gray-500 dark:text-white" />
                                <div className="text-gray-500 dark:text-white font-semibold">
                                  {getEthPrice(item.price)} MATIC
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => buyNft(item)}
                          className="text-gray-500 dark:text-black bg-[#CAFC01] w-full rounded-md py-2 font-bold"
                        >
                          Buy Now
                        </button>
                      </div>
                    );
                  })
                : null}
            </div>
            {data?.length == 0 && (
              <div className="font-bold text-2xl">
                No NFT Found For Selected Category
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};
export default Home;
