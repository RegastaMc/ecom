"use client";

import { CreditCard, Truck, Smartphone } from "lucide-react";

interface PaymentFormProps {
  onPaymentMethodSelect: (method: "MPESA" | "CASH_ON_DELIVERY") => void;
  selectedMethod?: "MPESA" | "CASH_ON_DELIVERY";
}

const PaymentForm = ({
  onPaymentMethodSelect,
  selectedMethod,
}: PaymentFormProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>

      <div className="space-y-4">
        {/* M-Pesa Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
            selectedMethod === "MPESA" ?
              "border-green-500 bg-green-50"
            : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="MPESA"
            checked={selectedMethod === "MPESA"}
            onChange={() => onPaymentMethodSelect("MPESA")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span className="font-medium">M-Pesa</span>
            </div>
            <p className="text-sm text-gray-600">
              Pay using M-Pesa mobile money. You&apos;ll receive a prompt on
              your phone.
            </p>
          </div>
        </label>

        {/* Cash on Delivery Option */}
        <label
          className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
            selectedMethod === "CASH_ON_DELIVERY" ?
              "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="CASH_ON_DELIVERY"
            checked={selectedMethod === "CASH_ON_DELIVERY"}
            onChange={() => onPaymentMethodSelect("CASH_ON_DELIVERY")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Cash on Delivery</span>
            </div>
            <p className="text-sm text-gray-600">
              You'll pay in cash when your order is delivered to you.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentForm;
