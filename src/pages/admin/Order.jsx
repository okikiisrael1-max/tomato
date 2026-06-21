import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Loader2, Package, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase/config";

const STATUS_OPTIONS = ["pending", "active", "delivered", "cancelled", "returned"];

const formatDate = (value) => {
  if (!value?.toDate) return "Just now";
  return value.toDate().toLocaleString();
};

const getOrderSortValue = (order) => {
  if (order?.createdAt?.toMillis) {
    return order.createdAt.toMillis();
  }

  if (order?.createdAt?.seconds) {
    return order.createdAt.seconds * 1000;
  }

  return 0;
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
        const profile = profileSnap.exists() ? profileSnap.data() : null;

        if (profile?.role !== "admin") {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        const userSnapshots = await getDocs(collection(db, "users"));
        const orderBuckets = await Promise.all(
          userSnapshots.docs.map(async (userDoc) => {
            const userId = userDoc.id;
            const userData = userDoc.data();

            const orderSnapshot = await getDocs(
              query(collection(db, "orders", userId, "items"), orderBy("createdAt", "desc"))
            );

            return orderSnapshot.docs.map((orderDoc) => ({
              id: orderDoc.id,
              userId,
              customerName: userData.username || userData.name || "Unknown customer",
              customerEmail: userData.email || "",
              ...orderDoc.data(),
            }));
          })
        );

        const flattenedOrders = orderBuckets
          .flat()
          .sort((a, b) => getOrderSortValue(b) - getOrderSortValue(a));

        setOrders(flattenedOrders);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = queryText.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ? true : (order.status || "pending") === statusFilter;

      const matchesSearch = !normalizedSearch
        ? true
        : [
            order.orderId,
            order.customerName,
            order.customerEmail,
            order.location,
            order.email,
            order.number,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [orders, queryText, statusFilter]);

  const totals = useMemo(() => {
    const base = {
      total: orders.length,
      pending: 0,
      active: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    for (const order of orders) {
      const status = order.status || "pending";
      if (status in base) {
        base[status] += 1;
      }
    }

    return base;
  }, [orders]);

  const handleStatus = async (order, newStatus) => {
    setSavingOrderId(order.id);

    try {
      await updateDoc(doc(db, "orders", order.userId, "items", order.id), {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((currentOrder) =>
          currentOrder.id === order.id && currentOrder.userId === order.userId
            ? { ...currentOrder, status: newStatus }
            : currentOrder
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update order");
    } finally {
      setSavingOrderId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={22} />
        <span>Loading orders...</span>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-6 text-red-800">
        <div className="flex items-center gap-3">
          <ShieldAlert size={22} />
          <p className="font-bold">Admin access required</p>
        </div>
        <p className="mt-2 text-sm">
          Your account does not have the `admin` role in Firestore, so order management is locked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-5">
      <div className="rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <Package size={16} />
              Order Management
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Live order control center</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Review customer orders, update their status, and keep the fulfillment pipeline in sync.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Orders visible</p>
            <p className="text-3xl font-black">{totals.total}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {[
          ["All", totals.total, "all"],
          ["Pending", totals.pending, "pending"],
          ["Active", totals.active, "active"],
          ["Delivered", totals.delivered, "delivered"],
          ["Cancelled/Returned", totals.cancelled + totals.returned, "cancelled"],
        ].map(([label, value, key]) => (
          <button
            key={label}
            onClick={() => setStatusFilter(key)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              statusFilter === key
                ? "border-[tomato] bg-[tomato]/10 text-[tomato]"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-medium">{label}</p>
            <p className="text-2xl font-black">{value}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search by order id, customer, email, or location"
            className="w-full outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-gray-600">
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium">{filteredOrders.length} matching orders</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No orders match the current filters.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = order.status || "pending";

            return (
              <article
                key={`${order.userId}-${order.id}`}
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

                    <h2 className="text-xl font-black text-gray-900">{order.customerName}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{order.customerEmail || "No email on file"}</span>
                      <span>{order.location || "No delivery location"}</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Paid amount</p>
                      <p className="text-2xl font-black text-[tomato]">
                        ${Number(order.paidAmount || 0).toFixed(2)}
                      </p>
                    </div>

                    <select
                      value={status}
                      onChange={(e) => handleStatus(order, e.target.value)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none"
                      disabled={savingOrderId === order.id}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option[0].toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-700">
                        Items ({Array.isArray(order.items) ? order.items.length : 0})
                      </p>
                      {savingOrderId === order.id && (
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="animate-spin" size={16} />
                          Saving...
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {Array.isArray(order.items) ? (
                        order.items.map((item) => (
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
                                <div>
                                  <p className="truncate font-bold text-gray-900">{item.name}</p>
                                  <p className="line-clamp-2 text-sm text-gray-500">
                                    {item.description}
                                  </p>
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
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                          This order does not contain any items.
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="rounded-2xl border border-gray-100 bg-stone-50 p-4">
                    <p className="font-semibold text-gray-700">Order details</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Customer</span>
                        <span className="font-medium text-gray-900">{order.name || order.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium text-gray-900">{order.number || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Payment</span>
                        <span className="font-medium text-gray-900">
                          {order.payOnDelivery ? "Pay on delivery" : "Paid"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Order total</span>
                        <span className="font-black text-[tomato]">
                          ${Number(order.paidAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white p-3 text-xs text-gray-500">
                      Updates are saved directly to the user’s nested order document.
                    </div>
                  </aside>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Order;
