import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  Clock3,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  PackageX,
  Phone,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";

const STATUS_META = {
  pending: {
    label: "Pending",
    tone: "amber",
    progress: 1,
    description: "Your order has been received and is waiting to be prepared.",
  },
  active: {
    label: "In progress",
    tone: "blue",
    progress: 2,
    description: "The kitchen is actively working on your order.",
  },
  delivered: {
    label: "Delivered",
    tone: "green",
    progress: 3,
    description: "Your order has been delivered successfully.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "rose",
    progress: 0,
    description: "This order was cancelled before delivery.",
  },
  returned: {
    label: "Returned",
    tone: "rose",
    progress: 0,
    description: "This order was returned after dispatch.",
  },
};

const TRACK_STEPS = [
  {
    title: "Order received",
    description: "Your cart has been converted into a tracked order.",
  },
  {
    title: "In progress",
    description: "Preparation and dispatch are underway.",
  },
  {
    title: "Delivered",
    description: "The order has reached the delivery address.",
  },
];

const formatDate = (value) => {
  if (!value) return "Just now";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toLocaleString();
  return "Just now";
};

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.pending;

const getStatusClasses = (status) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700 ring-green-200";
    case "active":
      return "bg-blue-100 text-blue-700 ring-blue-200";
    case "cancelled":
    case "returned":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
};

const getProgressWidth = (progress) => {
  if (progress <= 0) return "w-0";
  if (progress === 1) return "w-1/3";
  if (progress === 2) return "w-2/3";
  return "w-full";
};

const TrackDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsSignedIn(false);
        setLoading(false);
        setOrders([]);
        return;
      }

      setIsSignedIn(true);
      setLoading(true);

      try {
        const orderSnapshot = await getDocs(
          query(collection(db, "orders", currentUser.uid, "items"), orderBy("createdAt", "desc"))
        );

        const fetchedOrders = orderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(fetchedOrders);
        setError("");
        setSelectedOrderId((current) => current || fetchedOrders[0]?.id || "");
      } catch (err) {
        setError(err.message || "Failed to load delivery tracking data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleOrders = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    if (!normalizedQuery) return orders;

    return orders.filter((order) => {
      const searchableValues = [
        order.orderId,
        order.name,
        order.email,
        order.number,
        order.location,
        order.status,
        ...(Array.isArray(order.items) ? order.items.map((item) => item.name) : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(normalizedQuery);
    });
  }, [orders, searchText]);

  const selectedOrder = useMemo(() => {
    return orders.find((order) => order.id === selectedOrderId) || visibleOrders[0] || orders[0] || null;
  }, [orders, selectedOrderId, visibleOrders]);

  const stats = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          const status = order.status || "pending";
          if (status === "pending" || status === "active") acc.active += 1;
          if (status === "delivered") acc.delivered += 1;
          if (status === "cancelled" || status === "returned") acc.stopped += 1;
          acc.total += 1;
          return acc;
        },
        { total: 0, active: 0, delivered: 0, stopped: 0 }
      ),
    [orders]
  );

  const selectedMeta = getStatusMeta(selectedOrder?.status);
  const selectedStatus = selectedOrder?.status || "pending";
  const itemCount = Array.isArray(selectedOrder?.items) ? selectedOrder.items.length : 0;
  const isStopped = selectedStatus === "cancelled" || selectedStatus === "returned";
  const lastUpdate = selectedOrder?.updatedAt || selectedOrder?.createdAt;
  const progressWidth = getProgressWidth(selectedMeta.progress);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={22} />
        <span>Loading delivery tracker...</span>
      </div>
    );
  }

  if (isSignedIn === false) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-bold">Please sign in to track your delivery.</p>
        <p className="mt-2 text-sm">
          We only load delivery data for the currently signed-in account.
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-6 text-white shadow-xl">
        <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-[tomato]/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
            <PackageCheck size={16} />
            Delivery Tracking
          </div>
          <h1 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
            No orders to track yet.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/75">
            Once you place an order, this page will show the current delivery stage,
            order details, and the latest status updates from the admin panel.
          </p>
          <button
            type="button"
            onClick={() => navigate("/foods")}
            className="inline-flex items-center gap-2 rounded-full bg-[tomato] px-5 py-3 font-semibold text-white transition hover:bg-[#d4533c]"
          >
            Browse food menu
            <Package size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 p-2 md:p-5">
      <div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[tomato]/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-6 text-white shadow-xl">
        <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-[tomato]/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <PackageCheck size={16} />
              Delivery Tracking
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
                Follow every order from kitchen to doorstep.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/75">
                Search an order ID, inspect the current delivery stage, and review the
                delivery details in one place. Status updates are synced from the admin
                order panel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                {orders.length} tracked orders
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                {stats.active} active / pending
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                {stats.delivered} delivered
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <Search size={18} className="text-white/70" />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search order ID, name, phone, location..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/15"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">In progress</p>
                <p className="text-3xl font-black">{stats.active}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Delivered</p>
                <p className="text-3xl font-black">{stats.delivered}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Stopped</p>
                <p className="text-3xl font-black">{stats.stopped}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Total</p>
                <p className="text-3xl font-black">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          {selectedOrder ? (
            <>
              <div className="border-b border-gray-100 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                        {selectedOrder.orderId}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                          selectedStatus
                        )}`}
                      >
                        {selectedMeta.label}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
                      {selectedOrder.name || selectedOrder.email || "Delivery details"}
                    </h2>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={16} />
                        {selectedOrder.location || "No delivery location"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={16} />
                        {selectedOrder.number || "No phone number"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={16} />
                        {formatDate(lastUpdate)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Order total
                    </p>
                    <p className="text-2xl font-black text-[tomato]">
                      ${Number(selectedOrder.paidAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                {isStopped ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <PackageX size={18} />
                      {selectedMeta.label}
                    </div>
                    <p className="mt-2 text-sm leading-6">{selectedMeta.description}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Delivery progress
                        </p>
                        <p className="text-xs text-slate-500">{selectedMeta.description}</p>
                      </div>
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {selectedMeta.label}
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full bg-[tomato] transition-all ${progressWidth}`}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {TRACK_STEPS.map((step, index) => {
                        const stepNumber = index + 1;
                        const done = selectedMeta.progress >= stepNumber;
                        const current = selectedMeta.progress === stepNumber;

                        return (
                          <div
                            key={step.title}
                            className={`rounded-2xl border p-4 transition ${
                              current
                                ? "border-[tomato] bg-[tomato]/5"
                                : done
                                  ? "border-green-200 bg-green-50"
                                  : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                                  done
                                    ? "border-[tomato] bg-[tomato] text-white"
                                    : current
                                      ? "border-[tomato] bg-white text-[tomato]"
                                      : "border-gray-300 bg-white text-gray-400"
                                }`}
                              >
                                {done ? <PackageCheck size={18} /> : stepNumber}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{step.title}</p>
                                <p className="text-xs text-gray-500">{step.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Payment</p>
                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedOrder.payOnDelivery ? "Pay on delivery" : "Paid online"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Items
                    </p>
                    <p className="mt-2 font-semibold text-gray-900">{itemCount} item(s)</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Created
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Status
                    </p>
                    <p className="mt-2 font-semibold text-gray-900">{selectedMeta.label}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">Items in this order</p>
                      <p className="text-sm text-gray-500">
                        Review what is currently being tracked for this delivery.
                      </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {itemCount} total
                    </span>
                  </div>

                  {itemCount === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      This order has no items attached.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  Category: {item.category}
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
                                Unit: ${Number(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center text-gray-500">
              <Package size={56} className="text-gray-300" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">No order selected</h2>
                <p className="max-w-md text-sm">
                  Pick an order from the list on the right to inspect the current delivery stage.
                </p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">Recent orders</p>
                <p className="text-xs text-gray-500">
                  Tap any order to inspect its tracking details.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {visibleOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {visibleOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  No orders match your search.
                </div>
              ) : (
                visibleOrders.map((order) => {
                  const status = order.status || "pending";
                  const active = order.id === selectedOrderId;

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[tomato] bg-[tomato]/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-gray-900">
                            {order.orderId}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {order.name || order.email || "Order details"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getStatusClasses(
                            status
                          )}`}
                        >
                          {getStatusMeta(status).label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          ${Number(order.paidAmount || 0).toFixed(2)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {Array.isArray(order.items) ? order.items.length : 0} items
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Clock3 size={18} className="text-gray-500" />
              Tracking note
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Status changes come from the admin order dashboard. If an order appears
              stuck on pending, the kitchen or rider has not moved it forward yet.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TrackDelivery;
