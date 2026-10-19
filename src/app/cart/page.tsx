"use client";

import ShippingForm from "@/components/ShippingForm";
import useCartStore from "@/stores/cartStore";
import { ShippingFormInputs } from "@/types";
import { ArrowRight, Trash2, Smartphone, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { createOrder } from "@/app/actions/order";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import PaymentForm from "@/components/components/Ui/PaymentForm";

const steps = [
  { id: 1, title: "Shopping Cart" },
  { id: 2, title: "Shipping Address" },
  { id: 3, title: "Payment Method" },
];

const CartLoading = () => (
  <div className="flex flex-col gap-8 items-center justify-center mt-12">
    <div className="w-12 h-12 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[#3d2c28]/60">Loading cart...</p>
  </div>
);

const PayHeroMpesaModal = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
  amount,
  checkoutId,
  onPaymentComplete,
  orderData,
  createOrderFunction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumber: string;
  amount: number;
  checkoutId?: string;
  onPaymentComplete?: () => void;
  orderData?: any;
  createOrderFunction?: (data: any) => Promise<any>;
}) => {
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending",
  );
  const [countdown, setCountdown] = useState(60);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCreateOrder = async () => {
    if (!orderData || !createOrderFunction) return;

    setIsCreatingOrder(true);
    try {
      const result = await createOrderFunction(orderData);
      if (result.success) {
        toast.success("Order created successfully!");
        onPaymentComplete?.();
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Failed to create order");
        setStatus("failed");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create order");
      setStatus("failed");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (isOpen && checkoutId) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCountdownInterval(countdownTimer);

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payhero/status/${checkoutId}`);
          const data = await response.json();

          console.log("Payment status response:", data);

          // Check if payment was successful
          const isSuccess =
            data.status === "completed" ||
            data.status === "success" ||
            data.data?.status === "COMPLETED" ||
            data.data?.status === "SUCCESS" ||
            data.data?.status === "PAID";

          if (isSuccess) {
            setStatus("success");
            clearInterval(pollInterval);
            clearInterval(countdownTimer);

            // Create the order now that payment is successful
            await handleCreateOrder();

            return;
          }

          // Check if payment failed
          const isFailed =
            data.status === "failed" ||
            data.status === "cancelled" ||
            data.data?.status === "FAILED" ||
            data.data?.status === "CANCELLED";

          if (isFailed) {
            setStatus("failed");
            clearInterval(pollInterval);
            clearInterval(countdownTimer);
            toast.error(
              data.data?.message || "Payment failed. Please try again.",
            );
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 3000);

      setPollingInterval(pollInterval);

      return () => {
        if (pollInterval) clearInterval(pollInterval);
        if (countdownTimer) clearInterval(countdownTimer);
      };
    }
  }, [isOpen, checkoutId]);

  const handleCancel = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    setStatus("failed");
    toast.info("Payment cancelled");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#F5EBEO] relative">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 hover:bg-[#F5EBEO] rounded-xl transition-colors"
        >
          <X className="h-5 w-5 text-[#3d2c28]/60" />
        </button>

        <div className="text-center">
          <div className="mb-4">
            {status === "pending" && !isCreatingOrder && (
              <div className="w-20 h-20 mx-auto relative">
                <div className="w-20 h-20 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin" />
                <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-[#DBA39A]" />
              </div>
            )}
            {isCreatingOrder && (
              <div className="w-20 h-20 mx-auto relative">
                <div className="w-20 h-20 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-[#DBA39A]">
                  Order
                </span>
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {status === "failed" && (
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-[#3d2c28] mb-2">
            {isCreatingOrder && "Creating your order..."}
            {status === "pending" &&
              !isCreatingOrder &&
              "Complete Payment on Your Phone"}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </h3>

          <p className="text-[#3d2c28]/60 text-sm">
            {isCreatingOrder && "Please wait while we confirm your order."}
            {status === "pending" && !isCreatingOrder && (
              <>
                We've sent a payment request to your M-Pesa phone.
                <br />
                <span className="font-medium text-[#3d2c28]">
                  Please check your phone and enter your M-Pesa PIN to complete
                  the payment.
                </span>
              </>
            )}
            {status === "success" &&
              "Your payment has been confirmed. Order placed successfully!"}
            {status === "failed" &&
              "Your payment could not be processed. Please try again."}
          </p>

          {status === "pending" && !isCreatingOrder && (
            <div className="mt-4 p-4 bg-[#F5EBEO]/50 rounded-xl text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3d2c28]/60">Phone Number</span>
                <span className="font-medium text-[#3d2c28]">
                  {phoneNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d2c28]/60">Amount</span>
                <span className="font-bold text-[#DBA39A]">
                  Ksh {amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3d2c28]/60">Time Remaining</span>
                <span
                  className={`font-medium ${countdown < 10 ? "text-red-500" : "text-[#3d2c28]"}`}
                >
                  {countdown}s
                </span>
              </div>
            </div>
          )}

          {status === "pending" && !isCreatingOrder && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-600">
              <p>📱 Check your M-Pesa app for the payment prompt</p>
              <p className="mt-1">Enter your PIN to complete the transaction</p>
            </div>
          )}

          {status === "pending" && !isCreatingOrder && (
            <button
              onClick={handleCancel}
              className="mt-6 w-full px-6 py-3 border-2 border-[#F5EBEO] hover:border-red-300 rounded-xl font-medium transition-colors text-[#3d2c28]/60 hover:text-red-500"
            >
              Cancel Payment
            </button>
          )}

          {(status === "success" || status === "failed") && (
            <button
              onClick={() => {
                if (status === "success") {
                  onSuccess();
                }
                onClose();
              }}
              className="mt-6 w-full px-6 py-3 bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              {status === "success" ? "Continue Shopping" : "Try Again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CartContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();
  const [paymentMethod, setPaymentMethod] = useState<
    "MPESA" | "CASH_ON_DELIVERY"
  >();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayHeroModal, setShowPayHeroModal] = useState(false);
  const [payHeroCheckoutId, setPayHeroCheckoutId] = useState<string>();
  const [orderData, setOrderData] = useState<any>(null);

  const activeStep = parseInt(searchParams.get("step") || "1");
  const { cart, removeFromCart, clearCart } = useCartStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = 0;
  const shippingFee = subtotal < 5000 ? 0 : 0;
  const total = subtotal + tax + shippingFee;

  // Cash on Delivery - creates order immediately without payment
  const handleCashOnDelivery = async () => {
    setIsProcessing(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrder({
        userId: session?.user?.id as string,
        items: orderItems,
        subtotal,
        tax,
        shippingFee,
        total,
        phone: shippingForm?.phone as string,
        email: shippingForm?.email as string,
        shippingAddress: shippingForm,
        paymentMethod: "CASH_ON_DELIVERY",
      });

      if (result.success) {
        toast.success("Order placed successfully! Pay on delivery.");
        clearCart();
        router.push(`/my-orders`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // M-Pesa Payment - initiates payment first, creates order after successful payment
  const handleMpesaPayment = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to continue and place your order");
      router.push("/signin?callbackUrl=/cart?step=3");
      return;
    }

    if (!shippingForm) {
      toast.error("Please fill in shipping information");
      router.push("/cart?step=2");
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderPayload = {
        userId: session.user.id,
        items: orderItems,
        subtotal,
        tax,
        shippingFee,
        total,
        phone: shippingForm.phone,
        email: shippingForm.email,
        shippingAddress: shippingForm,
        paymentMethod: "MPESA",
      };

      setOrderData(orderPayload);

      const payHeroResponse = await fetch("/api/payhero/initiate", {
        method: "POST",
        headers: {
          Authorization:
            "Basic bTdnRFNPQzhLWW5tdm42MXB2SWM6U3dORTlhYjFyeHNlb21jcVpxcWZjQ3UyU2VMbnFqRlhBcU5LSEVqdQ==",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          phoneNumber: shippingForm.phone,
          channel_id: 10302,
          provider: "m-pesa",
          external_reference: `ORD-${Date.now().toString().slice(-8)}`,
          customer_name: shippingForm.name,
          callback_url: `https://winkandwonder.co.ke/api/payhero/callback`,
        }),
      });

      const payHeroData = await payHeroResponse.json();

      if (payHeroData.success) {
        setPayHeroCheckoutId(payHeroData.data.checkoutId);
        setShowPayHeroModal(true);
      } else {
        toast.error(payHeroData.error || "Failed to initiate payment");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayHeroModal(false);
    setPayHeroCheckoutId(undefined);
    setOrderData(null);
    setIsProcessing(false);
    clearCart();
    router.push("/");
  };

  const handlePlaceOrder = () => {
    // Validate session
    if (!session?.user?.id) {
      toast.error("Please login to continue and place your order");
      router.push("/signin?callbackUrl=/cart?step=3");
      return;
    }

    // Validate shipping form
    if (!shippingForm) {
      toast.error("Please fill in shipping information");
      router.push("/cart?step=2");
      return;
    }

    // Validate payment method selection
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Route to appropriate handler based on payment method
    if (paymentMethod === "CASH_ON_DELIVERY") {
      handleCashOnDelivery();
    } else if (paymentMethod === "MPESA") {
      handleMpesaPayment();
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12">
      <h1 className="text-2xl font-medium">Your Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            className={`flex items-center gap-2 border-b-2 pb-4 ${
              step.id === activeStep ? "border-gray-800" : "border-gray-200"
            }`}
            key={step.id}
          >
            <div
              className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${
                step.id === activeStep ? "bg-gray-800" : "bg-gray-400"
              }`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium ${
                step.id === activeStep ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-16">
        {/* Left Column - Steps Content */}
        <div className="w-full lg:w-7/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8">
          {activeStep === 1 ?
            cart.length > 0 ?
              cart.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.id}
                >
                  <div className="flex gap-8">
                    <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={(item.images as string) || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">Ksh {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 text-red-400 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            : <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
                <button
                  onClick={() => router.push("/products")}
                  className="mt-4 bg-[#DBA39A] hover:bg-[#c49087] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

          : activeStep === 2 ?
            <ShippingForm setShippingForm={setShippingForm} />
          : activeStep === 3 ?
            <PaymentForm
              onPaymentMethodSelect={setPaymentMethod}
              selectedMethod={paymentMethod}
            />
          : null}
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-5/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8 h-max">
          <h2 className="font-semibold text-lg">Order Summary</h2>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Subtotal</p>
              <p className="font-medium">Ksh {subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Tax (VAT)</p>
              <p className="font-medium">Ksh {tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Shipping Fee</p>
              <p className="font-medium">
                {shippingFee === 0 ? "To be Negotiated" : `To be Negotiated`}
              </p>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <p className="text-gray-800 font-semibold">Total</p>
              <p className="font-bold text-lg text-[#DBA39A]">
                Ksh {total.toFixed(2)}
              </p>
            </div>
          </div>

          {activeStep === 1 && cart.length > 0 && (
            <button
              onClick={() => router.push("/cart?step=2", { scroll: false })}
              className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Continue to Shipping
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {activeStep === 2 && shippingForm && (
            <button
              onClick={() => router.push("/cart?step=3", { scroll: false })}
              className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {activeStep === 3 && paymentMethod && (
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#DBA39A] hover:bg-[#c49087] transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ?
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              : <>
                  <span>
                    {paymentMethod === "CASH_ON_DELIVERY" ?
                      "Place Order (Pay on Delivery)"
                    : "Pay with M-Pesa"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              }
            </button>
          )}
        </div>
      </div>

      {showPayHeroModal && shippingForm && (
        <PayHeroMpesaModal
          isOpen={showPayHeroModal}
          onClose={() => {
            setShowPayHeroModal(false);
            setPayHeroCheckoutId(undefined);
            setOrderData(null);
            setIsProcessing(false);
          }}
          onSuccess={handlePaymentSuccess}
          onPaymentComplete={() => {
            setShowPayHeroModal(false);
            setPayHeroCheckoutId(undefined);
            setOrderData(null);
            setIsProcessing(false);
          }}
          phoneNumber={shippingForm.phone}
          amount={total}
          checkoutId={payHeroCheckoutId}
          orderData={orderData}
          createOrderFunction={createOrder}
        />
      )}
    </div>
  );
};

const CartPage = () => {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartContent />
    </Suspense>
  );
};

export default CartPage;
