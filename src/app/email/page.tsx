"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Loader2,
  Plus,
  Trash2,
  Send,
  Users,
  Mail,
  CheckSquare,
  Square,
  Pencil,
  X,
} from "lucide-react";

type CRMCard = {
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

type GroupMember = {
  id: string;

  email: string;

  fields?: {
    name?: string;
  };
};

export default function EmailPage() {
  const [crmCards, setCrmCards] =
    useState<CRMCard[]>([]);

  const [groupMembers, setGroupMembers] =
    useState<GroupMember[]>([]);

  const [selectedMembers, setSelectedMembers] =
    useState<string[]>([]);

  const [
    selectedContacts,
    setSelectedContacts,
    ] = useState<string[]>([]);

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);


  async function fetchData() {
    try {
      setLoading(true);

      const cardsRes =
        await fetch("/api/cards");

      const cardsData =
        await cardsRes.json();

      const filtered =
        cardsData.filter(
          (card: CRMCard) =>
            card?.front?.email
              ?.length ||
            card?.back?.email
              ?.length
        );

      setCrmCards(filtered);

      const membersRes =
        await fetch(
          "/api/mailerlite/group-members"
        );

      const membersData =
        await membersRes.json();

      setGroupMembers(
        membersData.members || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const existingEmails =
    groupMembers.map((m) =>
      m.email.toLowerCase()
    );

  const availableContacts =
    crmCards.filter((card) => {
      const emails = [
        ...(card.front.email || []),

        ...(card.back?.email || []),
      ];

      return emails.some(
        (email) =>
          !existingEmails.includes(
            email.toLowerCase()
          )
      );
    });

  async function addToGroup(
    email: string,
    name: string
  ) {
    try {
      await fetch(
        "/api/mailerlite/add-to-group",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            name,
          }),
        }
      );

      fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFromGroup(
    subscriberId: string
  ) {
    try {
      await fetch(
        "/api/mailerlite/remove-from-group",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            subscriberId,
          }),
        }
      );

      fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  async function editSubscriber(
    member: GroupMember
  ) {
    const newEmail =
      prompt(
        "Edit email",
        member.email
      );

    if (!newEmail) return;

    const newName =
      prompt(
        "Edit name",
        member.fields?.name ||
          ""
      );

    try {
      await fetch(
        "/api/mailerlite/update-subscriber",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            subscriberId:
              member.id,

            email: newEmail,

            name: newName,
          }),
        }
      );

      fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  function toggleMember(
    email: string
  ) {
    setSelectedMembers((prev) =>
      prev.includes(email)
        ? prev.filter(
            (item) =>
              item !== email
          )
        : [...prev, email]
    );
  }

  function toggleAllMembers() {
    if (
      selectedMembers.length ===
      groupMembers.length
    ) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(
        groupMembers.map(
          (m) => m.email
        )
      );
    }
  }

  function toggleContact(
  email: string
) {
  setSelectedContacts((prev) =>
    prev.includes(email)
      ? prev.filter(
          (item) =>
            item !== email
        )
      : [...prev, email]
  );
}

function toggleAllContacts() {
  const allEmails =
    availableContacts
      .map(
        (card) =>
          card.front.email?.[0] ||
          card.back?.email?.[0]
      )
      .filter(Boolean);

  if (
    selectedContacts.length ===
    allEmails.length
  ) {
    setSelectedContacts([]);
  } else {
    setSelectedContacts(
      allEmails as string[]
    );
  }
}

async function addSelectedContacts() {
  try {
    for (const email of selectedContacts) {
      const card =
        availableContacts.find(
          (c) =>
            c.front.email?.[0] ===
              email ||
            c.back?.email?.[0] ===
              email
        );

      await addToGroup(
        email,
        card?.front.name || ""
      );
    }

    setSelectedContacts([]);

    fetchData();
  } catch (error) {
    console.error(error);
  }
}

  async function sendCampaign() {
    try {
      setSending(true);

      const res = await fetch(
        "/api/mailerlite/send",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            emails:
              selectedMembers,

            subject,

            message,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(data.error);

        return;
      }

      alert(
        "Campaign launched"
      );

      setSubject("");

      setMessage("");

      setSelectedMembers([]);

      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9]">

      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">

        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black text-[#232f3e]">
              MailerLite CRM
            </h1>

            <p className="text-gray-500 mt-1">
              Lead management &
              campaign operations
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-[#232f3e] text-white px-5 py-3 rounded-2xl font-black"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">

        {/* LEFT */}

        <div className="space-y-6">

          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden">

            <div className="bg-[#232f3e] text-white p-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">

                  <Mail className="w-7 h-7 text-[#ff9900]" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Campaign Composer
                  </h2>

                  <p className="text-sm text-white/70 mt-1">
                    Send campaigns to
                    selected subscribers
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">

              <div className="rounded-2xl bg-[#232f3e] text-white p-5">

                <div className="text-xs uppercase tracking-widest text-white/50 font-black">
                  Selected Audience
                </div>

                <div className="mt-2 text-4xl font-black">
                  {
                    selectedMembers.length
                  }
                </div>
              </div>

              <input
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                placeholder="Campaign subject"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm"
              />

              <textarea
                rows={12}
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Campaign message"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm resize-none"
              />

              <button
                disabled={
                  sending ||
                  !subject ||
                  !message ||
                  selectedMembers.length ===
                    0
                }
                onClick={sendCampaign}
                className="w-full h-[56px] rounded-2xl bg-[#232f3e] text-white font-black flex items-center justify-center gap-3"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Launch Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* GROUP MEMBERS */}

          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden">

            <div className="p-6 border-b border-gray-200 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black text-[#232f3e]">
                  Business Card Leads
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedMembers.length} selected / {groupMembers.length} total
                </p>
              </div>

              <button
                onClick={
                  toggleAllMembers
                }
                className="bg-[#232f3e] text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"
              >
                {selectedMembers.length ===
                groupMembers.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}

                Select All
              </button>
            </div>

            <div className="max-h-[500px] overflow-auto">

              {loading ? (
                <div className="p-10 flex justify-center">

                  <Loader2 className="w-8 h-8 animate-spin text-[#232f3e]" />
                </div>
              ) : (
                groupMembers.map(
                  (member) => (
                    <div
                      key={member.id}
                      className="p-5 border-t border-gray-100 flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-4">

                        <button
                          onClick={() =>
                            toggleMember(
                              member.email
                            )
                          }
                        >
                          {selectedMembers.includes(
                            member.email
                          ) ? (
                            <CheckSquare className="w-5 h-5 text-[#ff9900]" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </button>

                        <div>

                          <h3 className="font-black text-[#232f3e]">
                            {member.fields
                              ?.name ||
                              "Unnamed"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {
                              member.email
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            editSubscriber(
                              member
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            removeFromGroup(
                              member.id
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* AVAILABLE CONTACTS */}

          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden">

            <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">

              <div className="w-12 h-12 rounded-2xl bg-[#232f3e] text-white flex items-center justify-center">

                <Users className="w-6 h-6 text-[#ff9900]" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#232f3e]">
                  Available CRM Contacts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedContacts.length} selected / {availableContacts.length} total
                </p>
              </div>

              <div className="flex items-center gap-3">

                    <button
                        onClick={toggleAllContacts}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"
                    >
                        {selectedContacts.length ===
                        availableContacts
                          .map(
                            (card) =>
                              card.front.email?.[0] ||
                              card.back?.email?.[0]
                          )
                          .filter(Boolean)
                          .length ? (
                        <CheckSquare className="w-4 h-4" />
                        ) : (
                        <Square className="w-4 h-4" />
                        )}

                        Select All
                    </button>

                    <button
                        disabled={
                        selectedContacts.length ===
                        0
                        }
                        onClick={
                        addSelectedContacts
                        }
                        className="bg-[#ff9900] disabled:opacity-50 disabled:cursor-not-allowed text-[#232f3e] px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />

                        Add Selected
                    </button>
                </div>
            </div>

            <div className="max-h-[700px] overflow-auto">

              {availableContacts.map(
                (card) => {
                  const email =
                    card.front.email?.[0] ||
                    card.back?.email?.[0];

                  return (
                    <div
                      key={card._id}
                      className="p-5 border-t border-gray-100 flex items-center justify-between gap-4"
                    >

                      <div className="flex items-start gap-4">

                        <button
                          onClick={() =>
                            toggleContact(
                              email || ""
                            )
                          }
                          className="mt-1"
                        >
                          {selectedContacts.includes(
                            email || ""
                          ) ? (
                            <CheckSquare className="w-5 h-5 text-[#ff9900]" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </button>

                        <div>

                          <h3 className="font-black text-[#232f3e]">
                            {card.front.name ||
                              "Unknown"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {email}
                          </p>

                          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">
                            {card.category}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          addToGroup(
                            email || "",
                            card.front.name ||
                              ""
                          )
                        }
                        className="px-4 py-3 rounded-2xl bg-[#ff9900] text-[#232f3e] font-black flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>


    </main>
  );
}