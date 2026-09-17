import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  LeadRecord,
  sendLeadAlert,
  sendTestAlert,
  getNotificationConfig,
  saveNotificationConfig,
} from "./serverNotification";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to convert 24000Hz 16-bit Mono PCM base64 to standard WAV base64
function pcmToWav(pcmBase64: string, sampleRate = 24000): string {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]).toString("base64");
}

let genAiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Admin endpoint to permanently persist Leo's official photo to disk
app.post("/api/admin/save-avatar", (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      res.status(400).json({ error: "dataUrl string is required." });
      return;
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: "Invalid data URL format." });
      return;
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const brandDir = path.join(process.cwd(), "public/assets/brand");
    if (!fs.existsSync(brandDir)) {
      fs.mkdirSync(brandDir, { recursive: true });
    }

    // Save as primary brand portrait files
    fs.writeFileSync(path.join(brandDir, "leo_portrait.jpg"), buffer);
    fs.writeFileSync(path.join(brandDir, "leo_portrait.png"), buffer);
    fs.writeFileSync(path.join(brandDir, "leo_real_avatar.jpg"), buffer);
    fs.writeFileSync(path.join(brandDir, "personal_photo.png"), buffer);

    console.log("Official Leo portrait updated and written to disk successfully.");
    res.json({ success: true, message: "Avatar saved to server brand assets." });
  } catch (err: any) {
    console.error("Failed to save avatar to disk:", err);
    res.status(500).json({ error: err.message || "Failed to save avatar." });
  }
});

// Endpoint to verify planner PIN
const PLANNER_PIN = process.env.PLANNER_PIN || "leo131419";

function isAuthorizedPlanner(req: express.Request): boolean {
  const pin = req.headers["x-planner-pin"] || req.query.pin;
  return pin === PLANNER_PIN;
}

app.post("/api/admin/verify-pin", express.json(), (req, res) => {
  const { pin } = req.body;
  if (pin === PLANNER_PIN) {
    res.json({ success: true, message: "规划师密码验证成功" });
  } else {
    res.status(401).json({ success: false, error: "密码错误，请核对后重试" });
  }
});

// Endpoint to save Leo's authentic audio or extract from uploaded video directly
app.post("/api/admin/save-voice", express.json({ limit: "150mb" }), async (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      res.status(400).json({ error: "未提供有效的音视频数据。" });
      return;
    }

    const brandDir = path.join(process.cwd(), "public", "assets", "brand");
    if (!fs.existsSync(brandDir)) {
      fs.mkdirSync(brandDir, { recursive: true });
    }

    const matches = dataUrl.match(/^data:([A-Za-z0-9\-\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : "";
    const base64Data = matches ? matches[2] : dataUrl;
    const buffer = Buffer.from(base64Data, "base64");

    const isVideo =
      mimeType.startsWith("video/") ||
      (filename && /\.(mp4|mov|m4v|webm|mkv)$/i.test(filename)) ||
      Boolean(req.body.isVideo);

    if (isVideo) {
      console.log("Processing uploaded video file to extract Leo authentic audio via ffmpeg...");
      const tempVideo = path.join("/tmp", `leo_input_${Date.now()}.mp4`);
      const tempAudio = path.join("/tmp", `leo_audio_${Date.now()}.mp3`);

      fs.writeFileSync(tempVideo, buffer);

      await new Promise((resolve, reject) => {
        // Extract pristine audio with ffmpeg, stereo, 44.1kHz, high quality MP3
        exec(
          `ffmpeg -y -i "${tempVideo}" -vn -ar 44100 -ac 2 -b:a 192k "${tempAudio}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error("FFmpeg extraction failed:", stderr);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });

      const extractedAudio = fs.readFileSync(tempAudio);
      fs.writeFileSync(path.join(brandDir, "leo_voice.mp3"), extractedAudio);
      fs.writeFileSync(path.join(brandDir, "leo_voice.wav"), extractedAudio);

      // Clean up temp files
      try {
        if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
        if (fs.existsSync(tempAudio)) fs.unlinkSync(tempAudio);
      } catch (_) {}

      console.log("Leo voice extracted from video and saved successfully!");
      res.json({
        success: true,
        extractedFromVideo: true,
        message: "已成功从视频中提取 Leo 规划师纯净人声，并更新为全站原声导读！",
      });
      return;
    }

    // Direct audio file
    fs.writeFileSync(path.join(brandDir, "leo_voice.mp3"), buffer);
    fs.writeFileSync(path.join(brandDir, "leo_voice.wav"), buffer);

    console.log("Leo authentic voice recording saved to brand assets successfully.");
    res.json({ success: true, message: "Leo 助理真实原声已成功保存至专属媒体库。" });
  } catch (err: any) {
    console.error("Failed to save or extract voice recording:", err);
    res.status(500).json({ error: err.message || "Failed to process audio/video." });
  }
});

// Check if Leo's authentic voice recording file exists
app.get("/api/voice-status", (req, res) => {
  const brandDir = path.join(process.cwd(), "public", "assets", "brand");
  const mp3Path = path.join(brandDir, "leo_voice.mp3");
  const wavPath = path.join(brandDir, "leo_voice.wav");

  if (fs.existsSync(mp3Path)) {
    res.json({ hasVoice: true, url: "/assets/brand/leo_voice.mp3" });
  } else if (fs.existsSync(wavPath)) {
    res.json({ hasVoice: true, url: "/assets/brand/leo_voice.wav" });
  } else {
    res.json({ hasVoice: false, url: null });
  }
});

// In-memory cache for synthesized speech to prevent quota exhaustion and provide instant response
const ttsAudioCache = new Map<string, string>();

// TTS Generation Endpoint using gemini-3.1-flash-tts-preview
// Configured for Leo 助理 (Leo's Assistant):
// Professional, calm, warm, articulate, and friendly assistant voice for Malaysian Chinese family insurance planning.
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required for TTS synthesis." });
      return;
    }

    // Check cache first for instant sub-50ms playback and quota saving
    if (ttsAudioCache.has(text)) {
      res.json({
        audioBase64: ttsAudioCache.get(text),
        mimeType: "audio/wav",
        voice: "Leo 助理",
      });
      return;
    }

    // Limit text length to prevent huge latency; if long, take first 1200 characters
    const safeText = text.length > 1200 ? text.slice(0, 1200) + "..." : text;

    // Director's prompt for Leo 助理:
    const prompt = `Audio Profile:
- Persona: Leo 助理 (Official Voice Assistant for Leo Wealth Planning).
- Tone & Demeanor: Calm, intelligent, warm, articulate, reassuring, and professional.
- Articulation: Clear Mandarin with a natural, gentle, conversational rhythm suitable for Malaysian Chinese families. Friendly and structured, guiding users through critical illness protection and financial peace of mind.

#### TRANSCRIPT
${safeText}`;

    const ai = getGenAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Charon" },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      res.status(502).json({ error: "No audio data generated by Gemini TTS." });
      return;
    }

    const wavBase64 = pcmToWav(audioPart.inlineData.data, 24000);
    // Cache result
    ttsAudioCache.set(text, wavBase64);

    res.json({
      audioBase64: wavBase64,
      mimeType: "audio/wav",
      voice: "Leo 助理",
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate speech audio.",
    });
  }
});

// AI Insurance Diagnostic Analysis Endpoint using gemini-3.8-flash
app.post("/api/analyze", async (req, res) => {
  try {
    const {
      monthlyLiving,
      monthlyDebt,
      annualEducation,
      recoveryYears,
      specialCare,
      existingCoverage,
      emergencyFund,
      suggestedCoverage,
      gap,
    } = req.body;

    const ai = getGenAi();
    const prompt = `你是一位客观、资深且充满同理心的家庭财务与健康保障规划顾问。
请根据以下家庭重疾测算数据，提供一段结构清晰、亲切客观的家庭保障体检简评（约 200~300 字）：

【客户家庭数据】：
- 月度基础生活开销：¥${monthlyLiving?.toLocaleString()} 元/月
- 月度刚性债务还款（房贷车贷）：¥${monthlyDebt?.toLocaleString()} 元/月
- 预计大病休养康复周期：${recoveryYears} 年
- 年固定养育及赡养金：¥${annualEducation?.toLocaleString()} 元/年
- 专项康复护理/特殊用药储备：¥${specialCare?.toLocaleString()} 元
- 测算建议重疾总保额：¥${suggestedCoverage?.toLocaleString()} 元
- 目前已有重疾保额：¥${existingCoverage?.toLocaleString()} 元
- 目前流动紧急备用金：¥${emergencyFund?.toLocaleString()} 元
- 重疾保障缺口：¥${gap > 0 ? gap.toLocaleString() + " 元" : "已足额"}

【分析要求】：
1. 用温暖客观的语气分析为什么医药卡不够抵御这笔开支（医药卡赔医院，休养生活费需重疾险现金补偿）。
2. 点评家庭当前保额缺口带来的潜在风险（房贷断供、家庭积蓄清空风险）。
3. 给出 2 条科学合理的规划建议（例如：优先保家庭经济支柱、先定期后终身优化预算等）。
4. 结尾加上一句温暖有力的话（如“买保险不是因为害怕，而是因为爱”）。
请直接输出建议正文，不要使用任何复杂的 markdown 表格。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一位温和、专业、理性的家庭保险与健康资产规划专家，善于用大白话讲清楚保单底层逻辑。",
        temperature: 0.7,
      },
    });

    res.json({
      analysis: response.text || "无法生成分析建议，请检查输入后重试。",
    });
  } catch (error: any) {
    console.error("Analysis generation error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate insurance analysis.",
    });
  }
});

// Cumulative Customer Consultations Storage & Notification API
const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "consultations.json");

function getLeads(): LeadRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading leads file:", err);
    return [];
  }
}

function saveLeads(leads: LeadRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving leads file:", err);
  }
}

// 1. Get all cumulative leads (Protected for Leo only)
app.get("/api/consultations", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({
      success: false,
      error: "未授权：该客户数据库仅限规划师本人输入专属安全码查看。",
    });
    return;
  }
  const leads = getLeads();
  res.json({
    success: true,
    count: leads.length,
    leads,
  });
});

// 2. Submit new customer lead (Cumulative + Instant Notification to Leo)
app.post("/api/consultations", async (req, res) => {
  try {
    const {
      contactName,
      contactMethod,
      familyStructure = "未指定",
      existingPolicyStatus = "未指定",
      focusAreas = [],
      note = "",
      calculatedGap = 0,
    } = req.body;

    if (!contactName || !contactMethod) {
      res.status(400).json({ error: "客户称呼与联系方式为必填项。" });
      return;
    }

    const now = new Date();
    // Format to Malaysian local time (UTC+8)
    const formattedDateTime = now.toLocaleString("zh-CN", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const ticketSeq = Math.floor(1000 + Math.random() * 9000);
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const id = `LEO-${dateStr}-${ticketSeq}`;

    const newLead: LeadRecord = {
      id,
      contactName: String(contactName).trim(),
      contactMethod: String(contactMethod).trim(),
      familyStructure: String(familyStructure).trim(),
      existingPolicyStatus: String(existingPolicyStatus).trim(),
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
      note: String(note).trim(),
      calculatedGap: Number(calculatedGap) || 0,
      createdAt: now.toISOString(),
      formattedDateTime,
      status: "pending",
      plannerNotes: "",
    };

    const currentLeads = getLeads();
    // Append cumulatively (newest first for easy viewing)
    currentLeads.unshift(newLead);
    saveLeads(currentLeads);

    // Instant Notification Dispatch:
    console.log("=======================================================");
    console.log("🔔 【新客户线索第一时间通知】已推送至 Leo 专属管理表");
    console.log(`接收人: 规划师 Leo (WhatsApp: +60164311419 | 官方工作邮箱: leo.wealtharchitect@gmail.com)`);
    console.log(`工单号: ${newLead.id}`);
    console.log(`提交日期时间: ${newLead.formattedDateTime}`);
    console.log(`客户称呼: ${newLead.contactName}`);
    console.log(`WhatsApp 号码: ${newLead.contactMethod}`);
    console.log(`测算重疾保额缺口: RM ${newLead.calculatedGap.toLocaleString()}`);
    console.log(`家庭人口结构: ${newLead.familyStructure}`);
    console.log(`目前在保现状: ${newLead.existingPolicyStatus}`);
    console.log(`关注重点: ${newLead.focusAreas.join(", ") || "保单整体梳理"}`);
    console.log(`客户留言: ${newLead.note || "无"}`);
    console.log(`当前累计客户总数: 第 ${currentLeads.length} 位顾客`);
    console.log("=======================================================");

    // Asynchronously dispatch Email & Webhook alerts to Leo
    let notificationResults: any = {
      emailSuccess: false,
      emailMessage: "正在发送",
      webhookSuccess: false,
      webhookMessage: "正在发送",
    };
    try {
      notificationResults = await sendLeadAlert(newLead);
    } catch (notifyErr) {
      console.error("Alert dispatch error:", notifyErr);
    }

    // Generate pre-filled WhatsApp message for Leo
    const waText = encodeURIComponent(
      `【大马家庭保障自查工单】\n` +
      `工单号: ${newLead.id}\n` +
      `提交时间: ${newLead.formattedDateTime}\n` +
      `客户称呼: ${newLead.contactName}\n` +
      `联系电话: ${newLead.contactMethod}\n` +
      `测算重疾缺口: RM ${newLead.calculatedGap.toLocaleString()}\n` +
      `家庭结构: ${newLead.familyStructure}\n` +
      `保单现状: ${newLead.existingPolicyStatus}\n` +
      `关注重点: ${newLead.focusAreas.join(", ") || "保单梳理"}\n` +
      `留言: ${newLead.note || "无"}\n` +
      `（本条由自查系统第一时间自动归纳）`
    );

    const waNotificationUrl = `https://wa.me/60164311419?text=${waText}`;

    res.status(201).json({
      success: true,
      message: "客户资料已成功归纳至汇总表并生成即时通知。",
      lead: newLead,
      totalCount: currentLeads.length,
      waNotificationUrl,
      notification: notificationResults,
    });
  } catch (error: any) {
    console.error("Error creating consultation lead:", error);
    res.status(500).json({ error: error.message || "Failed to save lead." });
  }
});

// 3. Update lead status or planner note
app.patch("/api/consultations/:id", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({ error: "未授权操作。" });
    return;
  }
  try {
    const { id } = req.params;
    const { status, plannerNotes } = req.body;
    const leads = getLeads();
    const index = leads.findIndex((l) => l.id === id);

    if (index === -1) {
      res.status(404).json({ error: "未找到该客户记录。" });
      return;
    }

    if (status && ["pending", "contacted", "completed"].includes(status)) {
      leads[index].status = status;
    }
    if (typeof plannerNotes === "string") {
      leads[index].plannerNotes = plannerNotes;
    }

    saveLeads(leads);
    res.json({ success: true, lead: leads[index] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete lead (for testing/clearing records)
app.delete("/api/consultations/:id", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({ error: "未授权操作。" });
    return;
  }
  try {
    const { id } = req.params;
    const leads = getLeads();
    const filtered = leads.filter((l) => l.id !== id);
    saveLeads(filtered);
    res.json({ success: true, count: filtered.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Export cumulative table as Excel-compatible CSV (UTF-8 BOM)
app.get("/api/consultations-export", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).send("未授权：需要规划师专属安全密码。");
    return;
  }
  const leads = getLeads();
  const headers = [
    "序号",
    "工单编号",
    "提交日期时间",
    "客户称呼",
    "WhatsApp电话",
    "测算保额缺口(RM)",
    "家庭结构",
    "在保现状",
    "关注重点",
    "客户备注留言",
    "跟进状态",
    "规划师跟进记录",
  ];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = leads.map((lead, idx) => {
    const statusText =
      lead.status === "completed"
        ? "已完成梳理"
        : lead.status === "contacted"
        ? "已WhatsApp联系"
        : "待联系";
    return [
      idx + 1,
      escapeCsv(lead.id),
      escapeCsv(lead.formattedDateTime),
      escapeCsv(lead.contactName),
      escapeCsv(lead.contactMethod),
      escapeCsv(lead.calculatedGap ? `RM ${lead.calculatedGap.toLocaleString()}` : "RM 0"),
      escapeCsv(lead.familyStructure),
      escapeCsv(lead.existingPolicyStatus),
      escapeCsv(lead.focusAreas.join(" / ")),
      escapeCsv(lead.note),
      escapeCsv(statusText),
      escapeCsv(lead.plannerNotes || ""),
    ].join(",");
  });

  // UTF-8 BOM \uFEFF ensures Microsoft Excel opens Chinese characters without garbled text
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const filename = `Leo规划师_客户自查预约汇总表_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(csvContent);
});

// 6. Get notification configuration & latest dispatch status
app.get("/api/admin/notification-config", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({ error: "未授权：需要规划师安全密码。" });
    return;
  }
  const config = getNotificationConfig();
  // Return configuration with masked password for security
  res.json({
    success: true,
    config: {
      emailRecipient: config.emailRecipient,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpSecure: config.smtpSecure,
      smtpUser: config.smtpUser,
      hasSmtpPass: Boolean(config.smtpPass),
      smtpPassMasked: config.smtpPass ? "••••••••••••••••" : "",
      webhookUrl: config.webhookUrl,
      lastStatus: config.lastStatus,
    },
  });
});

// 7. Update notification configuration (e.g. Gmail App Password or Webhook)
app.post("/api/admin/notification-config", (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({ error: "未授权：需要规划师安全密码。" });
    return;
  }
  try {
    const { emailRecipient, smtpPass, smtpUser, smtpHost, smtpPort, smtpSecure, webhookUrl } =
      req.body;
    const partial: any = {};
    if (typeof emailRecipient === "string" && emailRecipient.trim()) {
      partial.emailRecipient = emailRecipient.trim();
    }
    if (typeof smtpUser === "string") {
      partial.smtpUser = smtpUser.trim();
    }
    if (typeof smtpPass === "string" && smtpPass.trim() !== "••••••••••••••••") {
      // Clean spaces often included when Google presents app passwords like "abcd efgh ijkl mnop"
      partial.smtpPass = smtpPass.trim().replace(/\s+/g, "");
    }
    if (typeof smtpHost === "string" && smtpHost.trim()) {
      partial.smtpHost = smtpHost.trim();
    }
    if (smtpPort) {
      partial.smtpPort = Number(smtpPort);
    }
    if (smtpSecure !== undefined) {
      partial.smtpSecure = Boolean(smtpSecure);
    }
    if (typeof webhookUrl === "string") {
      partial.webhookUrl = webhookUrl.trim();
    }

    const updated = saveNotificationConfig(partial);
    res.json({
      success: true,
      message: "通知设置已成功更新保存！",
      config: {
        emailRecipient: updated.emailRecipient,
        smtpHost: updated.smtpHost,
        smtpPort: updated.smtpPort,
        smtpSecure: updated.smtpSecure,
        smtpUser: updated.smtpUser,
        hasSmtpPass: Boolean(updated.smtpPass),
        smtpPassMasked: updated.smtpPass ? "••••••••••••••••" : "",
        webhookUrl: updated.webhookUrl,
        lastStatus: updated.lastStatus,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "更新配置失败" });
  }
});

// 8. Test send alert right now to verify email / webhook delivery
app.post("/api/admin/test-notification", async (req, res) => {
  if (!isAuthorizedPlanner(req)) {
    res.status(401).json({ error: "未授权：需要规划师安全密码。" });
    return;
  }
  try {
    const result = await sendTestAlert();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "测试通知发送失败" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
