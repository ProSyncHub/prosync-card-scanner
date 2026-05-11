"use client";

import { useMemo, useState } from "react";

import * as XLSX from "xlsx";

import Papa from "papaparse";

import Link from "next/link";

import { useDropzone } from "react-dropzone";

import {
  Upload,
  CheckSquare,
  Square,
  Save,
  Trash2,
  Plus,
  FileSpreadsheet,
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
  const [rows, setRows] =
    useState<RowType[]>([]);

  const [loading, setLoading] =
    useState(false);

  function findValue(
    row: any,
    possibleKeys: string[]
  ) {
    const normalizedKeys =
      Object.keys(row).reduce(
        (acc: any, key) => {
          acc[
            key
              .toLowerCase()
              .trim()
          ] = row[key];

          return acc;
        },
        {}
      );

    for (const key of possibleKeys) {
      const value =
        normalizedKeys[
          key.toLowerCase()
        ];

      if (value !== undefined) {
        return String(value);
      }
    }

    return "";
  }

  function mapRows(data: any[]) {
    return data.map((row: any) => ({
      id: crypto.randomUUID(),

      selected: true,

      name: findValue(row, [
        "name",
        "full name",
        "person",
      ]),

      company: findValue(row, [
        "company",
        "company name",
        "organization",
      ]),

      title: findValue(row, [
        "title",
        "designation",
        "position",
        "role",
      ]),

      phone: findValue(row, [
        "phone",
        "mobile",
        "contact",
        "contact number",
        "telephone",
      ]),

      email: findValue(row, [
        "email",
        "e-mail",
        "mail",
      ]),

      website: findValue(row, [
        "website",
        "web",
        "url",
      ]),

      address: findValue(row, [
        "address",
        "location",
        "office address",
      ]),

      category:
        findValue(row, [
          "category",
        ]) ||
        "Uncategorized",
    }));
  }

  async function handleFile(
    file: File
  ) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,

        complete(
          results: Papa.ParseResult<any>
        ) {
          const parsed =
            mapRows(
              results.data
            );

          setRows(parsed);
        },
      });
    } else {
      const buffer =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(buffer);

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const json =
        XLSX.utils.sheet_to_json(
          sheet
        );

      const parsed =
        mapRows(json);

      setRows(parsed);
    }
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      "text/csv": [".csv"],

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        [".xlsx"],

      "application/vnd.ms-excel":
        [".xls"],
    },

    multiple: false,

    onDrop: (
      acceptedFiles
    ) => {
      if (acceptedFiles[0]) {
        handleFile(
          acceptedFiles[0]
        );
      }
    },
  });

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

  function toggleAll() {
    const allSelected =
      rows.every(
        (row) => row.selected
      );

    setRows((prev) =>
      prev.map((row) => ({
        ...row,

        selected:
          !allSelected,
      }))
    );
  }

  function addEmptyRow() {
    setRows((prev) => [
      {
        id: crypto.randomUUID(),

        selected: true,

        name: "",

        company: "",

        title: "",

        phone: "",

        email: "",

        website: "",

        address: "",

        category:
          "Uncategorized",
      },

      ...prev,
    ]);
  }

  function deleteRow(id: string) {
    setRows((prev) =>
      prev.filter(
        (row) => row.id !== id
      )
    );
  }

  async function importRows(
    onlySelected = false
  ) {
    try {
      setLoading(true);

      const payload =
        rows.filter((row) =>
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

      const data =
        await res.json();

      alert(
        `${data.inserted} cards imported`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const selectedCount =
    useMemo(
      () =>
        rows.filter(
          (r) => r.selected
        ).length,
      [rows]
    );

  return (
    <main className="h-screen overflow-hidden bg-[#f6f7f9] flex flex-col">

      {/* NAVBAR */}

      <div className="bg-white border-b border-gray-200">

        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-black text-[#232f3e]">
              Bulk Import
            </h1>

            <p className="text-sm text-gray-500">
              Smart CSV / Excel ingestion
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

      {/* TOP SECTION */}

      <div className="max-w-[1800px] w-full mx-auto px-6 pt-5 pb-4 grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4">

        {/* FORMAT */}

        <div className="bg-[#232f3e] text-white rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">

              <FileSpreadsheet className="w-6 h-6 text-[#ff9900]" />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Supported Columns
              </h2>

              <p className="text-xs text-white/60 mt-1">
                Flexible mapping
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">

            <div className="flex justify-between gap-4">
              <span className="font-bold">
                Name
              </span>

              <span className="text-white/70 text-right">
                name, full name
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-bold">
                Phone
              </span>

              <span className="text-white/70 text-right">
                phone, mobile,
                contact
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-bold">
                Email
              </span>

              <span className="text-white/70 text-right">
                email, e-mail
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="font-bold">
                Company
              </span>

              <span className="text-white/70 text-right">
                company,
                organization
              </span>
            </div>
          </div>
        </div>

        {/* DROPZONE */}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl px-8 py-6 flex items-center justify-center cursor-pointer transition-all ${
            isDragActive
              ? "border-[#ff9900] bg-orange-50"
              : "border-gray-300 bg-white hover:border-[#ff9900]"
          }`}
        >

          <input
            {...getInputProps()}
          />

          <div className="flex items-center gap-5">

            <div className="w-16 h-16 rounded-3xl bg-[#232f3e] text-white flex items-center justify-center">

              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#232f3e]">
                Drag & Drop Files
              </h2>

              <p className="text-gray-500 mt-1">
                CSV / XLSX supported
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}

      <div className="max-w-[1800px] w-full mx-auto px-6 pb-6 flex-1 flex flex-col min-h-0">

        {rows.length > 0 && (
          <>
            {/* ACTION BAR */}

            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">

              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">

                {rows.length} Rows •{" "}
                {selectedCount} Selected
              </div>

              <div className="flex items-center gap-3 flex-wrap">

                <button
                  onClick={
                    addEmptyRow
                  }
                  className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl font-black flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />

                  Add Row
                </button>

                <button
                  onClick={
                    toggleAll
                  }
                  className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl font-black flex items-center gap-2 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />

                  Select All
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    importRows(true)
                  }
                  className="bg-[#ff9900] text-[#232f3e] px-4 py-2.5 rounded-2xl font-black flex items-center gap-2 text-sm"
                >
                  <CheckSquare className="w-4 h-4" />

                  Import Selected
                </button>

                <button
                  disabled={loading}
                  onClick={() =>
                    importRows(false)
                  }
                  className="bg-[#232f3e] text-white px-4 py-2.5 rounded-2xl font-black flex items-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />

                  Import All
                </button>
              </div>
            </div>

            {/* TABLE */}

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden flex-1 min-h-0">

              <div className="overflow-auto h-full">

                <table className="w-full min-w-[1600px]">

                  <thead className="bg-[#232f3e] text-white sticky top-0 z-10">

                    <tr className="text-left text-xs uppercase tracking-widest">

                      <th className="p-3">
                        Select
                      </th>

                      <th className="p-3">
                        Name
                      </th>

                      <th className="p-3">
                        Company
                      </th>

                      <th className="p-3">
                        Title
                      </th>

                      <th className="p-3">
                        Phone
                      </th>

                      <th className="p-3">
                        Email
                      </th>

                      <th className="p-3">
                        Website
                      </th>

                      <th className="p-3">
                        Address
                      </th>

                      <th className="p-3">
                        Category
                      </th>

                      <th className="p-3">
                        Delete
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {rows.map(
                      (row) => (
                        <tr
                          key={row.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >

                          <td className="p-2">

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

                          {Object.entries(
                            row
                          )
                            .filter(
                              (
                                [
                                  key,
                                ]
                              ) =>
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
                                  key={
                                    key
                                  }
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
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    className="w-full min-w-[160px] rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#232f3e]"
                                  />
                                </td>
                              )
                            )}

                          <td className="p-2">

                            <button
                              onClick={() =>
                                deleteRow(
                                  row.id
                                )
                              }
                              className="w-9 h-9 rounded-xl bg-red-100 text-red-500 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
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