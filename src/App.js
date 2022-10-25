import { useState } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';


const Tokens = () => [
  { label: 'ETH', usd: 1316.87},
  { label: 'BNB', usd:270.5},
  { label: 'ANKR', usd:0.02878},
  { label: 'SOL', usd:28.02},
  { label: 'NEAR', usd:2.91},
  { label: 'ALGO', usd:0.3134}
]

const startPayment = async ({ setError, setTxs, ether, addr }) => {
  try {
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");

    await window.ethereum.send("eth_requestAccounts");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    ethers.utils.getAddress(addr);
    const tx = await signer.sendTransaction({
      to: addr,
      value: ethers.utils.parseEther(ether)
    });
    console.log({ ether, addr });
    console.log("tx", tx);
    setTxs([tx]);
  } catch (err) {
    setError(err.message);
  }
};


export default function App() {
  const [error, setError] = useState();
  const [txs, setTxs] = useState([]);

  const [selectedTokenMerchant, setSelectedTokenMerchant] = useState(null);
  const [selectedTokenUser, setSelectedTokenUser] = useState(null);
  const [amountUser, setAmountUser] = useState(null);

  // console.log(selectedTokenUser.label)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: data.get("ether"),
      addr: data.get("addr")
    });
  };

  const handleToken = (e) => {return e ? e.label : "...";};

  const convertAmount = (amount) => { 

    // console.log(Tokens().find(({label}) => label === 'ETH').usd)

    if (selectedTokenUser && selectedTokenMerchant && amountUser) {

      console.log("selectedTokenUser", selectedTokenUser)
      console.log("selectedTokenMerchant", selectedTokenMerchant)

      var cryptoUser = Tokens().find(({label}) => label === selectedTokenUser.label).usd;
      var cryptoMerchant = Tokens().find(({label}) => label === selectedTokenMerchant.label).usd;

      console.log("cryptoUser", cryptoUser)
      console.log("cryptoMerchant", cryptoMerchant)

      return amount * cryptoMerchant / cryptoUser;

    }

    return 0;
       

  };

  console.log(selectedTokenMerchant)
  


  return (
    <form className="m-4" onSubmit={handleSubmit}>
      <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Grindery payment system
          </h1>
          <div className="">

            <div className="my-3">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={Tokens()}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Tokens supported by merchant" />}
                defaultValue={{ label: "ETH" }}
                value={selectedTokenMerchant} onChange={(_event, newToken) => { setSelectedTokenMerchant(newToken); }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </div>

            <div className="my-3 mb-5">
              {/* <input
                type="text"
                name="addr"
                className="input input-bordered block w-full focus:ring focus:outline-none"
                placeholder={"Merchant Address"}
              /> */}

            <TextField 
              id="outlined-basic" 
              label="Merchant Address" 
              variant="outlined" 
              name="addr" 
              className="input input-bordered block w-full focus:ring focus:outline-none"/>
            </div>

            <div className="my-3">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={Tokens()}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="User token" />}
                defaultValue={{ label: "ETH" }}
                value={selectedTokenUser} onChange={(_event, newToken) => { setSelectedTokenUser(newToken); }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </div>

            <div className="my-3">

              <TextField 
              id="outlined-basic" 
              label={"Amount in " + handleToken(selectedTokenUser)} 
              variant="outlined" 
              name="ether" 
              value={amountUser === null ? '' : amountUser} onChange={amount => setAmountUser(amount.target.value)}
              className="input input-bordered block w-full focus:ring focus:outline-none"/>

            </div>

            {/* <div className="my-3">
              <input
                name="ether"
                type="text"
                className="input input-bordered block w-full focus:ring focus:outline-none"
                // placeholder={"Amount in" + {selectedTokenUser}}
                placeholder={"Amount in " + handleToken(selectedTokenUser)}
              />
            </div> */}

            <div className="my-3 mt-5">
              <Alert severity="info">{convertAmount(amountUser) + " " + handleToken(selectedTokenMerchant)  }
              <div className="my-3 mt-5"> 
                <Chip label= {"+ 0.001 " + handleToken(selectedTokenMerchant) + " gas fees."} color="primary" variant="outlined" 
              />
              </div>
            </Alert>
            </div>

          </div>
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Pay now
          </button>
          <ErrorMessage message={error} />
          <TxList txs={txs} />
        </footer>        
      </div>
    </form>
  );
}
