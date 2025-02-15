import { IoClose } from "react-icons/io5";
const Notify = ({setVisible}) => {
  return (
    <section className="bg-[#f2994a] p-1 absolute w-full">
      <div className="max-w-[1280px] flex items-center justify-between mx-auto">
        <div className="text-sm">
          You&apos;re viewing data from the main network, but your wallet is
          connected to the text network (Mumbai).
        </div>
        <IoClose onClick={() => setVisible(false)} className="text-lg" />
      </div>
    </section>
  );
};

export default Notify;
