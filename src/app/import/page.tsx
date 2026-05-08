"use client";

import { useMemo, useState } from "react";

import * as XLSX from "xlsx";

import Papa from "papaparse";

import Link from "next/link";

import {
  Upload,
  CheckSquare,
  Square,
  Save,
  Pencil,
} from "lucide-react";

type RowType = {
  id: string;

  selected: boolean;

  name: string;

  company: string;

  title: string;

  phone: string;

  email: string;

  website: string;

  address: string;

  category: string;
};

export default function ImportPage() {
  const [rows, setRows] = useState<
    RowType[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [editingRow, setEditingRow] =
    useState<string | null>(null);

  async function handleFile(
    file: File
  ) {
    const extension =
      file.name.split(".").pop();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,

        complete(results) {
          const parsed =
            results.data.map(
              (row: any, index) => ({
                id: crypto.randomUUID(),

                selected: true,

                name:
                  row.name || "",

                company:
                  row.company || "",

                title:
                  row.title || "",

                phone:
                  row.phone || "",

                email:
                  row.email || "",

                website:
                  row.website || "",

                address:
                  row.address || "",

                category:
                  row.category ||
                  "Uncategorized",
              })
            );

          setRows(parsed);
        },
      });
    }

    else {
      const buffer =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(buffer);

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const json =
        XLSX.utils.sheet_to_json(sheet);

      const parsed = json.map(
        (row: any) => ({
          id: crypto.randomUUID(),

          selected: true,

          name:
            row.name || "",

          company:
            row.company || "",

          title:
            row.title || "",

          phone:
            row.phone || "",

          email:
            row.email || "",

          website:
            row.website || "",

          address:
            row.address || "",

          category:
            row.category ||
            "Uncategorized",
        })
      );

      setRows(parsed);
    }
  }

  function updateRow(
    id: string,
    field: keyof RowType,
    value: string
  ) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  }

  function toggleRow(id: string) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              selected:
                !row.selected,
            }
          : row
      )
    );
  }

  async function importRows(
    onlySelected = false
  ) {
    try {
      setLoading(true);

      const payload = rows.filter(
        (row) =>
          onlySelected
            ? row.selected
            : true
      );

      const res = await fetch(
        "/api/import",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            rows: payload,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      alert(
        `${data.inserted} cards imported`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const selectedCount = useMemo(
    () =>
      rows.filter(
        (r) => r.selected
      ).length,
    [rows]
  );

  return (
    <main className="min-h-screen bg-[#f6f7f9]">

      {/* NAV */}

      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black text-[#232f3e]">
              Bulk Import
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              CSV / Excel ingestion
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

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* UPLOAD */}

        <label className="block border-2 border-dashed border-gray-300 bg-white rounded-3xl p-16 text-center cursor-pointer hover:border-[#ff9900] transition-all">

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                handleFile(file);
              }
            }}
          />

          <div className="flex flex-col items-center gap-4">

            <div className="w-20 h-20 rounded-3xl bg-[#232f3e] text-white flex items-center justify-center">
              <Upload className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-[#232f3e]">
                Upload CSV or Excel
              </h2>

              <p className="text-gray-500 mt-2">
                Review before importing.
              </p>
            </div>
          </div>
        </label>

        {/* ACTIONS */}

        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between">

              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                {rows.length} Rows •{" "}
                {selectedCount} Selected
              </div>

              <div className="flex items-center gap-3">

                <button
                  disabled={loading}
                  onClick={() =>
                    importRows(true)
                  }
                  className="bg-[#ff9900] text-[#232f3e] px-5 py-3 rounded-2xl font-black flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />

                  Import Selected
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    importRows(false)
                  }
                  className="bg-[#232f3e] text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />

                  Import All
                </button>
              </div>
            </div>

            {/* TABLE */}

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">

              <div className="overflow-auto">

                <table className="w-full min-w-[1400px]">

                  <thead className="bg-[#232f3e] text-white">

                    <tr className="text-left text-sm uppercase tracking-widest">

                      <th className="p-4">
                        Select
                      </th>

                      <th className="p-4">
                        Name
                      </th>

                      <th className="p-4">
                        Company
                      </th>

                      <th className="p-4">
                        Title
                      </th>

                      <th className="p-4">
                        Phone
                      </th>

                      <th className="p-4">
                        Email
                      </th>

                      <th className="p-4">
                        Website
                      </th>

                      <th className="p-4">
                        Address
                      </th>

                      <th className="p-4">
                        Category
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        <td className="p-4">

                          <button
                            onClick={() =>
                              toggleRow(
                                row.id
                              )
                            }
                          >
                            {row.selected ? (
                              <CheckSquare className="w-5 h-5 text-[#ff9900]" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300" />
                            )}
                          </button>
                        </td>

                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              ![
                                "id",
                                "selected",
                              ].includes(
                                key
                              )
                          )
                          .map(
                            (
                              [
                                key,
                                value,
                              ]
                            ) => (
                              <td
                                key={key}
                                className="p-2"
                              >
                                <input
                                  value={
                                    value as string
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateRow(
                                      row.id,
                                      key as keyof RowType,
                                      e.target
                                        .value
                                    )
                                  }
                                  className="w-full min-w-[180px] rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                                />
                              </td>
                            )
                          )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}