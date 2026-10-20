# JopoSae WhatsApp Assistant — Backend API

## Introduction

**JopoSae** ([joposae.com](https://joposae.com)) adalah platform digital yang menyediakan beberapa layanan, seperti Manajemen Sekolah, Layanan PDAM, WiFi dan Internet, serta PPOB.

**JopoSae WhatsApp Assistant** adalah fitur chatbot WhatsApp untuk JopoSae. Tujuannya:
- Membantu pelanggan mengenali layanan JopoSae.
- Menampilkan informasi dan FAQ sesuai layanan yang dipilih.
- Mengarahkan pelanggan ke admin manusia saat butuh konsultasi lebih lanjut.
- Mencatat permintaan konsultasi di backend untuk pelacakan.

Repository ini berisi **backend API** yang menjadi sumber data untuk chatbot tersebut.

> **Status:** Backend API sedang dikembangkan. Integrasi WhatsApp (Baileys) belum selesai.

---

## Alur bisnis

1. Pelanggan mengirim pesan ke nomor WhatsApp bot.
2. Bot menyambut pelanggan dan menampilkan daftar layanan.
3. Pelanggan memilih layanan, misalnya **Manajemen Sekolah**.
4. Bot menampilkan informasi atau FAQ yang relevan.
5. Jika pelanggan ingin konsultasi, bot menyiapkan tautan WhatsApp admin (`wa.me`) dengan pesan awal.
6. Pelanggan membuka tautan dan **menekan tombol kirim sendiri** di WhatsApp.
7. Permintaan konsultasi dicatat di backend.

Contoh kalimat handoff:

> Baik, Anda akan diarahkan ke admin JopoSae untuk konsultasi mengenai Manajemen Sekolah.  
> Tekan tautan berikut untuk membuka WhatsApp admin. Pesan konsultasi sudah disiapkan dan bisa Anda kirim setelah WhatsApp terbuka.  
> Hubungi Admin JopoSae: `https://wa.me/NOMOR_ADMIN?text=...`

Nomor admin masih placeholder untuk prototipe.

---

## Tech stack

- Node.js dengan ES Modules (`"type": "module"`)
- Express — HTTP API
- PostgreSQL — database
- `pg` (`Pool`) — koneksi PostgreSQL
- `dotenv` — konfigurasi environment
- `cors`
- Baileys — rencana integrasi WhatsApp

---

## Arsitektur

Pemisahan tanggung jawab:
- **Routes:** memetakan HTTP method/path ke controller.
- **Controllers:** membaca `req.params`, `req.query`, `req.body`, memanggil service, dan membentuk HTTP response.
- **Services:** validasi input dan aturan bisnis.
- **Repositories:** query PostgreSQL dan akses data.
- **`db.js`:** konfigurasi pool PostgreSQL.
- **`app.js`:** middleware dan registrasi routes.
- **`server.js`:** menyalakan server.

```text
Client
  → Express route
    → Controller
      → Service
        → Repository
          → PostgreSQL
```

---

## Skema database

### `contacts`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `whatsapp_number` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` |
| `display_name` | `VARCHAR(100)` | Nullable |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |

### `conversations`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `contact_id` | `INTEGER` | `NOT NULL`, FK ke `contacts(id)` |
| `status` | enum `conversation_status` | `NOT NULL DEFAULT 'active'` |
| `current_state` | `VARCHAR(255)` | `NOT NULL DEFAULT 'main_menu'` |
| `started_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `ended_at` | `TIMESTAMP` | Nullable |

Nilai enum `conversation_status`: `active`, `closed`, `handed_off`.

### `messages`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `conversation_id` | `INTEGER` | `NOT NULL`, FK ke `conversations(id)` |
| `direction` | enum `message_direction` | `NOT NULL` |
| `message_type` | enum `message_type` | `NOT NULL DEFAULT 'text'` |
| `body` | `TEXT` | Nullable |
| `provider_message_id` | `VARCHAR(255)` | Nullable |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Nilai enum:
- `message_direction`: `inbound`, `outbound`
- `message_type`: `text`, `image`, `interactive`, `unknown`

### `services`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `service_key` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` |
| `name` | `VARCHAR(100)` | `NOT NULL` |
| `description` | `TEXT` | Nullable |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` |

### `faqs`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `service_id` | `INTEGER` | Nullable, FK ke `services(id)` — null untuk FAQ umum |
| `question` | `TEXT` | `NOT NULL` |
| `answer` | `TEXT` | `NOT NULL` |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |

### `consultation_requests`
| Kolom | Tipe | Aturan / catatan |
|---|---|---|
| `id` | `SERIAL` | Primary key |
| `conversation_id` | `INTEGER` | `NOT NULL`, FK ke `conversations(id)` |
| `service_id` | `INTEGER` | Nullable, FK ke `services(id)` |
| `topic` | `TEXT` | Nullable |
| `status` | enum `consultation_status` | `NOT NULL DEFAULT 'pending'` |
| `created_at` | `TIMESTAMP` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Nilai enum `consultation_status`: `pending`, `link_generated`, `closed`, `cancelled`.
