"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Download,
  Calendar,
  MapPin,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  phone: string;
  email: string;
  shippingAddress: any;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  items: OrderItem[];
}

interface OrdersClientProps {
  orders: Order[];
  success: boolean;
  error?: string;
}

const OrdersClient = ({ orders, success, error }: OrdersClientProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      PROCESSING: {
        color: "bg-blue-100 text-blue-800",
        icon: Package,
        label: "Processing",
      },
      SHIPPED: {
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
        label: "Shipped",
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      PAID: { color: "bg-green-100 text-green-800", label: "Paid" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Failed" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `Ksh ${price.toLocaleString()}`;
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (!success) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-gray-500">{error || "Failed to load your orders"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Orders Yet
        </h3>
        <p className="text-gray-500 mb-6">
          You haven`&apos;`t placed any orders yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Start Shopping
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders List */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Order Header */}
          <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <div className="space-y-4">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.images && item.product.images[0] ?
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    }
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium text-gray-800 hover:text-blue-600 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              {order.items.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>

          {/* Order Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-bold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </p>
              {order.paymentMethod === "MPESA" && order.paidAt && (
                <p className="text-xs text-green-600 mt-1">
                  Paid on {formatDate(order.paidAt)}
                </p>
              )}
              {order.paymentMethod === "CASH_ON_DELIVERY" &&
                order.status !== "DELIVERED" && (
                  <p className="text-xs text-orange-600 mt-1">
                    Pay on delivery
                  </p>
                )}
            </div>

            <button
              onClick={() => viewOrderDetails(order)}
              className="inline-flex items-center gap-2 text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          formatDate={formatDate}
          formatPrice={formatPrice}
          getStatusBadge={getStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  formatDate: (date: string) => string;
  formatPrice: (price: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusBadge: (status: string) => React.ReactNode;
}

const OrderDetailsModal = ({
  order,
  onClose,
  formatDate,
  formatPrice,
  getStatusBadge,
  getPaymentStatusBadge,
}: OrderDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <div>{getStatusBadge(order.status)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <div>{getPaymentStatusBadge(order.paymentStatus)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="text-sm font-medium capitalize">
                {order.paymentMethod === "MPESA" ?
                  "M-Pesa"
                : "Cash on Delivery"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="text-sm font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.images && item.product.images[0] ?
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    }
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-medium text-gray-800 hover:text-blue-600 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Price: {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.shippingAddress?.address}
              </p>
              {order.shippingAddress?.apartment && (
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.apartment}
                </p>
              )}
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.zipCode}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.country}
              </p>
              <p className="text-sm text-gray-600 mt-2">Phone: {order.phone}</p>
              <p className="text-sm text-gray-600">Email: {order.email}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (16% VAT)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span>
                  {order.shippingFee === 0 ?
                    "Free"
                  : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-blue-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {order.status === "DELIVERED" && (
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                Buy Again
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersClient;
