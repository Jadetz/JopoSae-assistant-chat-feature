import {
  requestConsultation,
  getConsultations,
  getConsultationById,
  requestUpdateConsultationStatus,
} from "../services/consultationService.js";

const handleCreateConsultation = async (req, res) => {
  console.log("POST consultation controller terpanggil");
  //   console.log("[Consultation Controller] Request masuk");
  //   console.log("[Consultation Controller] Body:", req.body);
  //   console.log("Content-Type:", req.headers["content-type"]);
  //   console.log("Request body:", req.body);
  try {
    const { conversationId, serviceKey } = req.body ?? {};

    // Validasi input
    const numericConversationId = Number(conversationId);
    const isValidConversationId =
      Number.isInteger(numericConversationId) && numericConversationId > 0;
    const isValidServiceKey =
      typeof serviceKey === "string" && serviceKey.trim() !== "";
    if (!isValidConversationId || !isValidServiceKey) {
      return res.status(400).json({
        success: false,
        message:
          "Mohon periksa kembali data Anda: conversationId harus berupa bilangan bulat positif dan serviceKey wajib diisi.",
      });
    }
    console.log("[Consultation Controller] Memanggil Service");

    const result = await requestConsultation(
      numericConversationId,
      serviceKey.trim(),
    );

    console.log("[Consultation Controller] Hasil Service:", result);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("[Consultation Controller] Error:", error);
    console.error("[Consultation Controller] Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Mohon maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    });
  }
};

const handleGetConsultations = async (req, res) => {
  console.log("GET consultation controller terpanggil");
  try {
    const { status } = req.query;
    const result = await getConsultations(status);
    if (result.success === false) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get consultations error", error);
    return res.status(500).json({
      success: false,
      message: "Mohon maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    });
  }
};

const handleGetConsultationById = async (req, res) => {
  console.log("Get konsultasi by id terpanggil");
  try {
    const { id } = req.params;
    // console.log(`id ditemukan: ${id}`);
    const result = await getConsultationById(id);
    if (result.statusCode === 400) {
      return res.status(400).json(result);
    }
    if (result.statusCode === 404) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get consultation by id error", error);
    return res.status(500).json({
      success: false,
      message: "Mohon maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    });
  }
};

const handleUpdateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};
    const result = await requestUpdateConsultationStatus(id, status);
    if (result.statusCode === 400) {
      return res.status(400).json(result);
    }
    if (result.statusCode === 404) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update status consultation error", error);
    return res.status(500).json({
      success: false,
      message: "Mohon maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    });
  }
};
export {
  handleCreateConsultation,
  handleGetConsultations,
  handleGetConsultationById,
  handleUpdateConsultationStatus,
};
