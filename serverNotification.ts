import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export interface LeadRecord {
  id: string;
  contactName: string;
  contactMethod: string;
  familyStructure: string;
  existingPolicyStatus: string;
  focusAreas: string[];
  note: string;
  calculatedGap?: number;
  createdAt: string;
  formattedDateTime: string;
  status: "pending" | "contacted" | "completed";
  plannerNotes?: string;
}

export interface NotificationConfig {
  emailRecipient: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  webhookUrl: string;
  lastStatus?: {
    timestamp: string;
    emailAttempted: boolean;
    emailSuccess: boolean;
    emailMessage: string;
    webhookAttempted: boolean;
    webhookSuccess: boolean;
    webhookMessage: string;
  };
}

const CONFIG_FILE = path.join(process.cwd(), "data", "notification_config.json");

export function getNotificationConfig(): NotificationConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      const data = JSON.parse(raw);
      return {
        emailRecipient: data.emailRecipient || "leo.wealtharchitect@gmail.com",
        smtpHost: data.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com",
        smtpPort: Number(data.smtpPort || process.env.SMTP_PORT || 465),
        smtpSecure: data.smtpSecure !== undefined ? Boolean(data.smtpSecure) : true,
        smtpUser:
          data.smtpUser ||
          process.env.EMAIL_USER ||
          process.env.SMTP_USER ||
          "leo.wealtharchitect@gmail.com",
        smtpPass: data.smtpPass || process.env.EMAIL_PASS || process.env.SMTP_PASS || "",
        webhookUrl: data.webhookUrl || process.env.NOTIFICATION_WEBHOOK_URL || "",
        lastStatus: data.lastStatus,
      };
    }
  } catch (err) {
    console.error("Error reading notification config:", err);
  }

  return {
    emailRecipient: "leo.wealtharchitect@gmail.com",
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: Number(process.env.SMTP_PORT || 465),
    smtpSecure: true,
    smtpUser: process.env.EMAIL_USER || process.env.SMTP_USER || "leo.wealtharchitect@gmail.com",
    smtpPass: process.env.EMAIL_PASS || process.env.SMTP_PASS || "",
    webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || "",
  };
}

export function saveNotificationConfig(partial: Partial<NotificationConfig>): NotificationConfig {
  const current = getNotificationConfig();
  const updated: NotificationConfig = {
    ...current,
    ...partial,
  };

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving notification config:", err);
  }

  return updated;
}

export async function sendLeadAlert(lead: LeadRecord): Promise<{
  emailSuccess: boolean;
  emailMessage: string;
  webhookSuccess: boolean;
  webhookMessage: string;
}> {
  const config = getNotificationConfig();
  let emailSuccess = false;
  let emailMessage = "未配置邮件推送";
  let webhookSuccess = false;
  let webhookMessage = "未配置 Webhook 推送";

  // 1. Dispatch Email Notification
  if (config.smtpPass && config.smtpUser) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
        connectionTimeout: 8000,
      });

      const cleanPhone = lead.contactMethod.replace(/[^0-9]/g, "");
      const formattedGap = (lead.calculatedGap || 0).toLocaleString();
      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi ${lead.contactName}, 我是理财规划师 Leo。已收到您在大马家庭保障自查系统提交的保额梳理工单（工单号: ${lead.id}，重疾测算缺口: RM ${formattedGap}）。`
      )}`;

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h2 style="margin: 0; color: #f59e0b; font-size: 20px; font-weight: 800;">🔔 新客户自查与保额梳理工单通知</h2>
          <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px;">Leo 家庭财富传承规划师 · 实时线索推送</p>
        </div>

        <div style="padding: 24px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: #64748b;">工单编号：<strong style="color: #0f172a; font-size: 15px;">${lead.id}</strong></div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">提交时间：<strong style="color: #0f172a;">${lead.formattedDateTime}</strong> (大马时间)</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; width: 130px; font-weight: 500;">客户姓名：</td>
                <td style="padding: 10px 0; font-weight: bold; color: #0f172a; font-size: 16px;">${lead.contactName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">WhatsApp 电话：</td>
                <td style="padding: 10px 0; font-weight: bold; color: #059669; font-size: 16px;">
                  <a href="${waLink}" style="color: #059669; text-decoration: underline;">${lead.contactMethod}</a>
                  <span style="font-size: 12px; font-weight: normal; color: #64748b; margin-left: 6px;">(点击一键私聊)</span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">测算重疾缺口：</td>
                <td style="padding: 10px 0; font-weight: 800; color: #dc2626; font-size: 17px;">
                  RM ${(lead.calculatedGap || 0).toLocaleString()}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">家庭人口结构：</td>
                <td style="padding: 10px 0; color: #334155; font-weight: 500;">${lead.familyStructure}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">目前在保现状：</td>
                <td style="padding: 10px 0; color: #334155; font-weight: 500;">${lead.existingPolicyStatus}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">关注重点：</td>
                <td style="padding: 10px 0; color: #334155; font-weight: 500;">${lead.focusAreas.join(" / ") || "保单整体梳理"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 500; vertical-align: top;">客户备注留言：</td>
                <td style="padding: 10px 0; color: #0f172a; background: #fffbeb; padding-left: 10px; border-radius: 6px;">
                  ${lead.note || "（客户未填写留言）"}
                </td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="${waLink}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);">
              💬 立即在 WhatsApp 上私聊回复该客户
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; font-size: 12px; color: #94a3b8; text-align: center;">
          本邮件由 Leo 专属家庭保障自查系统即时发送至规划师官方邮箱：${config.emailRecipient}
        </div>
      </div>
      `;

      await transporter.sendMail({
        from: `"Leo 家庭保障自查系统" <${config.smtpUser}>`,
        to: config.emailRecipient,
        subject: `🔔 新客户预约工单：${lead.contactName}（缺口 RM ${lead.calculatedGap.toLocaleString()}）`,
        html,
      });

      emailSuccess = true;
      emailMessage = `邮件已成功送达至 ${config.emailRecipient}`;
      console.log(`✅ [Notification] 邮件已成功发送给 Leo: ${config.emailRecipient}`);
    } catch (err: any) {
      emailSuccess = false;
      emailMessage = `邮件发送异常: ${err.message || String(err)}`;
      console.error("❌ [Notification] 邮件发送失败:", err);
    }
  } else {
    emailMessage =
      "规划师尚未设置 Gmail 授权应用密码，系统已待命。登录 ?admin=leo 输入一次性授权应用密码即可激活真实邮件实时推送。";
    console.log("ℹ️ [Notification] 规划师尚未在管理面板配置 SMTP 密码，跳过邮件发送。");
  }

  // 2. Dispatch Webhook Notification (Discord / Telegram / Zapier / Make.com)
  if (config.webhookUrl && config.webhookUrl.startsWith("http")) {
    try {
      const cleanPhone = lead.contactMethod.replace(/[^0-9]/g, "");
      const waLink = `https://wa.me/${cleanPhone}`;

      // Format payload suitable for Discord or generic webhook
      const isDiscord = config.webhookUrl.includes("discord.com");
      const isTelegram = config.webhookUrl.includes("api.telegram.org");

      let payload: any;
      if (isDiscord) {
        payload = {
          content: `🚨 **【Leo 规划师 · 新客户自查工单上门！】**`,
          embeds: [
            {
              title: `工单编号: ${lead.id}`,
              color: 16107019, // Amber color
              fields: [
                { name: "客户称呼", value: lead.contactName, inline: true },
                { name: "联系电话", value: `[${lead.contactMethod}](${waLink})`, inline: true },
                {
                  name: "测算缺口",
                  value: `**RM ${(lead.calculatedGap || 0).toLocaleString()}**`,
                  inline: true,
                },
                { name: "家庭结构", value: lead.familyStructure, inline: true },
                { name: "在保状态", value: lead.existingPolicyStatus, inline: true },
                {
                  name: "关注重点",
                  value: lead.focusAreas.join(", ") || "全面梳理",
                  inline: true,
                },
                { name: "客户留言", value: lead.note || "无", inline: false },
                { name: "提交时间", value: lead.formattedDateTime, inline: false },
              ],
              footer: { text: "Leo 家庭财富传承规划系统" },
            },
          ],
        };
      } else if (isTelegram) {
        payload = {
          text:
            `🔔 *Leo 规划师 · 新客户自查工单！*\n\n` +
            `*客户姓名:* ${lead.contactName}\n` +
            `*电话:* ${lead.contactMethod}\n` +
            `*缺口:* RM ${(lead.calculatedGap || 0).toLocaleString()}\n` +
            `*家庭:* ${lead.familyStructure}\n` +
            `*保单:* ${lead.existingPolicyStatus}\n` +
            `*重点:* ${lead.focusAreas.join(", ") || "全面梳理"}\n` +
            `*留言:* ${lead.note || "无"}\n` +
            `*时间:* ${lead.formattedDateTime}\n\n` +
            `👉 [点击直达客户 WhatsApp](${waLink})`,
          parse_mode: "Markdown",
        };
      } else {
        payload = {
          event: "new_consultation_lead",
          lead,
          plannerEmail: config.emailRecipient,
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        webhookSuccess = true;
        webhookMessage = "Webhook 实时推送已成功送达目标端点";
        console.log("✅ [Notification] Webhook 推送成功！");
      } else {
        webhookSuccess = false;
        webhookMessage = `Webhook 响应异常状态: ${response.status}`;
      }
    } catch (err: any) {
      webhookSuccess = false;
      webhookMessage = `Webhook 请求失败: ${err.message || String(err)}`;
      console.error("❌ [Notification] Webhook 推送失败:", err);
    }
  }

  // Update lastStatus in config
  saveNotificationConfig({
    lastStatus: {
      timestamp: new Date().toISOString(),
      emailAttempted: Boolean(config.smtpPass),
      emailSuccess,
      emailMessage,
      webhookAttempted: Boolean(config.webhookUrl),
      webhookSuccess,
      webhookMessage,
    },
  });

  return {
    emailSuccess,
    emailMessage,
    webhookSuccess,
    webhookMessage,
  };
}

export async function sendTestAlert(): Promise<{
  success: boolean;
  message: string;
  details: {
    emailSuccess: boolean;
    emailMessage: string;
    webhookSuccess: boolean;
    webhookMessage: string;
  };
}> {
  const testLead: LeadRecord = {
    id: `TEST-LEO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`,
    contactName: "测试客户（大马网友）",
    contactMethod: "+60123456789",
    familyStructure: "已婚，有 2 名幼童",
    existingPolicyStatus: "仅有公司医药卡",
    focusAreas: ["重疾生活替代金", "儿童信托传承"],
    note: "这是一条由规划师工作台发起的即时通知联调测试消息。",
    calculatedGap: 360000,
    createdAt: new Date().toISOString(),
    formattedDateTime: new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    status: "pending",
  };

  const results = await sendLeadAlert(testLead);
  const overallSuccess = results.emailSuccess || results.webhookSuccess;
  return {
    success: overallSuccess,
    message: overallSuccess
      ? "测试通知成功发出！请检查您的官方邮箱或推送端点。"
      : "通知发送未完成：请检查 Gmail 密码或 Webhook 配置。",
    details: results,
  };
}
