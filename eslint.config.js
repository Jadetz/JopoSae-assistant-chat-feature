// ============================================================
// Konfigurasi ESLint — project Express, ESM ("type": "module")
//
// Nama file WAJIB: eslint.config.js  (di akar project)
// Ditulis gaya ESM (import/export) karena package.json punya
// "type": "module" — kalau ditulis pakai require(), ESLint error.
// ============================================================

import js from "@eslint/js";
import globals from "globals";
import promise from "eslint-plugin-promise";

export default [
  // [1] Paket aturan dasar resmi ESLint.
  js.configs.recommended,

  // [2] Folder yang nggak diperiksa.
  { ignores: ["node_modules/**", "dist/**", "build/**"] },

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module", // pakai import, bukan require
      globals: { ...globals.node }, // console, process, Buffer dianggap wajar
    },

    plugins: { promise },

    // [3] Sengaja CUMA aturan penangkap bug. Nggak ada aturan gaya
    //     penulisan, karena ini kode yang udah jalan dan gaya itu
    //     urusan selera — bukan urusan benar/salah.
    rules: {
      "no-undef": "error", // nama variabel/fungsi yang nggak ada
      eqeqeq: ["error", "always"], // paksa === , larang ==
      "promise/catch-or-return": "error", // .then() wajib ada .catch()

      // [4] Dua pengecualian khusus Express. Tanpa ini, konfigurasi
      //     bakal nyemprot peringatan palsu di sepanjang project:
      //     - next  : middleware error WAJIB 4 parameter walau next nggak dipakai
      //     - _     : penanda umum "parameter ini sengaja nggak dipakai"
      //     - caughtErrors: "none" → catch (e) yang e-nya nggak dipakai dibiarkan
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_|^next$",
          caughtErrors: "none",
        },
      ],
    },
  },
];
