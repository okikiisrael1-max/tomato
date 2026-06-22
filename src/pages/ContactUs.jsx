import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Headset,
  Mail,
  MapPin,
  MessageSquareHeart,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

const SUPPORT_EMAIL = "support@tomato.app";
const SUPPORT_PHONE = "+1 (555) 014-2020";
const SUPPORT_PHONE_LINK = "+15550142020";
const SUPPORT_HOURS = "Mon - Sat, 8:00 AM - 8:00 PM";
const SUPPORT_LOCATION = "Online support desk";

const QUICK_TOPICS = [
  "Late delivery",
  "Missing items",
  "Wrong order",
  "Refund request",
];

const supportCards = [
  {
    icon: Mail,
    label: "Email",
    value: SUPPORT_EMAIL,
    helper: "Best for detailed order issues and follow-up.",
  },
  {
    icon: Phone,
    label: "Phone",
    value: SUPPORT_PHONE,
    helper: "Best for urgent delivery problems.",
  },
  {
    icon: Clock3,
    label: "Hours",
    value: SUPPORT_HOURS,
    helper: "We usually reply within one business day.",
  },
  {
    icon: MapPin,
    label: "Location",
    value: SUPPORT_LOCATION,
    helper: "No need to visit in person.",
  },
];

const ContactUs = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success("Support email copied");

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.log(error);
      toast.error("Could not copy email");
    }
  };

  const handleTopic = (topic) => {
    setForm((prev) => ({
      ...prev,
      subject: topic,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSending(true);

    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Subject: ${form.subject.trim()}`,
      "",
      form.message.trim(),
      "",
      "If this is about an order, include your order ID and delivery address.",
    ].join("\n");

    const params = new URLSearchParams({
      subject: `Tomato support - ${form.subject.trim()}`,
      body,
    });

    window.location.href = `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
    toast.success("Opening your email app");
    setIsSending(false);
  };

  return (
    <div className="relative space-y-6 p-2 md:p-5">
      <div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[tomato]/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-900 p-6 text-white shadow-xl">
        <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-[tomato]/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
              <MessageSquareHeart size={16} />
              Contact Tomato Support
            </div>

            <div className="space-y-4">
              <img src={assets.logo} alt="Tomato logo" className="h-12 w-auto" />
              <h1 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
                Need help with an order, refund, or delivery issue?
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/75">
                Send us the details below and we will open your email app with a pre-filled
                support request. You can also copy the contact email or jump directly to
                your orders and delivery tracker.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                Fast order support
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                Delivery issue help
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                Refund follow-up
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/track-delivery")}
                className="inline-flex items-center gap-2 rounded-full bg-[tomato] px-5 py-3 font-semibold text-white transition hover:bg-[#d4533c]"
              >
                Track delivery
                <Truck size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                View orders
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur lg:w-[360px] lg:grid-cols-2">
            {supportCards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.label} className="rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                    <Icon size={14} />
                    {card.label}
                  </div>
                  <p className="mt-3 text-lg font-black text-white">{card.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/70">{card.helper}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Headset size={18} className="text-[tomato]" />
              <p className="font-bold text-gray-900">Quick contact</p>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 text-left transition hover:border-[tomato]/30 hover:bg-[tomato]/5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">Support email</p>
                  <p className="text-sm text-gray-500">{SUPPORT_EMAIL}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[tomato]">
                  <Copy size={16} />
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>

              <a
                href={`tel:${SUPPORT_PHONE_LINK}`}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 transition hover:border-[tomato]/30 hover:bg-[tomato]/5"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">Call us</p>
                  <p className="text-sm text-gray-500">{SUPPORT_PHONE}</p>
                </div>
                <span className="text-sm font-semibold text-[tomato]">Tap to call</span>
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[tomato]" />
              <p className="font-bold text-gray-900">Common reasons to reach out</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopic(topic)}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-[tomato]" />
              <p className="font-bold text-gray-900">Response window</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Support usually replies within one business day. Urgent delivery issues are best
              sent with your order ID and phone number so the team can respond faster.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
              Send a message
            </p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">
              Tell us what happened
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Fill in the form and we will open your email app with everything ready to send.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  className="w-full rounded-2xl border border-gray-200 bg-stone-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="w-full rounded-2xl border border-gray-200 bg-stone-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={handleChange("subject")}
                className="w-full rounded-2xl border border-gray-200 bg-stone-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                placeholder="What do you need help with?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows={7}
                value={form.message}
                onChange={handleChange("message")}
                className="w-full rounded-2xl border border-gray-200 bg-stone-50 p-3 outline-none transition focus:border-[tomato] focus:bg-white"
                placeholder="Add your order ID, delivery address, and a short description of the issue..."
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[tomato] px-4 py-3 font-semibold text-white transition hover:bg-[#d4533c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? "Opening email app..." : "Send message"}
              <Send size={18} />
            </button>

            <p className="text-center text-xs leading-5 text-gray-500">
              This page does not store your message on the server. It opens your email client
              with a pre-filled support request.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;
