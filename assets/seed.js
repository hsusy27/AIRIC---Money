/* =========================================================
   範例資料（僅在第一次使用、尚未有任何資料時自動載入一次）
   內容依你提供的 2026 年 6 月截圖重建，數字為對照用途，
   正式使用前請自行核對、修改或刪除。
   ========================================================= */
window.SEED_DATA = {
  modules: {
    director: { entries: [
      // ---- 醫院費用：行政公補款（無會計代號）----
      { id:'s1', month:'2026-06', category:'hospital_expense', fundSource:'hospital',
        item:'11406 中心定期會議', subitem:'（$3,995 供參，未列入本月墊付）', expense:0, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'20260630 已給中心' },
      { id:'s2', month:'2026-06', category:'hospital_expense', fundSource:'hospital',
        item:'印刷品（名片）', subitem:'（$288 供參，未列入本月墊付）', expense:0, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'20260630 已給中心' },
      { id:'s3', month:'2026-06', category:'hospital_expense', fundSource:'hospital',
        item:'印刷品（簡報影印）', subitem:'（$1,728 供參，未列入本月墊付）', expense:0, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'20260630 已給中心' },
      // ---- 醫院費用：差旅費（主任自行墊付，待歸還）----
      { id:'s4', month:'2026-06', category:'hospital_expense', fundSource:'hospital',
        item:'2025-06-04 蒙古義診', subitem:'機票＋簽證＋生活費', expense:56815, income:0,
        directorAdvanced:true, settled:false, settledMonth:null,
        note:'AE1140601926（內科申請）費用轉停（傳票號碼：11409C000256）' },
      { id:'s5', month:'2026-06', category:'hospital_expense', fundSource:'hospital',
        item:'202601 范教授來院指導', subitem:'漏帳', expense:24000, income:0,
        directorAdvanced:true, settled:false, settledMonth:null,
        note:'AE1150500558 費用轉停（傳票號碼：11505C000276）' },

      // ---- 113221T5：軟體與工具類支出 ----
      { id:'s6', month:'2026-06', category:'code_113221T5', fundSource:'school',
        item:'軟體工具使用費', subitem:'04月份（Claude Pro、ChatGPT Plus、V0 Premium、iCloud）', expense:0, income:2212,
        directorAdvanced:true, settled:true, settledMonth:'2026-06', note:'2026.06.05 入帳（上月墊付款本月沖帳）' },
      { id:'s7', month:'2026-06', category:'code_113221T5', fundSource:'school',
        item:'軟體工具使用費', subitem:'05月份（Claude Pro、ChatGPT Plus、iCloud）', expense:1560, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },
      { id:'s8', month:'2026-06', category:'code_113221T5', fundSource:'school',
        item:'軟體工具使用費', subitem:'Claude Max 2.0 續訂（2026.5月）', expense:0, income:2763,
        directorAdvanced:true, settled:true, settledMonth:'2026-06', note:'2026.06.26 入帳（上月墊付款本月沖帳）' },
      { id:'s9', month:'2026-06', category:'code_113221T5', fundSource:'school',
        item:'軟體工具使用費', subitem:'06月份（Claude Pro、ChatGPT Plus、iCloud、Claude Max）', expense:4699, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },

      // ---- 113221T3：審查／登記費用 ----
      { id:'s10', month:'2026-06', category:'code_113221T3', fundSource:'school',
        item:'查驗登記審查費', subitem:'第二類醫療器材許可證申請＿雙側肺潤濕', expense:58000, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },

      // ---- 11442501：工具授權（跨年度） ----
      { id:'s11', month:'2026-06', category:'code_11442501', fundSource:'school',
        item:'軟體工具使用費（2026-2027）', subitem:'Parallels Pro Edition（可用期間 20260221–20270221）匯率以33計', expense:3960, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },
      { id:'s12', month:'2026-06', category:'code_11442501', fundSource:'school',
        item:'軟體工具使用費（2026-2027）', subitem:'Apple Developer Program（可用期間 20260415–20270415）', expense:3400, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },
      { id:'s13', month:'2026-06', category:'code_11442501', fundSource:'school',
        item:'軟體工具使用費（2026-2027）', subitem:'NEJM AI（可用期間 20260422–20270422）匯率以33計', expense:6567, income:0,
        directorAdvanced:true, settled:false, settledMonth:null, note:'核銷中' },
      { id:'s14', month:'2026-06', category:'code_11442501', fundSource:'school',
        item:'軟體工具使用費（2026-2027）', subitem:'Parallels Pro Edition 補足額', expense:678, income:0,
        directorAdvanced:true, settled:false, settledMonth:null,
        note:'待收集憑證核銷（因與王剛 Notion 一起申請，所以還沒法核銷）' },

      // ---- 非主任開銷，另外申請給中心的費用（代轉，不算欠款）----
      { id:'s15', month:'2026-06', category:'passthrough', fundSource:'school',
        item:'鎖匙費', subitem:'（$1,500 供參）', expense:0, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'20260630 已給中心' },
      { id:'s16', month:'2026-06', category:'passthrough', fundSource:'school',
        item:'聚餐費_4/24', subitem:'', expense:3840, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'（2026.06.05）--->靖主任領出給中心經費' },
      { id:'s17', month:'2026-06', category:'passthrough', fundSource:'school',
        item:'聚餐費_5/08', subitem:'', expense:3840, income:0,
        directorAdvanced:false, settled:false, settledMonth:null, note:'（2026.06.18）--->靖主任領出給中心經費' },
    ]},
    hospital: { entries: [] },
    pettycash: { entries: [] },
    teamdinner: { entries: [] },
  }
};
