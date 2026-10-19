import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const MpesaSimple = ({ amount }) => {
  const { user, axios } = useAppContext();

  const [status, setStatus] = useState("idle"); // idle | initializing | success | failed
  const [message, setMessage] = useState("");
  const [phone, setPhoneNumber] = useState("");

  const handlePayment = async () => {

    if (status === "initializing") return; // prevent spam

    if (!phone.match(/^(\+254|254|0)[17]\d{8}$/)) {
      setMessage("Invalid phone number");
      setStatus("failed");
      return;
    }
    console.log("Initiating M-Pesa payment for amount:", amount, "with phone:", phone);

    setStatus("initializing");
    setMessage("Sending request to M-Pesa...");

    try {
      const res = await axios.post("/api/stkpush/initiatePayment", {
        amount,
        phone
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Payment completed successfully");
      } else {
        setStatus("failed");
        setMessage("Payment failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("failed");
      setMessage("Network error. Try again.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setPhoneNumber("");
  };

  return (
    <div className="border rounded-xl p-5 bg-white space-y-4">
      <h2 className="text-lg font-semibold">M-Pesa Payment</h2>

      {/* IDLE */}
      {status === "idle" && (
        <>
          <div>
            <label htmlFor="mpesa-phone">M-Pesa Phone Number</label>
            <input
              id="mpesa-phone"
              value={phone}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+254700000000"
              className="mt-1 w-full border p-2 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the phone number registered with M-Pesa
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              You will receive a popup on your phone to enter your M-Pesa PIN
            </p>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold text-green-600">KSh {amount.toFixed(0)}</span>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded"
          >
            Pay with M-Pesa
          </button>
        </>
      )}

      {/* INITIALIZING */}
      {status === "initializing" && (
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      )}

      {/* SUCCESS */}
      {status === "success" && (
        <div className="text-center text-green-600 space-y-2">
          <p className="font-semibold">✅ Payment Successful</p>
          <p className="text-sm">{message}</p>
          <button onClick={reset} className="bg-green-600 text-white px-4 py-2 rounded">
            Done
          </button>
        </div>
      )}

      {/* FAILED */}
      {status === "failed" && (
        <div className="text-center text-red-600 space-y-2">
          <p className="font-semibold">❌ Payment Failed</p>
          <p className="text-sm">{message}</p>
          <button onClick={reset} className="bg-green-600 text-white px-4 py-2 rounded">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MpesaSimple;