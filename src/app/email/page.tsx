"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Mail,
  Send,
  CheckSquare,
  Square,
  Loader2,
  History,
  BarChart3,
  Plus,
  Trash2,
} from "lucide-react";

type CardType = {
  _id: string;

  category: string;

  front: {
    name?: string;
    company?: string;
    email?: string[];
  };

  back?: {
    email?: string[];
  };
};

export default function EmailPage() {
  const [cards, setCards] =
    useState<CardType[]>([]);

  const [selected, setSelected] =
    useState<string[]>([]);

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [history, setHistory] =
    useState<any[]>([]);

  const [stats, setStats] =
    useState<any>(null);

  const [manualEmail, setManualEmail] =
    useState("");

  const [customEmails, setCustomEmails] =
    useState<string[]>([]);

  async function fetchCards() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/cards"
      );

      const data = await res.json();

      const filtered =
        data.filter(
          (card: CardType) =>
            card?.front?.email?.length ||
            card?.back?.email?.length
        );

      setCards(filtered);

      const historyRes =
        await fetch(
          "/api/email-history"
        );

      const historyData =
        await historyRes.json();

      setHistory(
        historyData.history || []
      );

      setStats(historyData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (
      selected.length ===
      cards.length
    ) {
      setSelected([]);
    } else {
      setSelected(
        cards.map(
          (card) => card._id
        )
      );
    }
  }

  function addManualEmail() {
    const trimmed =
      manualEmail.trim();

    if (!trimmed) return;

    if (
      recipientEmails.includes(
        trimmed
      )
    ) {
      return;
    }

    setCustomEmails((prev) => [
      ...prev,
      trimmed,
    ]);

    setManualEmail("");
  }

  function removeCustomEmail(
    email: string
  ) {
    setCustomEmails((prev) =>
      prev.filter(
        (item) => item !== email
      )
    );
  }

  function updateCustomEmail(
    oldEmail: string,
    newEmail: string
  ) {
    setCustomEmails((prev) =>
      prev.map((item) =>
        item === oldEmail
          ? newEmail
          : item
      )
    );
  }

  const selectedCards =
    useMemo(
      () =>
        cards.filter((card) =>
          selected.includes(card._id)
        ),
      [cards, selected]
    );

  const recipientEmails = [
    ...selectedCards.flatMap(
      (card) => [
        ...(card.front.email || []),

        ...(card.back?.email || []),
      ]
    ),

    ...customEmails,
  ];

  async function sendEmails() {
    try {
      setSending(true);

      const res = await fetch(
        "/api/send-email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            recipients:
              recipientEmails,

            subject,

            message,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Email sending failed"
        );

        return;
      }

      alert(
        `Emails sent to ${recipientEmails.length} recipients`
      );

      setSubject("");

      setMessage("");

      setSelected([]);

      setCustomEmails([]);

      fetchCards();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to send emails"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9]">

      {/* NAVBAR */}

      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black text-[#232f3e]">
              Email Campaigns
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Send outreach emails to scanned contacts.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-[#232f3e] text-white px-5 py-3 rounded-2xl font-bold"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* BODY */}

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">

        {/* LEFT PANEL */}

        <div className="space-y-6">

          {/* STATS */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">

            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white p-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">

                  <BarChart3 className="w-7 h-7 text-[#ff9900]" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Campaign Stats
                  </h2>

                  <p className="text-sm text-white/70 mt-1">
                    Email usage analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-gray-100 p-4">

                <div className="text-xs uppercase tracking-widest text-gray-400 font-black">
                  Total Sent
                </div>

                <div className="mt-2 text-3xl font-black text-[#232f3e]">
                  {stats?.totalSent || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">

                <div className="text-xs uppercase tracking-widest text-gray-400 font-black">
                  Daily Left
                </div>

                <div className="mt-2 text-3xl font-black text-[#232f3e]">
                  {stats?.remainingDaily || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">

                <div className="text-xs uppercase tracking-widest text-gray-400 font-black">
                  Monthly Left
                </div>

                <div className="mt-2 text-3xl font-black text-[#232f3e]">
                  {stats?.remainingMonthly || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-100 p-4">

                <div className="text-xs uppercase tracking-widest text-gray-400 font-black">
                  Selected
                </div>

                <div className="mt-2 text-3xl font-black text-[#232f3e]">
                  {selected.length}
                </div>
              </div>
            </div>
          </div>

          {/* COMPOSER */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden sticky top-28">

            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] text-white p-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">

                  <Mail className="w-7 h-7 text-[#ff9900]" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Email Composer
                  </h2>

                  <p className="text-sm text-white/70 mt-1">
                    Outreach system
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* RECIPIENT COUNT */}

              <div className="rounded-2xl bg-[#232f3e] text-white p-5">

                <div className="text-xs uppercase tracking-widest text-white/50 font-black">
                  Active Recipients
                </div>

                <div className="mt-2 text-4xl font-black">
                  {recipientEmails.length}
                </div>
              </div>

              {/* MANUAL EMAIL */}

              <div className="space-y-4">

                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Manual Recipients
                </label>

                <div className="flex gap-2">

                  <input
                    value={manualEmail}
                    onChange={(e) =>
                      setManualEmail(
                        e.target.value
                      )
                    }
                    placeholder="Add email manually"
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#232f3e]"
                  />

                  <button
                    onClick={
                      addManualEmail
                    }
                    className="px-5 rounded-2xl bg-[#ff9900] text-[#232f3e] font-black flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />

                    Add
                  </button>
                </div>

                {customEmails.length >
                  0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">

                    {customEmails.map(
                      (email) => (
                        <div
                          key={email}
                          className="flex items-center gap-2"
                        >

                          <input
                            value={email}
                            onChange={(
                              e
                            ) =>
                              updateCustomEmail(
                                email,
                                e.target
                                  .value
                              )
                            }
                            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                          />

                          <button
                            onClick={() =>
                              removeCustomEmail(
                                email
                              )
                            }
                            className="px-4 py-3 rounded-xl bg-red-100 text-red-500 font-black"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* SUBJECT */}

              <div className="space-y-2">

                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Subject
                </label>

                <input
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }
                  placeholder="Email subject"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#232f3e]"
                />
              </div>

              {/* MESSAGE */}

              <div className="space-y-2">

                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Message
                </label>

                <textarea
                  rows={14}
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder="Write your outreach email..."
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#232f3e]"
                />
              </div>

              {/* SEND BUTTON */}

              <button
                disabled={
                  sending ||
                  recipientEmails.length ===
                    0 ||
                  !subject ||
                  !message
                }
                onClick={sendEmails}
                className="w-full h-[58px] rounded-2xl bg-[#232f3e] hover:bg-black text-white font-black tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-3"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />

                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />

                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-8">

          {/* RECIPIENTS */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden h-[85vh] flex flex-col">

            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">

              <div>
                <h2 className="text-3xl font-black text-[#232f3e]">
                  Recipients
                </h2>

                <p className="text-gray-500 mt-1">
                  Contacts with valid email addresses.
                </p>
              </div>

              <div className="text-sm font-bold uppercase tracking-widest text-gray-400">
                {cards.length} Contacts
              </div>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">

                <Loader2 className="w-10 h-10 animate-spin text-[#232f3e]" />
              </div>
            ) : (
              <div className="overflow-y-auto overflow-x-auto flex-1">

                <table className="w-full min-w-[900px]">

                  <thead className="bg-[#232f3e] text-white sticky top-0 z-10">

                    <tr className="text-left text-xs uppercase tracking-widest">

                      <th className="p-4">

                        <button
                          onClick={
                            toggleSelectAll
                          }
                          className="flex items-center gap-2 hover:text-[#ff9900] transition-all"
                        >
                          {selected.length ===
                            cards.length &&
                          cards.length >
                            0 ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}

                          Select All
                        </button>
                      </th>

                      <th className="p-4">
                        Name
                      </th>

                      <th className="p-4">
                        Company
                      </th>

                      <th className="p-4">
                        Email
                      </th>

                      <th className="p-4">
                        Category
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {cards.map((card) => (
                      <tr
                        key={card._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        <td className="p-4">

                          <button
                            onClick={() =>
                              toggleSelect(
                                card._id
                              )
                            }
                          >
                            {selected.includes(
                              card._id
                            ) ? (
                              <CheckSquare className="w-5 h-5 text-[#ff9900]" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                        </td>

                        <td className="p-4 font-semibold">
                          {card.front.name ||
                            "Unknown"}
                        </td>

                        <td className="p-4">
                          {card.front.company ||
                            "-"}
                        </td>

                        <td className="p-4 text-[#232f3e] font-medium">
                          {[
                            ...(card.front
                              .email ||
                              []),

                            ...(card.back
                              ?.email ||
                              []),
                          ].join(", ")}
                        </td>

                        <td className="p-4">

                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {card.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* HISTORY */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">

            <div className="px-8 py-6 border-b border-gray-200 flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-[#232f3e] text-white flex items-center justify-center">

                <History className="w-7 h-7 text-[#ff9900]" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#232f3e]">
                  Campaign History
                </h2>

                <p className="text-gray-500 mt-1">
                  Previously sent campaigns.
                </p>
              </div>
            </div>

            <div className="overflow-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-[#232f3e] text-white">

                  <tr className="text-left text-xs uppercase tracking-widest">

                    <th className="p-4">
                      Subject
                    </th>

                    <th className="p-4">
                      Recipients
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >

                      <td className="p-4 font-semibold">
                        {item.subject}
                      </td>

                      <td className="p-4">
                        {
                          item.recipientCount
                        }
                      </td>

                      <td className="p-4">

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-500">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {history.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-10 text-center text-gray-400 font-medium"
                      >
                        No campaigns sent yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}