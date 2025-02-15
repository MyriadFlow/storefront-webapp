import Link from "next/link";
import Layout from "../Components/Layout";
import BigCard from "../Components/Cards/BigCard";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUser } from "../slices/userSlice";
import AccessMater from "../artifacts/contracts/accessmaster/AccessMaster.sol/AccessMaster.json";
import { BsHeart } from "react-icons/bs";
import axios from "axios";
import React, { useState, useEffect } from "react";
import etherContract from "../utils/web3Modal";
import { saleStartedQuery } from "../utils/gqlUtil";
import { request, gql } from "graphql-request";
import Tradhub from "../artifacts/contracts/tradehub/TradeHub.sol/TradeHub.json";
import { getMetaData, removePrefix } from "../utils/ipfsUtil";
import Loader from "../Components/Loader";
import Slider from "react-slick";
import SmallCard from "../Components/Cards/SmallCard";
import { useData } from "../context/data";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaWallet,
  FaEnvelope,
} from "react-icons/fa";
import { useAccount } from "wagmi";
import styles from "../styles/Typewritter.module.css";
import Typewriter from "../Components/Typewriter";
const tradhubAddress = "0x1509f86D76A683B3DD9199dd286e26eb7d136519";

export default function Marketplace() {
  const { resdata } = useData();
  console.log(resdata);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  const [info, setInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  const itemStatus = new Map(
    ["NONEXISTANT", "SALE", "AUCTION", "SOLD", "REMOVED"].map((v, index) => [
      index,
      v,
    ])
  );
  const walletAddr = useAccount().address;
  var wallet = walletAddr ? walletAddr[0] : "";
  const [hasRole, setHasRole] = useState(true);

  const getLandingData = async () => {
    const token = walletAddr;
    const config = {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    setLoading(true);
    axios
      .get(
        `https://testnet.gateway.myriadflow.com/api/v1.0/marketplace/itemIds`,
        config
      )
      .then(async (res) => {
        const tradhubContarct = await etherContract(
          tradhubAddress,
          Tradhub.abi
        );
        const saleInput = res.data.payload.map((i) => parseInt(i));
        const { saleStarteds } = [];
        const finalResult = [];
        Promise.all(
          saleStarteds.map(async (item) => {
            const itemResult = await tradhubContarct.idToMarketItem(
              item.itemId
            );
            const nftData = await getMetaData(item.metaDataURI);
            finalResult.push({
              ...item,
              ...nftData,
              image: nftData?.image
                ? `https://cloudflare-ipfs.com/ipfs/${removePrefix(
                    nftData?.image
                  )}`
                : "",
              status: itemStatus.get(parseInt(itemResult.status)),
            });
          })
        ).then(() => {
          setInfo(finalResult);
        });
        setLoading(true);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    const token = walletAddr;
    if (token) {
      getLandingData();
    }
  }, []);

  // useEffect(() => {
  //     const asyncFn = async () => {
  //         const token = localStorage.getItem("platform_token");
  //         if (token) {
  //         }

  //         const accessmaterContarct = await etherContract(
  //             accessmasterAddress,
  //             AccessMater.abi
  //         );
  //         setHasRole(
  //             await accessmaterContarct.hasRole(
  //                 await accessmaterContarct.FLOW_CREATOR_ROLE(),
  //                 wallet
  //             )
  //         );

  //     };
  //     asyncFn();
  // }, [hasRole]);
  return (
    <>
      <Layout
        title="Marketplace"
        description="Used to show the Marketplace information"
      >
        {loading && <Loader />}

        <div className="dark:body-back-hl body-back-hl">
          <div
            className="w-full h-72 object-cover bg-gray-200"
            style={{
              backgroundImage: `url(${resdata?.Storefront.coverImage})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          ></div>

          <div className="flex lg:flex-row md:flex-row flex-col items-center justify-start lg:-mt-36 md:-mt-36 -mt-16 lg:ml-16 md:ml-16">
            <div className="rounded-xl h-48 w-48 ring-offset-2 ring-1 ring-black bg-gray-200">
              <img
                className="text-3xl text-gray-500 w-48 h-48 rounded-xl"
                alt=""
                src={resdata?.Storefront.Profileimage}
              />
            </div>
            <div className="lg:ml-10 md:ml-10 lg:mt-52 md:mt-52 mt-10 w-3/4">
              <p className="font-bold text-4xl">{resdata?.Storefront.string}</p>
              <p className="mt-10">{resdata?.Storefront.description}</p>
            </div>
          </div>
          <section className="dark:body-back-hl body-back-hl">
            <h1 className=" text-4xl font-semibold pt-20 sm:ml-28 ml-10 dark:text-white text-gray-900">
              {resdata?.Storefront.headline}
            </h1>
          </section>

          {/* Trending Section */}
          <section className="dark:body-back-hl body-back-hl">
            <h1 className=" text-4xl font-semibold pt-20 sm:ml-28 ml-10 dark:text-white text-gray-900">
              Trending NFTS
            </h1>
            <div className=" py-16 flex lg:flex-row flex-col justify-center items-center">
              <div className="basis-1/3">
                <BigCard
                  title="VR BOY #007"
                  img="vr.png"
                  price="100,000"
                  name="John Sanders"
                  like={76}
                />
              </div>
              <div className="basis-1/3">
                <BigCard
                  title="Monkey #AK007"
                  img="monkey.png"
                  price="100,000"
                  name="Bernie Sanders"
                  like={99}
                />
              </div>
              <BigCard
                title="VR BOY #007"
                img="vr.png"
                price="100,000"
                name="John Sanders"
                like={76}
              />
            </div>
          </section>
          {/* End Of Trending Section */}

          {/* highlights Section */}
          <section className="dark:body-back-hl body-back-hl">
            <h1 className=" text-4xl font-semibold pt-20 sm:ml-28 ml-10 dark:text-white text-gray-900">
              Top highlights of the week
            </h1>
            <div className=" py-16 flex lg:flex-row flex-col justify-center items-center">
              <div className="basis-1/3">
                <BigCard
                  title="VR BOY #007"
                  img="vr.png"
                  price="100,000"
                  name="John Sanders"
                  like={76}
                />
              </div>
              <div className="basis-1/3">
                <BigCard
                  title="Monkey #AK007"
                  img="monkey.png"
                  price="100,000"
                  name="Bernie Sanders"
                  like={99}
                />
              </div>
              <BigCard
                title="VR BOY #007"
                img="vr.png"
                price="100,000"
                name="John Sanders"
                like={76}
              />
            </div>
          </section>
          {/* End Of highlights Section */}

          {/* highlights Section */}
          <section className="dark:body-back body-back-light">
            <div className=" py-16 flex lg:flex-row flex-col justify-center items-center">
              <div className="basis-1/3">
                <div className="text-center p-2">
                  <h3 className="text-3xl lg:w-1/2 font-poppins font-bold capitalize mx-auto text-gray-500 dark:text-white">
                    Create NFT marketplace for your
                  </h3>
                  <Typewriter
                    strings={[
                      "Community",
                      "Organization",
                      "Businesses",
                      "Audience",
                    ]}
                    wrapperClassName={styles.typewriterWrapper}
                    cursorClassName={styles.typewriterCursor}
                  />
                  <div className="items-center lg:py-4 md:py-4">
                    <div>
                      <button className="py-3 px-10 text-gray-500 dark:text-white font-semibold mb-8 lg:mb-0 border rounded-full">
                        <Link href="/create">
                          <span className="font-raleway font-bold text-gray-500 dark:text-white">
                            Explore More
                          </span>
                        </Link>
                      </button>
                    </div>
                  </div>
                  {/* <div className="items-center ">
                    <div>
                      <button className="py-3 px-6 text-gray-500 dark:text-white font-semibold mb-8 lg:mb-0 explore-btn-border">
                        <Link href="/explore">
                          <span className="font-raleway font-bold text-gray-500 dark:text-whit">
                            Explore More
                          </span>
                        </Link>
                      </button>
                    </div>
                  </div> */}
                </div>
              </div>
              <div className="basis-1/4 mb-10 lg:mb-0">
                <figure className="max-w-xs relative transition-all duration-300 cursor-pointer filter border-4 ">
                  <Link href="#">
                    <img className="" src="vr.png" alt="image description" />
                  </Link>
                </figure>
              </div>
              <div className="basis-1/4 mb-10 lg:mb-0">
                <figure className="max-w-xs relative transition-all duration-300 cursor-pointer filter border-4">
                  <Link href="#">
                    <img className="" src="vr.png" alt="image description" />
                  </Link>
                </figure>
              </div>
              <div className="basis-1/4">
                <figure className="max-w-xs relative transition-all duration-300 cursor-pointer filter border-4">
                  <Link href="#">
                    <img className="" src="vr.png" alt="image description" />
                  </Link>
                </figure>
              </div>
            </div>
          </section>
          {/* End Of highlights Section */}
        </div>
      </Layout>
    </>
  );
}
