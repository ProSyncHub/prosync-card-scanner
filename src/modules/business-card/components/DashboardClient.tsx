"use client";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

import * as XLSX from "xlsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Languages,
  Download,
  Repeat,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  Lock,
  QrCode,
} from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";

type Props = {
  cards: any[];
};

const VALID_CATEGORIES = [
  "Business",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Logistics",
  "Government",
  "Legal",
  "Hospitality",
  "Real Estate",
  "Uncategorized",
];

export default function DashboardClient({
  cards,
}: Props) {
  const [localCards, setLocalCards] =
    useState(cards);

  const [selectedCards, setSelectedCards] =
    useState<Set<string>>(new Set());

  const [flippedCards, setFlippedCards] =
    useState<{ [key: string]: boolean }>({});

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [editingCard, setEditingCard] =
    useState<any>(null);

  const [editPassword, setEditPassword] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const filteredCards = useMemo(() => {
    return localCards.filter((card) => {
      const front = card.front || {};
      const back = card.back || {};

      const term =
        searchTerm.toLowerCase();

      const matchesSearch =
        (front.name?.toLowerCase() || "").includes(
          term
        ) ||
        (
          front.company?.toLowerCase() || ""
        ).includes(term) ||
        (
          front.title?.toLowerCase() || ""
        ).includes(term) ||
        (back.name?.toLowerCase() || "").includes(
          term
        ) ||
        (
          back.company?.toLowerCase() || ""
        ).includes(term);

      const matchesCategory =
        selectedCategory === "All"
          ? true
          : card.category ===
            selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    localCards,
    searchTerm,
    selectedCategory,
  ]);
  const router = useRouter();
  const usedCategories = useMemo(() => {
    const unique = new Set<string>();

    localCards.forEach((card) => {
      if (
        VALID_CATEGORIES.includes(
          card.category
        )
      ) {
        unique.add(card.category);
      }
    });

    return ["All", ...Array.from(unique)];
  }, [localCards]);

  function toggleFlip(id: string) {
    if (selectedCards.size > 0) return;

    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function toggleSelectCard(
    id: string,
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    setSelectedCards((prev) => {
      const next = new Set(prev);

      next.has(id)
        ? next.delete(id)
        : next.add(id);

      return next;
    });
  }

  function selectAll() {
    setSelectedCards(
      new Set(
        filteredCards.map(
          (c: any) => c._id
        )
      )
    );
  }

  function deselectAll() {
    setSelectedCards(new Set());
  }

  function exportToExcel() {
    const toExport =
      selectedCards.size > 0
        ? localCards.filter((c) =>
            selectedCards.has(c._id)
          )
        : filteredCards;

    const rows = toExport.map((card) => {
      const f = card.front || {};
      const b = card.back || {};

      return {
        Name:
          f.name ||
          b.name ||
          "Unnamed Contact",

        Company:
          f.company ||
          b.company ||
          "",

        Title:
          f.title ||
          b.title ||
          "",

        Phone: [
          ...(f.phone || []),
          ...(b.phone || []),
        ].join(" | "),

        Email: [
          ...(f.email || []),
          ...(b.email || []),
        ].join(" | "),

        Website:
          f.website ||
          b.website ||
          "",

        Address:
          f.address ||
          b.address ||
          "",

        QRData: [
          ...(f.qrData || []),
          ...(b.qrData || []),
        ].join(" | "),

        Category:
          card.category ||
          "Uncategorized",
      };
    });

    const ws =
      XLSX.utils.json_to_sheet(rows);

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Cards"
    );

    XLSX.writeFile(
      wb,
      `business_cards.xlsx`
    );
  }

  async function deleteCard(
    id: string,
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    const password = prompt(
      "Enter admin password"
    );

    if (!password) return;

    setDeletingId(id);

    try {
      const res = await fetch(
        `/api/cards/${id}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Delete failed"
        );
      }

      setLocalCards((prev: any[]) =>
        prev.filter((c) => c._id !== id)
      );

      toast.success(
        "Card deleted successfully"
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function saveEdit() {
    if (!editingCard) return;

    if (!editPassword) {
      toast.error("Password required");
      return;
    }

    setSavingEdit(true);

    try {
      const cleanCategory =
        VALID_CATEGORIES.includes(
          editingCard.category
        )
          ? editingCard.category
          : "Uncategorized";

      const payload = {
        ...editingCard,

        category: cleanCategory,

        front: {
          ...editingCard.front,

          phone: splitLines(
            editingCard.front.phone
          ),

          email: splitLines(
            editingCard.front.email
          ),

          qrData: splitLines(
            editingCard.front.qrData
          ),
        },

        back: {
          ...editingCard.back,

          phone: splitLines(
            editingCard.back.phone
          ),

          email: splitLines(
            editingCard.back.email
          ),

          qrData: splitLines(
            editingCard.back.qrData
          ),
        },
      };

      const res = await fetch(
        `/api/cards/${editingCard._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...payload,
            password: editPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Update failed"
        );
      }

      setLocalCards((prev: any[]) =>
        prev.map((card) =>
          card._id === data._id
            ? data
            : card
        )
      );

      setEditingCard(null);

      setEditPassword("");

      toast.success(
        "Card updated successfully"
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          "Update failed"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100">

      {/* NAVBAR */}

      <nav className="bg-[#232f3e] text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur">

        <div className="flex items-center gap-2">
          <div className="bg-[#00a8e1] p-1.5 rounded-lg shadow">
            <span className="font-bold">
              P
            </span>
          </div>

          <span className="font-bold text-xl tracking-wide">
            PROSYNC{" "}
            <span className="font-light text-gray-300">
              VAULT
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">

            <Link
                href="/scanner"
                className="flex items-center gap-2 bg-[#ff9900] text-[#232f3e] hover:bg-[#e68a00] hover:scale-[1.02] px-4 py-2 rounded-xl text-sm transition-all font-black uppercase shadow"
            >
                Scanner
            </Link>
            <Link
                href="/email"
                className="flex items-center gap-2 bg-[#232f3e] text-white hover:bg-black hover:scale-[1.02] px-4 py-2 rounded-xl text-sm transition-all font-black uppercase shadow"
                >
                Email
            </Link>
            <Link
                href="/import"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#232f3e] hover:scale-[1.02] px-4 py-2 rounded-xl text-sm transition-all font-black uppercase shadow"
            >
                Import Excel
            </Link>

            <button
                onClick={async () => {
                try {
                    await fetch("/api/auth/logout", {
                    method: "POST",
                    });

                    router.push("/login");

                    router.refresh();
                } catch (error) {
                    console.error(error);
                }
                }}
                className="flex items-center gap-2 border border-white/20 hover:border-red-500 hover:text-red-500 hover:bg-white/5 px-4 py-2 rounded-xl text-sm transition-all font-medium"
            >
                Logout
            </button>
            </div>
      </nav>

      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* SEARCH */}

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-4">

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

            <input
              type="text"
              placeholder="Query database by name, company, or title..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full px-5 py-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-[#232f3e] outline-none bg-gray-50"
            />

            <button
              onClick={exportToExcel}
              className="shrink-0 flex items-center gap-2 bg-[#232f3e] text-white hover:bg-gray-800 hover:scale-[1.02] px-5 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow"
            >
              <Download className="w-4 h-4 text-[#ff9900]" />

              {selectedCards.size > 0
                ? `Export (${selectedCards.size})`
                : "Export All"}
            </button>
          </div>

          {/* CATEGORY PILLS */}

          <div className="flex flex-wrap gap-2">
            {usedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(cat)
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? "bg-[#ff9900] text-[#232f3e] shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT */}

        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {filteredCards.length} records
          </span>

          <button
            onClick={
              selectedCards.size ===
                filteredCards.length
                ? deselectAll
                : selectAll
            }
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#232f3e]"
          >
            {selectedCards.size ===
              filteredCards.length &&
            filteredCards.length >
              0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-[#ff9900]" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Select All
              </>
            )}
          </button>
        </div>

        {/* GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {filteredCards.map((card) => {
            const isFlipped =
              flippedCards[card._id];

            const isSelected =
              selectedCards.has(card._id);

            return (
              <div
                key={card._id}
                className={`flex flex-col w-full rounded-2xl transition-all duration-300 group ${
                  isSelected
                    ? "ring-2 ring-[#ff9900] ring-offset-2"
                    : ""
                }`}
              >

                {/* TOP BAR */}

                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 border-b-0 rounded-t-2xl px-3 py-2">

                  <button
                    onClick={(e) =>
                      toggleSelectCard(
                        card._id,
                        e
                      )
                    }
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#232f3e]"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#ff9900]" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}

                    <span>
                      {isSelected
                        ? "Selected"
                        : "Select"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">

                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-0.5 mr-1">
                      {isFlipped
                        ? "Back"
                        : "Front"}

                      <Repeat className="w-2.5 h-2.5 group-hover:text-[#ff9900]" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditingCard({
                          ...structuredClone(
                            card
                          ),

                          front: {
                            ...card.front,

                            phone:
                              (
                                card.front
                                  ?.phone || []
                              ).join("\n"),

                            email:
                              (
                                card.front
                                  ?.email || []
                              ).join("\n"),

                            qrData:
                              (
                                card.front
                                  ?.qrData || []
                              ).join("\n"),
                          },

                          back: {
                            ...card.back,

                            phone:
                              (
                                card.back
                                  ?.phone || []
                              ).join("\n"),

                            email:
                              (
                                card.back
                                  ?.email || []
                              ).join("\n"),

                            qrData:
                              (
                                card.back
                                  ?.qrData || []
                              ).join("\n"),
                          },
                        });
                      }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) =>
                        deleteCard(
                          card._id,
                          e
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      {deletingId ===
                      card._id ? (
                        <span className="text-[10px] font-bold">
                          ...
                        </span>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* CARD */}

                <div
                  className="relative w-full h-[360px] cursor-pointer"
                  style={{
                    perspective: "1000px",
                  }}
                  onClick={() =>
                    toggleFlip(card._id)
                  }
                >

                  <div
                    className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] hover:-translate-y-1 hover:shadow-2xl"
                    style={{
                      transformStyle:
                        "preserve-3d",

                      transform:
                        isFlipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                    }}
                  >

                    {/* FRONT */}

                    <div
                      className="absolute w-full h-full bg-white border border-gray-200 border-t-0 rounded-b-2xl p-5 flex flex-col"
                      style={{
                        backfaceVisibility:
                          "hidden",
                      }}
                    >
                      {renderSideData(
                        card.front,
                        card
                      )}
                    </div>

                    {/* BACK */}

                    <div
                      className="absolute w-full h-full bg-[#f8f9fa] border border-gray-200 border-t-0 rounded-b-2xl p-5 flex flex-col"
                      style={{
                        backfaceVisibility:
                          "hidden",

                        transform:
                          "rotateY(180deg)",
                      }}
                    >
                      {renderSideData(
                        card.back,
                        card
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT MODAL */}

      {editingCard && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">

            <div className="relative w-full max-w-7xl h-[92vh] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">

            {/* TOP HEADER */}

            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-5 flex items-center justify-between">

                <div>
                <h2 className="text-3xl font-black tracking-tight text-[#232f3e]">
                    Edit Business Card
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Update contact data, QR payloads, and metadata.
                </p>
                </div>

                <button
                onClick={() =>
                    setEditingCard(null)
                }
                className="w-11 h-11 rounded-2xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all flex items-center justify-center text-xl text-gray-400"
                >
                ✕
                </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto h-[calc(92vh-90px)] px-8 py-8">

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* FRONT */}

                <EditSide
                    title="Front Side"
                    accent="from-[#232f3e] to-[#37475a]"
                    data={editingCard.front}
                    onChange={(newData: any) =>
                    setEditingCard({
                        ...editingCard,
                        front: newData,
                    })
                    }
                />

                {/* BACK */}

                <EditSide
                    title="Back Side"
                    accent="from-[#ff9900] to-[#ffb84d]"
                    data={editingCard.back}
                    onChange={(newData: any) =>
                    setEditingCard({
                        ...editingCard,
                        back: newData,
                    })
                    }
                />
                </div>

                {/* CATEGORY + SECURITY */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">

                {/* CATEGORY */}

                <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">

                    <div className="mb-5">
                    <h3 className="text-lg font-black text-[#232f3e]">
                        Classification
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        Cards outside valid categories automatically become Uncategorized.
                    </p>
                    </div>

                    <select
                    value={
                        editingCard.category ||
                        "Uncategorized"
                    }
                    onChange={(e) =>
                        setEditingCard({
                        ...editingCard,

                        category:
                            e.target.value,
                        })
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#232f3e]"
                    >
                    {VALID_CATEGORIES.map(
                        (cat) => (
                        <option
                            key={cat}
                            value={cat}
                        >
                            {cat}
                        </option>
                        )
                    )}
                    </select>
                </div>

                {/* SECURITY */}

                <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">

                    <div className="mb-5">
                    <h3 className="text-lg font-black text-[#232f3e]">
                        Admin Verification
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        Type in the password to save the edit.
                    </p>
                    </div>

                    <input
                    type="password"
                    value={editPassword}
                    onChange={(e) =>
                        setEditPassword(
                        e.target.value
                        )
                    }
                    placeholder="Admin password"
                    className="w-full rounded-2xl border border-orange-200 bg-white px-5 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                </div>

                {/* ACTION BAR */}

                <div className="sticky bottom-0 mt-10 pt-6 bg-white border-t border-gray-200 flex items-center justify-between">

                <div className="text-sm text-gray-400 font-medium">
                    Changes are applied instantly after saving.
                </div>

                <div className="flex items-center gap-3">

                    <button
                    onClick={() =>
                        setEditingCard(null)
                    }
                    className="px-6 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 font-semibold transition-all"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={saveEdit}
                    disabled={savingEdit}
                    className="min-w-[180px] px-6 py-3 rounded-2xl bg-[#232f3e] hover:bg-[#1b2530] text-white font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                    {savingEdit
                        ? "Saving Changes..."
                        : "Save Changes"}
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        )}
    </main>
  );
}

function EditSide({
  title,
  data,
  onChange,
  accent,
}: any) {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white">

      {/* HEADER */}

      <div
        className={`bg-gradient-to-r ${accent} px-6 py-5 text-white`}
      >
        <h3 className="text-xl font-black tracking-wide">
          {title}
        </h3>

        <p className="text-sm text-white/70 mt-1">
          Multiple values should be entered one per line.
        </p>
      </div>

      {/* FORM */}

      <div className="p-6 space-y-5">

        <Field
          label="Name"
          value={data?.name}
          onChange={(v: string) =>
            onChange({
              ...data,
              name: v,
            })
          }
        />

        <Field
          label="Company"
          value={data?.company}
          onChange={(v: string) =>
            onChange({
              ...data,
              company: v,
            })
          }
        />

        <Field
          label="Title"
          value={data?.title}
          onChange={(v: string) =>
            onChange({
              ...data,
              title: v,
            })
          }
        />

        <TextAreaField
          label="Phone Numbers"
          placeholder="One phone number per line"
          value={data?.phone}
          onChange={(v: string) =>
            onChange({
              ...data,
              phone: v,
            })
          }
        />

        <TextAreaField
          label="Emails"
          placeholder="One email per line"
          value={data?.email}
          onChange={(v: string) =>
            onChange({
              ...data,
              email: v,
            })
          }
        />

        <Field
          label="Website"
          value={data?.website}
          onChange={(v: string) =>
            onChange({
              ...data,
              website: v,
            })
          }
        />

        <TextAreaField
          label="Address"
          placeholder="Full address"
          rows={4}
          value={data?.address}
          onChange={(v: string) =>
            onChange({
              ...data,
              address: v,
            })
          }
        />

        <TextAreaField
          label="QR Payloads"
          placeholder={`One QR payload per line

Examples:
https://wechat.com/abc
BEGIN:VCARD...
https://company.com`}
          rows={8}
          value={data?.qrData}
          onChange={(v: string) =>
            onChange({
              ...data,
              qrData: v,
            })
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </label>

      <input
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#232f3e]"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-gray-400">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#232f3e] resize-none"
      />
    </div>
  );
}

function renderSideData(
  data: any,
  card: any
) {
  const hasContent =
    data &&
    (data.name ||
      data.title ||
      data.company ||
      data.phone?.length > 0 ||
      data.email?.length > 0 ||
      data.website ||
      data.address ||
      data.qrData?.length > 0);

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center text-gray-300 font-black text-xs uppercase tracking-widest">
        No data recorded
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}

      {(data.name ||
        data.title ||
        data.company) && (
        <div className="mb-3 pb-3 border-b border-gray-200 shrink-0">

          <h2 className="text-2xl font-black text-[#232f3e] leading-tight">
            {data.name ||
              data.company ||
              "Unnamed Contact"}
          </h2>

          {data.title && (
            <p className="text-sm font-bold text-[#ff9900] truncate">
              {data.title}
            </p>
          )}

          {data.company && (
            <p className="text-xs font-bold text-gray-500 truncate uppercase tracking-wide">
              {data.company}
            </p>
          )}
        </div>
      )}

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">

        {data.phone?.length > 0 && (
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

            <div className="flex flex-col">
              {data.phone.map(
                (
                  phone: string,
                  i: number
                ) => (
                  <a
                    key={i}
                    href={`tel:${phone}`}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    className="font-bold text-sm text-gray-700 hover:text-[#ff9900]"
                  >
                    {phone}
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {data.email?.length > 0 && (
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

            <div className="flex flex-col">
              {data.email.map(
                (
                  email: string,
                  i: number
                ) => (
                  <a
                    key={i}
                    href={`mailto:${email}`}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    className="font-bold text-sm text-gray-700 hover:text-[#ff9900] break-all"
                  >
                    {email}
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {data.website && (
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

            <a
              href={
                data.website.startsWith(
                  "http"
                )
                  ? data.website
                  : `https://${data.website}`
              }
              target="_blank"
              rel="noreferrer"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="font-bold text-sm text-[#00a8e1] hover:underline break-all"
            >
              {data.website}
            </a>
          </div>
        )}

        {data.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                data.address
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="font-medium text-xs text-gray-700 leading-tight hover:text-[#ff9900]"
            >
              {data.address}
            </a>
          </div>
        )}

        {data.qrData?.length > 0 && (
          <div className="flex items-start gap-2">
            <QrCode className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />

            <div className="flex flex-col gap-2 w-full">
              {data.qrData.map(
                (
                  qr: string,
                  i: number
                ) => (
                  <div
                    key={i}
                    className="text-xs break-all bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium shadow-sm"
                  >
                    {qr}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="pt-5 flex items-end justify-between gap-3">

        {card.isTranslated ? (
          <span className="max-w-[70%] truncate bg-orange-500/10 text-orange-500 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-orange-500/20 flex items-center gap-1">
            <Languages className="w-3 h-3 shrink-0" />

            translated from{" "}
            {card.originalLanguage}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            English
          </span>
        )}

        <span className="shrink-0 text-[10px] border border-current/10 rounded-full px-3 py-1 uppercase tracking-wider font-semibold">
          {card.category ||
            "Uncategorized"}
        </span>
      </div>
    </div>
  );
}

function splitLines(value: any) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  return value
    .split("\n")
    .map((x: string) => x.trim())
    .filter(Boolean);
}