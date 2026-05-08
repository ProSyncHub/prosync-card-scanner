"use client";

import { useState } from "react";

import {
  Upload,
  Loader2,
  Camera,
  ScanLine,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";

import { useDropzone } from "react-dropzone";

import jsQR from "jsqr";

import Tesseract from "tesseract.js";

import Link from "next/link";

type ScanResult = any;

export default function ScannerPage() {
  const [frontImage, setFrontImage] =
    useState<string | null>(null);

  const [backImage, setBackImage] =
    useState<string | null>(null);

  const [frontFile, setFrontFile] =
    useState<File | null>(null);

  const [backFile, setBackFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<ScanResult | null>(null);

  async function extractQR(
    file: File
  ) {
    const imageUrl =
      URL.createObjectURL(file);

    const img =
      document.createElement("img");

    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx?.drawImage(img, 0, 0);

    const imageData =
      ctx?.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const qrResults: string[] = [];

    if (imageData) {
      const qr = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      );

      if (qr?.data) {
        qrResults.push(qr.data);
      }
    }

    return qrResults;
  }

  async function extractOCR(
    file: File
  ) {
    const {
      data: { text },
    } = await Tesseract.recognize(
      file,
      "eng+chi_sim+jpn+kor"
    );

    return text;
  }

  async function processCards() {
    if (!frontFile) return;

    setLoading(true);

    try {
      const frontQR =
        await extractQR(frontFile);

      const frontText =
        await extractOCR(frontFile);

      let backQR: string[] = [];

      let backText = "";

      if (backFile) {
        backQR =
          await extractQR(backFile);

        backText =
          await extractOCR(backFile);
      }

      const formData =
        new FormData();

      formData.append(
        "frontFile",
        frontFile
      );

      if (backFile) {
        formData.append(
          "backFile",
          backFile
        );
      }

      formData.append(
        "frontText",
        frontText
      );

      formData.append(
        "backText",
        backText
      );

      formData.append(
        "frontQR",
        JSON.stringify(frontQR)
      );

      formData.append(
        "backQR",
        JSON.stringify(backQR)
      );

      const res = await fetch(
        "/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /* FRONT DROPZONE */

  const {
    getRootProps:
      getFrontRootProps,

    getInputProps:
      getFrontInputProps,
  } = useDropzone({
    accept: {
      "image/*": [],
    },

    multiple: false,

    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFrontFile(
          acceptedFiles[0]
        );

        const preview =
          URL.createObjectURL(
            acceptedFiles[0]
          );

        setFrontImage(preview);
      }
    },
  });

  /* BACK DROPZONE */

  const {
    getRootProps:
      getBackRootProps,

    getInputProps:
      getBackInputProps,
  } = useDropzone({
    accept: {
      "image/*": [],
    },

    multiple: false,

    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setBackFile(
          acceptedFiles[0]
        );

        const preview =
          URL.createObjectURL(
            acceptedFiles[0]
          );

        setBackImage(preview);
      }
    },
  });

  return (
    <main className="min-h-screen bg-[#f6f7f9]">

      {/* NAVBAR */}

      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-black text-[#232f3e]">
              Business Card Scanner
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              OCR + QR + AI Extraction
            </p>
          </div>

          <Link
            href="/dashboard"
            className="bg-[#232f3e] text-white px-5 py-3 rounded-2xl font-bold hover:bg-black transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* BODY */}

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* UPLOAD GRID */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* FRONT */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">

            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] p-6 text-white">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ScanLine className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Front Side
                  </h2>

                  <p className="text-sm text-white/70 mt-1">
                    Upload or capture the front side.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">

              <div
                    {...getFrontRootProps()}
                    className={`relative border-2 border-dashed rounded-3xl overflow-hidden transition-all ${
                        frontImage
                        ? "border-green-400 bg-black"
                        : "border-gray-300 bg-gray-50 hover:border-[#ff9900] hover:bg-orange-50/30"
                    }`}
                    >

                    <input
                        {...getFrontInputProps()}
                        capture="environment"
                    />

                    {frontImage ? (
                        <div className="relative group">

                        <img
                            src={frontImage}
                            alt="front"
                            className="w-full h-[500px] object-contain bg-black"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">

                            <div className="bg-white text-[#232f3e] px-5 py-3 rounded-2xl font-black shadow-2xl">
                            Replace Front Image
                            </div>
                        </div>

                        <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-full shadow-lg flex items-center gap-2">

                            <CheckCircle2 className="w-4 h-4" />

                            Front Uploaded
                        </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">

                        <div className="flex flex-col items-center gap-5">

                            <div className="flex items-center gap-4">

                            <div className="w-16 h-16 rounded-3xl bg-[#232f3e] text-white flex items-center justify-center shadow-lg">
                                <Upload className="w-8 h-8" />
                            </div>

                            <div className="w-16 h-16 rounded-3xl bg-[#ff9900] text-[#232f3e] flex items-center justify-center shadow-lg">
                                <Camera className="w-8 h-8" />
                            </div>
                            </div>

                            <div>
                            <h3 className="text-2xl font-black text-[#232f3e]">
                                Upload Front Card
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Clear photo of the front side.
                            </p>
                            </div>
                        </div>
                        </div>
                    )}
                    </div>
            </div>
          </div>

          {/* BACK */}

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">

            <div className="bg-gradient-to-r from-[#ff9900] to-[#ffb84d] p-6 text-[#232f3e]">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Back Side
                  </h2>

                  <p className="text-sm text-[#232f3e]/70 mt-1">
                    Optional backside upload.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">

              <div
                {...getBackRootProps()}
                className={`relative border-2 border-dashed rounded-3xl overflow-hidden transition-all ${
                    backImage
                    ? "border-green-400 bg-black"
                    : "border-gray-300 bg-gray-50 hover:border-[#232f3e] hover:bg-gray-100"
                }`}
                >

                <input
                    {...getBackInputProps()}
                    capture="environment"
                />

                {backImage ? (
                    <div className="relative group">

                    <img
                        src={backImage}
                        alt="back"
                        className="w-full h-[500px] object-contain bg-black"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">

                        <div className="bg-white text-[#232f3e] px-5 py-3 rounded-2xl font-black shadow-2xl">
                        Replace Back Image
                        </div>
                    </div>

                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-full shadow-lg flex items-center gap-2">

                        <CheckCircle2 className="w-4 h-4" />

                        Back Uploaded
                    </div>
                    </div>
                ) : (
                    <div className="p-12 text-center">

                    <div className="flex flex-col items-center gap-5">

                        <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-3xl bg-[#ff9900] text-[#232f3e] flex items-center justify-center shadow-lg">
                            <Upload className="w-8 h-8" />
                        </div>

                        <div className="w-16 h-16 rounded-3xl bg-[#232f3e] text-white flex items-center justify-center shadow-lg">
                            <Camera className="w-8 h-8" />
                        </div>
                        </div>

                        <div>
                        <h3 className="text-2xl font-black text-[#232f3e]">
                            Upload Back Card
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Optional backside image.
                        </p>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </div>
          </div>
        </div>

        {/* PROCESS BUTTON */}

        {frontFile && (
          <div className="flex justify-center">

            <button
              disabled={loading}
              onClick={processCards}
              className="min-w-[260px] h-[64px] rounded-3xl bg-[#232f3e] hover:bg-black text-white font-black tracking-widest uppercase shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />

                  Processing Card...
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" />

                  Process Card
                </>
              )}
            </button>
          </div>
        )}

        {/* RESULT */}

        {result && (
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">

              <div>
                <h2 className="text-3xl font-black text-[#232f3e]">
                  Extraction Result
                </h2>

                <p className="text-gray-500 mt-1">
                  AI-structured contact data.
                </p>
              </div>

              <span className="text-xs bg-[#232f3e] text-white px-4 py-2 rounded-full uppercase font-black tracking-widest">
                {result.category}
              </span>
            </div>

            <div className="p-8">

              <pre className="bg-gray-100 rounded-3xl p-6 overflow-auto text-sm leading-7 border border-gray-200">
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}