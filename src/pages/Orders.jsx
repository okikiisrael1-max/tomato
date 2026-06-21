import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Clock3, Loader2, PackageCheck, PackageX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase/config";

const ACTIVE_STATUSES = new Set(["pending", "active", "delivered"]);
const ARCHIVED_STATUSES = new Set(["cancelled", "returned"]);

const formatDate = (value) => {
  if (!value?.toDate) return "Just now";
  return value.toDate().toLocaleString();
};

const Orders = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsSignedIn(false);
        setLoading(false);
        return;
      }

      setIsSignedIn(true);

      try {
        const orderSnapshot = await getDocs(
          query(collection(db, "orders", currentUser.uid, "items"), orderBy("createdAt", "desc"))
        );

        const fetchedOrders = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrderList(fetchedOrders);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleOrders = useMemo(() => {
    return orderList.filter((order) => {
      const status = order.status || "pending";
      return showArchived ? ARCHIVED_STATUSES.has(status) : ACTIVE_STATUSES.has(status);
    });
  }, [orderList, showArchived]);

  const counts = useMemo(() => {
    return orderList.reduce(
      (acc, order) => {
        const status = order.status || "pending";
        if (ACTIVE_STATUSES.has(status)) acc.active += 1;
        if (ARCHIVED_STATUSES.has(status)) acc.archived += 1;
        return acc;
      },
      { active: 0, archived: 0 }
    );
  }, [orderList]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={22} />
        <span>Loading your orders...</span>
      </div>
    );
  }

  if (isSignedIn === false) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-bold">Please sign in to view your orders.</p>
        <p className="mt-2 text-sm">We only load order history for the currently signed-in account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-5">
      <div className="rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <PackageCheck size={16} />
              My Orders
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Track every purchase in one place</h1>
            <p className="max-w-2xl text-sm text-white/75">
              See active orders, review what was placed, and check the latest delivery status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Active</p>
              <p className="text-3xl font-black">{counts.active}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Archived</p>
              <p className="text-3xl font-black">{counts.archived}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
            !showArchived
              ? "bg-[tomato] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Clock3 size={18} />
          Ongoing / Delivered
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
            showArchived
              ? "bg-[tomato] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          <PackageX size={18} />
          Cancelled / Returned
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          {showArchived ? "You have no cancelled or returned orders." : "You have no active orders yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const status = order.status || "pending";
            const itemCount = Array.isArray(order.items) ? order.items.length : 0;

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                        {order.orderId}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : status === "cancelled" || status === "returned"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-gray-900">
                      {order.name || order.email || "Order details"}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{order.location || "No delivery location"}</span>
                      <span>{order.number || "No phone number"}</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Order total</p>
                    <p className="text-2xl font-black text-[tomato]">
                      ${Number(order.paidAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold text-gray-700">Items ({itemCount})</p>
                    <p className="text-sm text-gray-500">
                      {order.payOnDelivery ? "Payment on delivery" : "Paid online"}
                    </p>
                  </div>

                  {itemCount === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      This order has no items attached.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-bold text-gray-900">{item.name}</p>
                                <p className="line-clamp-2 text-sm text-gray-500">{item.description}</p>
                              </div>
                              <p className="shrink-0 font-black text-[tomato]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-white px-2.5 py-1 text-gray-600">
                                Qty: {item.quantity}
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1 text-gray-600">
                                Category: {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
