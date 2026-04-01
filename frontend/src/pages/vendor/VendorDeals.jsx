import { useEffect, useState } from "react";
import { dealAPI } from "../../services/apis/index";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";

const STATUS_INFO = {
  PROPOSED:  { label: "Proposed",    color: "bg-amber-50 text-amber-700 border-amber-200",  icon: "📝" },
  COUNTERED: { label: "Countered",   color: "bg-blue-50 text-blue-700 border-blue-200",     icon: "🔄" },
  ACCEPTED:  { label: "Accepted",    color: "bg-indigo-50 text-indigo-700 border-indigo-200",icon: "✅" },
  ACTIVE:    { label: "Active",      color: "bg-green-50 text-green-700 border-green-200",  icon: "🤝" },
  COMPLETED: { label: "Completed",   color: "bg-teal-50 text-teal-700 border-teal-200",     icon: "🎉" },
  BROKEN:    { label: "Broken -10pts","color":"bg-red-50 text-red-700 border-red-200",      icon: "⚠️" },
  REJECTED:  { label: "Rejected",    color: "bg-ink-50 text-ink-500 border-ink-200",        icon: "❌" },
  CANCELLED: { label: "Cancelled",   color: "bg-ink-50 text-ink-400 border-ink-200",        icon: "🚫" },
};

function DealChat({ deal, currentUserId, onMessage, sending }) {
  const [msg, setMsg] = useState("");
  const endRef = { current: null };

  const handleSend = () => {
    if (!msg.trim()) return;
    onMessage(msg);
    setMsg("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-80">
        {deal.messages?.map((m, i) => {
          const isMe = m.senderId === currentUserId;
          const isSystem = m.senderName === "System";
          if (isSystem) return (
            <div key={i} className="text-center">
              <span className="text-xs text-ink-400 bg-sand-100 px-3 py-1 rounded-full">{m.message}</span>
            </div>
          );
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMe && <span className="text-[10px] text-ink-400 ml-2">{m.senderName}</span>}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                  isMe ? "bg-brand-600 text-white rounded-tr-sm" : "bg-white border border-ink-100 text-ink-800 rounded-tl-sm"
                }`}>{m.message}</div>
                <span className="text-[9px] text-ink-300 mx-2">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : ""}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      {!["COMPLETED","BROKEN","REJECTED","CANCELLED"].includes(deal.status) && (
        <div className="border-t border-ink-100 p-3 flex gap-2">
          <input
            value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-ink-200 text-sm bg-sand-50 focus:outline-none focus:border-brand-400"
          />
          <button onClick={handleSend} disabled={sending || !msg.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-40 transition-all">
            {sending ? "..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}

function DealDetailPanel({ dealId, currentUserId, vendorId, onUpdate, onClose }) {
  const showToast = useToastStore(s => s.showToast);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [sending, setSending] = useState(false);
  const [breakReason, setBreakReason] = useState("");
  const [showBreakForm, setShowBreakForm] = useState(false);

  const load = () => {
    dealAPI.getById(dealId).then(r => setDeal(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [dealId]);

  if (loading) return <div className="p-8 text-center"><div className="skeleton h-40 rounded-xl" /></div>;
  if (!deal) return <div className="p-8 text-center text-ink-500">Deal not found</div>;

  const isSeller = deal.sellerVendorId?._id === vendorId || deal.sellerVendorId === vendorId;
  const isBuyer  = deal.buyerVendorId?._id  === vendorId || deal.buyerVendorId  === vendorId;
  const mySign   = isSeller ? deal.sellerSigned : deal.buyerSigned;
  const status   = STATUS_INFO[deal.status] || { label: deal.status, color: "bg-ink-50 text-ink-600", icon: "•" };
  const finalPrice = deal.counterPrice || deal.proposedPrice;
  const finalQty   = deal.counterQty   || deal.proposedQty;

  const act = async (fn, successMsg) => {
    setActing(true);
    try { await fn(); showToast({ message: successMsg, type: "success" }); load(); onUpdate(); }
    catch (err) { showToast({ message: err?.response?.data?.message || "Action failed", type: "error" }); }
    finally { setActing(false); }
  };

  const handleMessage = async (message) => {
    setSending(true);
    try { await dealAPI.sendMessage(dealId, { message }); load(); }
    catch { showToast({ message: "Failed to send message", type: "error" }); }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
              {status.icon} {status.label}
            </span>
            <span className="text-xs text-ink-400">#{deal._id?.slice(-8).toUpperCase()}</span>
          </div>
          <p className="text-sm font-bold text-ink-900 mt-1">{deal.listingId?.title}</p>
          <p className="text-xs text-ink-500">
            {isSeller ? `Buyer: ${deal.buyerVendorId?.shopName}` : `Seller: ${deal.sellerVendorId?.shopName}`}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-50 text-ink-400">✕</button>
      </div>

      {/* Deal terms */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-sand-50 border-b border-ink-100">
        <div className="text-center">
          <p className="text-xs text-ink-400">Price/unit</p>
          <p className="text-lg font-bold text-ink-900">₹{finalPrice?.toLocaleString()}</p>
          {deal.counterPrice && deal.proposedPrice !== deal.counterPrice && (
            <p className="text-[10px] text-ink-400 line-through">₹{deal.proposedPrice}</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-ink-400">Quantity</p>
          <p className="text-lg font-bold text-ink-900">{finalQty} units</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-ink-400">Total</p>
          <p className="text-lg font-bold text-green-700">₹{(finalPrice * finalQty)?.toLocaleString()}</p>
        </div>
      </div>
      {deal.terms && <p className="text-xs text-ink-600 px-4 py-2 bg-sand-50 border-b border-ink-100">📜 {deal.terms}</p>}

      {/* Signature status */}
      {["ACCEPTED","ACTIVE"].includes(deal.status) && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-3">
          <div className="flex gap-4 text-xs">
            <span className={`flex items-center gap-1.5 font-semibold ${deal.sellerSigned ? "text-green-700" : "text-ink-400"}`}>
              {deal.sellerSigned ? "✍️" : "⬜"} Seller {deal.sellerSigned ? "Signed" : "Pending"}
            </span>
            <span className={`flex items-center gap-1.5 font-semibold ${deal.buyerSigned ? "text-green-700" : "text-ink-400"}`}>
              {deal.buyerSigned ? "✍️" : "⬜"} Buyer {deal.buyerSigned ? "Signed" : "Pending"}
            </span>
          </div>
          {!mySign && deal.status === "ACCEPTED" && (
            <button onClick={() => act(() => dealAPI.sign(dealId), "Deal signed! ✍️")}
              disabled={acting}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              Sign Deal ✍️
            </button>
          )}
        </div>
      )}

      {/* Partner address — shown only when deal is ACTIVE so both parties can coordinate pickup/delivery */}
      {deal.status === "ACTIVE" && (() => {
        const partner = isSeller ? deal.buyerVendorId : deal.sellerVendorId;
        const partnerRole = isSeller ? "Buyer" : "Seller";
        const addrs = partner?.businessAddresses;
        const addr = Array.isArray(addrs) ? addrs[0] : addrs;
        if (!addr) return null;
        const addrLine = [addr.buildingNameOrNumber, addr.area, addr.city, addr.state, addr.pincode]
          .filter(Boolean).join(", ");
        return (
          <div className="mx-4 my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
            <span className="text-base flex-shrink-0 mt-0.5">📍</span>
            <div>
              <p className="text-xs font-bold text-emerald-800">
                {partnerRole} Address ({partner?.shopName})
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">{addrLine}</p>
            </div>
          </div>
        );
      })()}

      {/* Actions */}
      {deal.status === "PROPOSED" && isSeller && (
        <div className="px-4 py-3 border-b border-ink-100 flex gap-2 flex-wrap">
          <button onClick={() => act(() => dealAPI.respond(dealId, { action: "ACCEPT" }), "Deal accepted!")}
            disabled={acting} className="btn-primary text-xs px-4 py-2">✅ Accept</button>
          <button onClick={() => {
            const cp = prompt("Counter price per unit (₹):"); if (!cp) return;
            const cq = prompt("Counter quantity:"); if (!cq) return;
            act(() => dealAPI.respond(dealId, { action: "COUNTER", counterPrice: Number(cp), counterQty: Number(cq) }), "Counter offer sent!");
          }} disabled={acting} className="px-4 py-2 rounded-xl text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">🔄 Counter</button>
          <button onClick={() => act(() => dealAPI.respond(dealId, { action: "REJECT" }), "Deal rejected")}
            disabled={acting} className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">❌ Reject</button>
        </div>
      )}

      {deal.status === "COUNTERED" && isBuyer && (
        <div className="px-4 py-3 border-b border-ink-100 bg-blue-50 flex items-center gap-3 flex-wrap">
          <p className="text-xs text-blue-700 flex-1">Counter offer: {finalQty} units @ ₹{finalPrice}/unit</p>
          <button onClick={() => act(() => dealAPI.respond(dealId, { action: "ACCEPT" }), "Counter accepted!")}
            disabled={acting} className="btn-primary text-xs px-3 py-1.5">Accept Counter</button>
        </div>
      )}

      {deal.status === "ACTIVE" && isSeller && (
        <div className="px-4 py-3 border-b border-ink-100 flex gap-2 flex-wrap">
          <button onClick={() => act(() => dealAPI.complete(dealId), "🎉 Deal completed!")}
            disabled={acting} className="btn-primary text-xs px-4 py-2">✅ Mark Completed</button>
          <button onClick={() => setShowBreakForm(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">⚠️ Break Deal (-10pts)</button>
        </div>
      )}

      {deal.status === "ACTIVE" && isBuyer && (
        <div className="px-4 py-3 border-b border-ink-100">
          <button onClick={() => setShowBreakForm(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">⚠️ Break Deal (-10 pts penalty)</button>
        </div>
      )}

      {showBreakForm && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <p className="text-xs font-bold text-red-700 mb-2">⚠️ Breaking this deal will deduct 10 points from your vendor score.</p>
          <input value={breakReason} onChange={e => setBreakReason(e.target.value)}
            placeholder="Reason for breaking the deal..." className="input-base text-sm mb-2" />
          <div className="flex gap-2">
            <button onClick={() => act(() => dealAPI.break(dealId, { reason: breakReason }), "Deal broken — penalty applied")}
              disabled={!breakReason.trim() || acting} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white disabled:opacity-50">Confirm Break</button>
            <button onClick={() => setShowBreakForm(false)} className="px-4 py-2 text-xs rounded-xl border border-ink-200 text-ink-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1">
        <DealChat deal={deal} currentUserId={currentUserId} onMessage={handleMessage} sending={sending} />
      </div>
    </div>
  );
}

export default function VendorDeals() {
  const showToast = useToastStore(s => s.showToast);
  const user = useAuthStore(s => s.user);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [openDealId, setOpenDealId] = useState(null);
  const [vendorId, setVendorId] = useState(null);

  // Fetch vendor profile once to get the real vendor _id
  useEffect(() => {
    import("../../services/apis/index").then(({ vendorAPI }) => {
      vendorAPI.getProfile()
        .then(r => setVendorId(r.data?.data?._id))
        .catch(() => {});
    });
  }, []);

  const load = () => {
    setLoading(true);
    dealAPI.getMy()
      .then(r => setDeals(r.data?.data || []))
      .catch(() => {
        // Only show toast if it's not an empty-state scenario
        showToast({ message: "Could not load deals", type: "error" });
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === "ALL" ? deals : deals.filter(d => d.status === filter);
  const pending = deals.filter(d => ["PROPOSED","COUNTERED","ACCEPTED"].includes(d.status)).length;

  return (
    <div className="min-h-screen bg-sand-50" style={{ display: "grid", gridTemplateColumns: openDealId ? "1fr 420px" : "1fr", height: "100vh", overflow: "hidden" }}>
      {/* Left panel — deal list */}
      <div className="overflow-y-auto p-6">
        <div className="mb-6">
          <p className="section-label">Vendor</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 mt-1">My Deals</h1>
          <p className="text-ink-400 text-sm mt-0.5">Trade agreements with other vendors</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {["ALL","PROPOSED","COUNTERED","ACCEPTED","ACTIVE","COMPLETED","BROKEN","REJECTED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                filter === s ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-400"
              }`}>
              {s === "ALL" ? "All Deals" : STATUS_INFO[s]?.label || s.replace(/_/g, " ")}
              {s === "ALL" && pending > 0 && <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pending}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="skeleton h-16 rounded-xl" /></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <p className="font-display font-bold text-ink-900 text-lg">No deals yet</p>
            <p className="text-ink-500 text-sm mt-2">Browse the <a href="/vendor/marketplace" className="text-brand-600 font-semibold">Vendor Marketplace</a> and make a deal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => {
              const info = STATUS_INFO[d.status] || { label: d.status, color: "bg-ink-50 text-ink-600 border-ink-200", icon: "•" };
              const isSelected = openDealId === d._id;
              const finalPrice = d.counterPrice || d.proposedPrice;
              const finalQty   = d.counterQty   || d.proposedQty;
              const isSeller   = d.sellerVendorId?._id === vendorId || d.sellerVendorId === vendorId;
              const lastMsg    = d.messages?.[d.messages.length - 1];
              const unread     = d.messages?.filter(m => !m.read && m.senderId !== user?._id).length || 0;

              return (
                <div key={d._id}
                  onClick={() => setOpenDealId(isSelected ? null : d._id)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-card-hover ${isSelected ? "border-2 border-brand-400 bg-brand-50" : "hover:-translate-y-0.5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.color}`}>{info.icon} {info.label}</span>
                        {unread > 0 && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread} new</span>}
                      </div>
                      <p className="text-sm font-semibold text-ink-900 truncate">{d.listingId?.title || "Listing"}</p>
                      <p className="text-xs text-ink-500">{isSeller ? `↩ From: ${d.buyerVendorId?.shopName}` : `→ To: ${d.sellerVendorId?.shopName}`}</p>
                      {lastMsg && <p className="text-xs text-ink-400 mt-1 truncate">💬 {lastMsg.message}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-ink-900">₹{(finalPrice * finalQty)?.toLocaleString()}</p>
                      <p className="text-[10px] text-ink-400">{finalQty} × ₹{finalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right panel — deal detail + chat */}
      {openDealId && (
        <div className="border-l border-ink-100 bg-white flex flex-col overflow-hidden">
          <DealDetailPanel
            dealId={openDealId}
            currentUserId={user?._id}
            vendorId={vendorId}
            onUpdate={load}
            onClose={() => setOpenDealId(null)}
          />
        </div>
      )}
    </div>
  );
}