import { PROJECT_FINANCIALS, buildCashFlow, formatBaht, formatMillion } from './project-model.js';

const PROJECT_MILESTONES = [
        { month: "M01", monthly: 2.5, cum: 2.5, focus: "Mobilization & เข็มตอกชุดแรก" },
        { month: "M02", monthly: 5.5, cum: 8.0, focus: "เสาเข็มแล้วเสร็จ & หล่อฐานราก" },
        { month: "M03", monthly: 7.5, cum: 15.5, focus: "ตอม่อ คานคอดิน เสา ค.ส.ล." },
        { month: "M04", monthly: 8.5, cum: 24.0, focus: "บ่อบำบัด SBA/WEQ & เริ่มพื้น FS" },
        { month: "M05", monthly: 11.0, cum: 35.0, focus: "ขึ้นโครงเหล็ก Cellular Beam SM520" },
        { month: "M06", monthly: 12.5, cum: 47.5, focus: "เทพื้น Super Flat & ประกอบจันทัน" },
        { month: "M07", monthly: 12.0, cum: 59.5, focus: "มุงหลังคา Aluzinc ปิดกรอบอาคาร" },
        { month: "M08", monthly: 11.0, cum: 70.5, focus: "ก่อคอนกรีตบล็อก & Wall Cladding" },
        { month: "M09", monthly: 9.5, cum: 80.0, focus: "ติดเกล็ด Louvremax & เดินท่อระบบ" },
        { month: "M10", monthly: 7.5, cum: 87.5, focus: "ประตูม้วน D1 & หน้าต่างอลูมิเนียม" },
        { month: "M11", monthly: 5.5, cum: 93.0, focus: "เทถนน ค.ส.ล. 200 มม. ภายนอก" },
        { month: "M12", monthly: 4.0, cum: 97.0, focus: "ทาสี ขัดพื้น และงานตกแต่ง" },
        { month: "M13", monthly: 2.0, cum: 99.0, focus: "Commissioning & เคลียร์ Defect" },
        { month: "M14", monthly: 1.0, cum: 100.0, focus: "ส่งมอบงาน As-built & รับเงินประกัน" }
      ];
const PRELIM_BURN = [
        { m: "M01", phase: "Mobilize", monthly: 970, cum: 970, pct: "11.5%", note: "ตั้งแคมป์/หม้อแปลง" },
        { m: "M02", phase: "Substructure", monthly: 500, cum: 1470, pct: "17.4%", note: "งานเสาเข็ม" },
        { m: "M03", phase: "Substructure", monthly: 500, cum: 1970, pct: "23.3%", note: "งานฐานราก" },
        { m: "M04", phase: "Substructure", monthly: 500, cum: 2470, pct: "29.2%", note: "คานคอดิน" },
        { m: "M05", phase: "Peak Steel", monthly: 850, cum: 3320, pct: "39.3%", note: "Cellular Beam" },
        { m: "M06", phase: "Peak Floor", monthly: 850, cum: 4170, pct: "49.4%", note: "พื้น FS 250มม." },
        { m: "M07", phase: "Peak Roof", monthly: 850, cum: 5020, pct: "59.4%", note: "มุงหลังคา Metal" },
        { m: "M08", phase: "Architecture", monthly: 550, cum: 5570, pct: "65.9%", note: "ผนัง-สถาปัตย์" },
        { m: "M09", phase: "Architecture", monthly: 550, cum: 6120, pct: "72.4%", note: "งานฉาบ-สี" },
        { m: "M10", phase: "MEP System", monthly: 500, cum: 6620, pct: "78.3%", note: "ระบบไฟฟ้า-ประปา" },
        { m: "M11", phase: "MEP System", monthly: 450, cum: 7070, pct: "83.7%", note: "บ่อบำบัด SBA/WEQ" },
        { m: "M12", phase: "External", monthly: 400, cum: 7470, pct: "88.4%", note: "ถนนและลานภายนอก" },
        { m: "M13", phase: "Commissioning", monthly: 330, cum: 7800, pct: "92.3%", note: "ทดสอบระบบ" },
        { m: "M14", phase: "Handover", monthly: 650, cum: 8450, pct: "100.0%", note: "รื้อถอน ส่งมอบ" }
      ];
const CASH_FLOW = buildCashFlow(PROJECT_MILESTONES, PRELIM_BURN);
const CASH_LOW = CASH_FLOW.reduce((min, row) => row.net < min.net ? row : min);
const CASH_PEAK = CASH_FLOW.reduce((max, row) => row.outflow > max.outflow ? row : max);
const progressAt = month => PROJECT_MILESTONES.find(row => row.month === month).cum;
const prelimAt = month => PRELIM_BURN.find(row => row.m === month).monthly;
const CLOSEOUT_START = PROJECT_MILESTONES.find(row => row.cum >= 80).month;
const FINAL_RECEIPT = CASH_FLOW[CASH_FLOW.length - 1].inflowBaht;

export const SLIDES_DATA = [
  {
    id: 1,
    originalId: 1,
    tag: "PROJECT KICK-OFF",
    title: "โครงการก่อสร้างอาคารโรงงาน 10,540 ตร.ม.",
    subtitle: "การประชุมเปิดโครงการ แผนบริหารต้นทุน Sell BOQ สู่ Target Working Budget และการควบคุมบูรณาการ",
    badge: "สัญญา 14 เดือน (M01 - M14)",
    type: "hero",
    content: {
      metrics: [
        { label: "มูลค่าสัญญารวม VAT", value: "111.62", unit: "ล้านบาท", color: "cyan" },
        { label: "พื้นที่ใช้สอยโรงงาน", value: "10,540", unit: "ตร.ม.", color: "white" },
        { label: "ระยะเวลาก่อสร้าง", value: "14", unit: "เดือน", color: "amber" },
        { label: "ส่วนต่างราคาขายกับงบทำงาน", value: "19.42", unit: "ล้านบาท (ก่อน OH/ภาษี)", color: "emerald" }
      ],
      parties: [
        { role: "ผู้ว่าจ้างโครงการ", name: "บริษัท เอเชียอาคเนย์ จำกัด", note: "เจ้าของโครงการ" },
        { role: "ผู้ออกแบบและที่ปรึกษา", name: "พี โปรเฟสชั่นแนล เอ็นจิเนียริ่ง", note: "ควบคุมงานและตรวจรับ" },
        { role: "ผู้เสนอราคา / บริหารงาน", name: "กลุ่มนักศึกษา SAU", note: "ภาควิชาวิศวกรรมโยธา" }
      ]
    }
  },
  {
    id: 2,
    originalId: 2,
    tag: "LOCATION & FOOTPRINT",
    title: "ภาพรวมโครงการและข้อมูลอาคาร",
    subtitle: "ข้อมูลทางวิศวกรรมและพื้นที่ก่อสร้าง",
    badge: "10,540 ตร.ม.",
    type: "3d-warehouse",
    content: {
      location: "ตำบลพันท้ายนรสิงห์ อำเภอเมือง จังหวัดสมุทรสาคร",
      dimensions: {
        width: "68.05 ม.",
        length: "154.90 ม.",
        totalArea: "10,540 ตร.ม."
      },
      highlights: [
        { title: "อาคารเดี่ยวขนาดใหญ่ (Single Large Span)", desc: "พื้นที่กว้าง 68.05 ม. x ยาว 154.90 ม. ไร้เสากีดขวางไลน์ผลิตหลัก" },
        { title: "ระบบโครงสร้างผสมผสาน", desc: "ฐานรากและเสา ค.ส.ล. รองรับโครงหลังคาเหล็ก Cellular Beam SM520 ช่วงพาดกว้าง" },
        { title: "ออกแบบเพื่อรองรับอุตสาหกรรมหนัก", desc: "พื้น ค.ส.ล. FS หนา 250 มม. เสริมเหล็ก 2 ชั้น พร้อมหลุมเตาอบ PU และบ่อบำบัด SBA/WEQ" }
      ]
    }
  },
  {
    id: 3,
    originalId: 3,
    tag: "COMMERCIAL STRUCTURE",
    title: "สรุปมูลค่าสัญญาและราคาเสนอขาย",
    subtitle: "โครงสร้างมูลค่างานก่อสร้างสุทธิ (Sell BOQ Breakdown to Grand Total)",
    badge: "Total 111.62 MB",
    type: "commercial-flow",
    content: {
      pipeline: [
        { name: "Direct Cost", val: "85.00 ลบ.", share: "81.48%", desc: "ต้นทุนตรง (โครงสร้าง, สถาปัตย์, MEP, ถนน)" },
        { name: "Indirect Cost (8%)", val: "6.80 ลบ.", share: "6.52%", desc: "ค่าใช้จ่ายสนับสนุนทางอ้อม" },
        { name: "OH&P (12%)", val: "12.52 ลบ.", share: "12.00%", desc: "ค่าบริหารส่วนกลางและกำไรขั้นต้น" },
        { name: "Sum Sell (ก่อนภาษี)", val: "104.32 ลบ.", share: "100.00%", desc: "ยอดรวมเสนอขายสุทธิก่อนภาษี" },
        { name: "ยอดรวมสุทธิ (รวม VAT 7%)", val: "111.62 ลบ.", share: "+ VAT 7.30 ลบ.", desc: "มูลค่าสัญญาจ้างเหมาเบ็ดเสร็จ", isGrandTotal: true }
      ],
      taxNote: "ราคาก่อนภาษี 104.32 ลบ. + ภาษีมูลค่าเพิ่ม VAT 7% (7.30 ลบ.) = ยอดรวมสุทธิ 111.62 ล้านบาท"
    }
  },
  {
    id: 4,
    originalId: 4,
    tag: "SCOPE MATRIX",
    title: "Scope Responsibility Matrix",
    subtitle: "การจำแนกขอบเขตงานก่อสร้างอย่างชัดเจน: รวมในสัญญา vs ไม่รวมในสัญญา",
    badge: "Risk Mitigation",
    type: "scope-interactive",
    content: {
      included: [
        {
          num: "01",
          title: "งานปรับหน้าดินและงานเสาเข็ม",
          desc: "ขุด ถม ปรับระดับพื้นที่ • เข็ม I-300x300 มม. (รับน้ำหนัก ≥ 35 ตัน) • Dynamic Load Test",
          icon: "🏗️"
        },
        {
          num: "02",
          title: "งานโครงสร้าง ค.ส.ล.",
          desc: "ฐานราก F2 - F6 • เสา C1 - C2 • คาน B1 - B4 • เสริมเหล็กข้ออ้อย SD40",
          icon: "🏛️"
        },
        {
          num: "03",
          title: "งานโครงสร้างเหล็กรูปพรรณ",
          desc: "คานเหล็ก Cellular Beam (CSB1-3) SM520 • แปหลังคา Galvanized C-150",
          icon: "🔩"
        },
        {
          num: "04",
          title: "งานบ่อและหลุมพิเศษ",
          desc: "บ่อบำบัด SBA • บ่อ WEQ • หลุมตู้อบ PU • ติดตั้งระบบกันซึม Waterstop 100%",
          icon: "💧"
        },
        {
          num: "05",
          title: "งานสถาปัตยกรรมและมุงหลังคา",
          desc: "หลังคา Metal Sheet Aluzinc 0.47 มม. + บุฉนวนกันความร้อน • ผนัง Cladding Trimdek",
          icon: "🏠"
        },
        {
          num: "06",
          title: "งานพื้นตกแต่งและประตู-หน้าต่าง",
          desc: "ขัดพื้น Floor Hardener สีเขียว • ประตูม้วนไฟฟ้า D1 • ประตู D2-D6 / หน้าต่าง W1-W4",
          icon: "🚪"
        },
        {
          num: "07",
          title: "งานสุขาภิบาล ระบายน้ำ และถนน",
          desc: "ท่อระบายน้ำ ค.ส.ล. DN • บ่อพักสำเร็จรูป MH • ถังบำบัดน้ำเสีย • ถนน ค.ส.ล. หนา 200 มม.",
          icon: "🛣️"
        },
        {
          num: "08",
          title: "งานบริหารและประกันผลงาน",
          desc: "งบ Preliminary 14 เดือน • จป.วิชาชีพประจำสนาม • จัดทำ As-built DWG • ประกันผลงาน 1 ปี",
          icon: "🛡️"
        }
      ],
      excluded: [
        {
          title: "เครื่องจักรสายการผลิต (Machinery)",
          desc: "เครื่องจักรหลัก, หลุมอบ PU เฉพาะทาง และ Anchor Bolt พิเศษจากผู้ผลิต",
          icon: "⚙️"
        },
        {
          title: "ระบบไฟฟ้ากำลังหลัก",
          desc: "หม้อแปลงไฟฟ้าแรงสูงถาวร, ตู้ Substation และตู้ MDB ประจำโรงงาน",
          icon: "⚡"
        },
        {
          title: "ค่าธรรมเนียมราชการ",
          desc: "ค่าธรรมเนียมขออนุญาตก่อสร้าง อ.1, อ.4 และค่าใช้จ่ายขอมิเตอร์ถาวร",
          icon: "📜"
        },
        {
          title: "ระบบสื่อสารและกล้อง CCTV",
          desc: "ระบบ Internet Server ภายใน, สาย LAN และกล้องวงจรปิดของโรงงาน",
          icon: "📹"
        }
      ]
    }
  },
{
    id: 5,
    originalId: 5,
    tag: "COMMERCIAL BASELINE",
    title: "เงื่อนไขสัญญาและข้อกำหนดทางการค้าหลัก",
    subtitle: "กรอบสัญญาจ้างเหมาก่อสร้าง 14 เดือน (Commercial Terms Baseline ตามใบเสนอราคา QT-2025/001)",
    badge: "Contract Baseline (8 Pillars)",
    type: "commercial-baseline",
    content: {
      metrics: [
        { label: "เงินจ่ายล่วงหน้า (Advance)", val: "10%", sub: "11.16 ล้านบาท", note: "จ่ายเมื่อลงนามและวาง Advance BG", color: "cyan" },
        { label: "เงินประกันผลงาน (Retention)", val: "5%", sub: "5.22 ล้านบาท", note: "หักทุกงวดงาน คืนเมื่อส่งมอบงาน", color: "amber" },
        { label: "เครดิตเทอม (Credit Term)", val: "30 วัน", sub: "หลังตรวจรับงวด", note: "นับจากวันที่ตรวจรับรองผลงานถูกต้อง", color: "white" },
        { label: "ค่าปรับล่าช้า (LDs)", val: "0.10%", sub: "ต่อวัน (ไม่เกิน 10%)", note: "หากเกิดจากความบกพร่องผู้รับเหมา", color: "rose" }
      ],
      terms: [
        { num: "01", title: "การยืนราคา (Validity)", desc: "กำหนดยืนราคา 60 วัน นับจากวันยื่นใบเสนอราคา และยืนราคาคงที่ (Firm Price) ตลอดระยะเวลาก่อสร้าง 14 เดือน", tag: "Firm Price 60 วัน" },
        { num: "02", title: "เงินจ่ายล่วงหน้า (Advance Payment)", desc: "10% ของมูลค่าสัญญารวม VAT (11,162,045.45 บาท) เทียบเท่าก่อน VAT 10,431,818.18 บาท จ่ายเมื่อลงนามและวาง Advance BG", tag: "Advance 10%" },
        { num: "03", title: "การเบิกจ่ายค่างวด (Progress Billing)", desc: "เบิกตามผลงานรายเดือนและ S-Curve; แบบจำลองสมมติให้ชำระยอดคงค้างครบใน M14 หลังตรวจรับ เพื่อปิดบัญชี", tag: "Monthly S-Curve" },
        { num: "04", title: "การหักเงินคืนล่วงหน้า (Advance Deduction)", desc: "หักคืน 10% จากใบแจ้งหนี้ทุกงวดงานจนครบตามจำนวนเงินล่วงหน้าที่ได้รับ ปลอดภาระหนี้ล่วงหน้า", tag: "Deduct 10%/งวด" },
        { num: "05", title: "เงินประกันผลงาน (Retention Money)", desc: "หัก 5% จากยอดเบิกงานทุกงวดงาน (รวม 5,215,909.09 บาท) และคืนให้เมื่อส่งมอบงานงวดสุดท้ายและตรวจรับเรียบร้อย", tag: "Retention 5%" },
        { num: "06", title: "ระยะเวลาการชำระเงิน (Credit Terms)", desc: "30 วัน นับจากวันที่ผู้ว่าจ้างและที่ปรึกษาตรวจรับรองผลงานและได้รับใบแจ้งหนี้/ใบกำกับภาษีถูกต้อง", tag: "Credit 30 วัน" },
        { num: "07", title: "ค่าปรับงานล่าช้า (Liquidated Damages)", desc: "คิดค่าปรับในอัตรา 0.1% ของมูลค่าสัญญารวมต่อวัน แต่ไม่เกิน 10% ของมูลค่าสัญญา หากเกิดจากผู้รับเหมา", tag: "LDs 0.1%/วัน" },
        { num: "08", title: "การรับประกันผลงาน (Defect Liability)", desc: "รับประกันความชำรุดบกพร่อง 1 ปีเต็ม นับจากวันส่งมอบงาน โดยวางหนังสือค้ำประกันผลงาน (Bank Guarantee - BG) 5%", tag: "BG 5% (1 ปี)" }
      ]
    }
  },
  {
    id: 6,
    originalId: 13,
    tag: "MASTER SCHEDULE",
    title: "การควบคุมระยะเวลาโครงการ (Master Schedule)",
    subtitle: "แผนงานก่อสร้าง 14 เดือน และสัดส่วนน้ำหนักงาน 8 หมวดหลัก (Gantt Chart Analysis)",
    badge: "14 Months / 100% Target Weight",
    type: "gantt-weight",
    content: {
      totalMonths: 14,
      phases: [
        { name: "Phase 1: Substructure", months: "M01-M04", weight: "27.0%", color: "cyan" },
        { name: "Phase 2: Superstructure & Roof", months: "M05-M07", weight: "34.0%", color: "amber" },
        { name: "Phase 3: Architecture & Cladding", months: "M07-M10", weight: "15.0%", color: "purple" },
        { name: "Phase 4: MEP, Road & Handover", months: "M08-M14", weight: "24.0%", color: "emerald" }
      ],
      monthMilestones: [
        { m: "M01", note: "Mobilization & เข็มตอกชุดแรก" },
        { m: "M02", note: "เริ่มงานฐานราก คานคอดิน" },
        { m: "M03", note: "ตอม่อ คานคอดิน เสา ค.ส.ล." },
        { m: "M04", note: "🚩 เสร็จฐานราก & บ่อบำบัด SBA/WEQ" },
        { m: "M05", note: "ยกติดตั้ง Cellular Beam SM520" },
        { m: "M06", note: "เทพื้น Super Flat FS 250 มม." },
        { m: "M07", note: "🚩 ปิดหลังคา Metal Sheet (Dried-In)" },
        { m: "M08", note: "เริ่มงานผนังบล็อก & วางท่อภายนอก" },
        { m: "M09", note: "ติดตั้งเกล็ด Louvremax & เดินท่อระบบ" },
        { m: "M10", note: "🚩 ติดตั้งประตูม้วนไฟฟ้า D1" },
        { m: "M11", note: "เทถนน ค.ส.ล. 200 มม. ภายนอก" },
        { m: "M12", note: "ทาสี ขัดพื้น และงานสถาปัตย์" },
        { m: "M13", note: "Commissioning & ตรวจ Defect" },
        { m: "M14", note: "🚩 ส่งมอบงาน 100% & As-built" }
      ],
      categories: [
        {
          id: 1,
          name: "1. งานเตรียมการ & ตอกเสาเข็ม I-300",
          weight: 8.0,
          span: "M01 - M02",
          startMonth: 1,
          duration: 2,
          colorTheme: "cyan",
          critical: true,
          phase: "Substructure",
          desc: "Mobilization, ผังอาคาร, ตอกเสาเข็มไอ 300 มม. และทดสอบ Load Test"
        },
        {
          id: 2,
          name: "2. ฐานราก คานคอดิน เสา และบ่อ SBA",
          weight: 19.0,
          span: "M02 - M04",
          startMonth: 2,
          duration: 3,
          colorTheme: "blue",
          critical: true,
          phase: "Substructure",
          desc: "หล่อฐานราก คานคอดิน เสา ค.ส.ล. และบ่อบำบัดน้ำเสีย SBA/WEQ"
        },
        {
          id: 3,
          name: "3. พื้น ค.ส.ล. FS 250 มม. & หลุมเตาอบ PU",
          weight: 14.0,
          span: "M04 - M06",
          startMonth: 4,
          duration: 3,
          colorTheme: "sky",
          critical: false,
          phase: "Superstructure",
          desc: "เทพื้น Super Flat FS 250 มม., ขัด Floor Hardener และหลุมเตาอบ PU"
        },
        {
          id: 4,
          name: "4. ติดตั้ง Cellular Beam SM520 & โครงหลังคา",
          weight: 11.5,
          span: "M05 - M07",
          startMonth: 5,
          duration: 3,
          colorTheme: "amber",
          critical: true,
          phase: "Superstructure",
          desc: "ประกอบติดตั้งคาน Cellular Beam SM520 ช่วงพาดกว้าง 68 ม. ไร้เสากลาง"
        },
        {
          id: 5,
          name: "5. มุงหลังคา Metal Sheet Aluzinc & Skylight",
          weight: 8.5,
          span: "M06 - M07",
          startMonth: 6,
          duration: 2,
          colorTheme: "orange",
          critical: true,
          phase: "Superstructure",
          desc: "มุงแผ่น Aluzinc 0.48 มม. บุฉนวนกันความร้อน และแผ่นโปร่งแสง Skylight"
        },
        {
          id: 6,
          name: "6. งานผนังบล็อก Cladding & ประตู D1",
          weight: 15.0,
          span: "M07 - M10",
          startMonth: 7,
          duration: 4,
          colorTheme: "purple",
          critical: false,
          phase: "Architecture",
          desc: "ก่อผนังคอนกรีตบล็อก ติดเกล็ดระบายอากาศ Louvremax และประตูม้วนไฟฟ้า D1"
        },
        {
          id: 7,
          name: "7. ระบบท่อระบายน้ำ สุขาภิบาล & ถนน ค.ส.ล.",
          weight: 14.0,
          span: "M08 - M12",
          startMonth: 8,
          duration: 5,
          colorTheme: "emerald",
          critical: false,
          phase: "External & MEP",
          desc: "วางท่อระบายน้ำ ค.ส.ล., ราง U-Ditch, งานสุขาภิบาล และเทถนนคอนกรีตภายนอก"
        },
        {
          id: 8,
          name: "8. ทาสี ทดสอบ Commissioning & ส่งมอบ",
          weight: 10.0,
          span: "M11 - M14",
          startMonth: 11,
          duration: 4,
          colorTheme: "rose",
          critical: true,
          phase: "Closeout",
          desc: "ทาสีอาคาร, ทดสอบระบบ Commissioning, เคลียร์ Punch List & ส่งมอบงาน"
        }
      ]
    }
  },
  {
    id: 7,
    originalId: 14,
    tag: "INTERACTIVE S-CURVE",
    title: "สรุปแผนงานสะสม S-Curve (14 เดือน)",
    subtitle: "เส้นทางความก้าวหน้าสะสมเชิงวิศวกรรมพร้อมระบบ Time Scrubber",
    badge: "Interactive Radar",
    type: "interactive-scurve",
    content: {
      milestones: PROJECT_MILESTONES
    }
  },
  {
    id: 8,
    originalId: 8,
    tag: "SITE ORGANIZATION",
    title: "โครงสร้างองค์กรบริหารหน่วยงานสนาม",
    subtitle: "อัตรากำลังคน 11 อัตรา และการจัดสรรกรอบงบประมาณ Preliminary Staff รวม 4.22 ล้านบาท",
    badge: "11 Manpower / 4.22 MB",
    type: "org-chart",
    content: {
      budgetCap: "กรอบงบประมาณบุคลากร: จัดสรร 50% ของงบ Preliminary รวม 4.22 ล้านบาท ควบคุมตามแผน Man-Month ไม่เกินกรอบ",
      budgetAlert: "***เงินเดือนไม่รวม OT***",
      pm: {
        title: "ผู้จัดการโครงการ (Project Manager - PM)",
        qualification: "วุฒิ/สามัญวิศวกร 10+ ปี",
        desc: "บริหารภาพรวม ควบคุมต้นทุน แผนงาน เวลา และความปลอดภัย (M01-M14)",
        salary: "85,000",
        salaryUnit: "บาท/เดือน",
        avatar: "assets/team/pm.jpg"
      },
      columns: [
        {
          id: "col-field-eng",
          title: "ทีมวิศวกรสนาม",
          headcount: "3 อัตรา",
          colorTheme: "cyan",
          roles: [
            {
              title: "Site Eng โครงสร้าง",
              qualification: "(สย. 5+ ปี)",
              salary: "40,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/struct_eng.jpg"
            },
            {
              title: "Site Eng สถาปัตย์",
              qualification: "(สถ. 5+ ปี)",
              salary: "40,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/arch_eng.jpg"
            },
            {
              title: "MEP Eng",
              qualification: "ระบบท่อ / สุขาภิบาล",
              salary: "35,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/mep_eng.jpg"
            }
          ]
        },
        {
          id: "col-qa-safety",
          title: "ฝ่ายควบคุมคุณภาพ & ความปลอดภัย",
          headcount: "2 อัตรา",
          colorTheme: "emerald",
          roles: [
            {
              title: "QA/QC Engineer",
              qualification: "(ภย. 3+ ปี)",
              salary: "25,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/qaqc.jpg"
            },
            {
              title: "Safety Officer (จป.วิชาชีพ)",
              qualification: "ประจำสนาม 24 ชม.",
              salary: "25,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/safety.jpg"
            }
          ]
        },
        {
          id: "col-foreman-admin",
          title: "ทีมโฟร์แมน & ธุรการสนาม",
          headcount: "5 อัตรา",
          colorTheme: "amber",
          roles: [
            {
              title: "โฟร์แมนงานโครงสร้าง",
              qualification: "(2 อัตรา)",
              salary: "21,000",
              salaryUnit: "บาท/อัตรา/เดือน",
              avatar: "assets/team/foreman.jpg"
            },
            {
              title: "โฟร์แมนงานสถาปัตย์",
              qualification: "(2 อัตรา)",
              salary: "21,000",
              salaryUnit: "บาท/อัตรา/เดือน",
              avatar: "assets/team/foreman.jpg"
            },
            {
              title: "แอดมินสนาม",
              qualification: "คุมเอกสาร Shop DWG",
              salary: "17,000",
              salaryUnit: "บาท/เดือน",
              avatar: "assets/team/admin.jpg"
            }
          ]
        }
      ]
    }
  },
  {
    id: 9,
    originalId: 19,
    tag: "METHOD STATEMENT 01",
    title: "งานดิน ฐานราก และเสาเข็ม (Substructure)",
    subtitle: "มาตรฐานการตอกเข็ม I-300 ควบคุม Last 10 Blows และการหล่อฐานราก ค.ส.ล.",
    badge: "3D Interactive Simulation",
    type: "3d-pile",
    content: {
      steps: [
        {
          step: "STEP 01",
          title: "การตอกเสาเข็ม I-300x300 มม. (680 ต้น)",
          desc: "ปั้นจั่นระบบ Drop Hammer ควบคุมค่า Last 10 Blows ตามรายการคำนวณ รองรับน้ำหนักปลอดภัย ≥ 35 ตัน/ต้น พร้อมทำ Dynamic Load Test ยืนยันความลึกชั้นดิน"
        },
        {
          step: "STEP 02",
          title: "งานขุดดินและหล่อฐานราก ค.ส.ล. (F2 - F6)",
          desc: "ขุดเปิดหน้าฐานราก ตัดหัวเข็มด้วยช่างชำนาญการ หล่อคอนกรีต 280-320 ksc ตรวจสอบความหนาคอนกรีตหยาบ (Lean) และลูกปูนหนุนเหล็กอย่างเข้มงวด"
        },
        {
          step: "STEP 03",
          title: "โครงสร้างบ่อบำบัดและหลุมพิเศษ",
          desc: "หล่อโครงสร้างบ่อ SBA, บ่อ WEQ และหลุมเตาอบ PU โดยติดตั้งแผ่น Waterstop ป้องกันน้ำซึม 100% บริเวณ Cold Joint ทุกจุด"
        }
      ]
    }
  },
  {
    id: 10,
    originalId: 20,
    tag: "METHOD STATEMENT 02",
    title: "โครงสร้างเหล็ก Cellular Beam SM520",
    subtitle: "การแปรรูปจากโรงงาน การขนส่ง และการยกประกอบเข้ากับหูช้าง Corbel",
    badge: "3D Steel Assembly",
    type: "3d-steel",
    content: {
      steps: [
        {
          step: "STEP 01",
          title: "ผลิตและตรวจสอบจากโรงงาน (185 ตัน)",
          desc: "ใช้เหล็กชั้นคุณภาพ SM520 (Yield Strength 355 MPa) ขึ้นรูปคานรังผึ้ง ตรวจสอบรอยเชื่อมต่อด้วย Ultrasonic Testing (NDT) 100% พร้อมพ่นสีกันสนิม"
        },
        {
          step: "STEP 02",
          title: "การขนส่งและยกติดตั้งด้วย Mobile Crane",
          desc: "ใช้ Mobile Crane 50 ตัน ยกติดตั้งช่วงเวลาเช้าตรู่ มีการกั้น Barricade 100% รัศมีทำงาน และติดตั้งระบบค้ำยันชั่วคราว (Temporary Bracing) ระหว่างปรับระดับ"
        },
        {
          step: "STEP 03",
          title: "การยึดต่อ Corbel หูช้างเสา ค.ส.ล.",
          desc: "ยึด Bolted Connection ชนิด High-Strength Bolts เข้ากับแป้นหูช้างเสา ค.ส.ล. ขันแน่นด้วยประแจทอร์ก (Torque Wrench) ตามค่าวิศวกรกำหนด"
        }
      ]
    }
  },
  {
    id: 11,
    originalId: 21,
    tag: "METHOD STATEMENT 03",
    title: "งานพื้นโรงงาน FS 250 มม. & Hardener",
    subtitle: "เทคโนโลยี Super Flat Floor ควบคุมระดับด้วย Laser Screed และขัดผิวสีเขียว",
    badge: "3D Floor Stratigraphy",
    type: "3d-floor",
    content: {
      steps: [
        {
          step: "STEP 01",
          title: "เทพื้น FS 250 มม. ด้วย Laser Screed",
          desc: "พื้น ค.ส.ล. หนา 250 มม. เสริมเหล็ก 2 ชั้น บนพื้นที่ 10,540 ตร.ม. เทแบบสลับแถว (Long Strip Pouring) เพื่อลดแรงดึงจากการหดตัว ควบคุมความเรียบระดับ Super Flat"
        },
        {
          step: "STEP 02",
          title: "ขัด Floor Hardener สีเขียว",
          desc: "โรยผง Non-metallic Hardener สีเขียวมาตรฐานอุตสาหกรรมในจังหวะ Plastic State และขัดเรียบเงาแน่นด้วยเครื่อง Power Trowel หลายทิศทาง"
        },
        {
          step: "STEP 03",
          title: "กรีดรอยต่อ Saw-Cut & หยอด PU Joint",
          desc: "กรีดรอยต่อ Saw-Cut Joint ทันทีภายใน 24-36 ชั่วโมงหลังเทเพื่อบังคับแนวรอยแตกร้าว จากนั้นทำความสะอาดและหยอดรอยต่อด้วยโพลียูรีเทน Elastic Sealant"
        }
      ]
    }
  },
  {
    id: 12,
    originalId: 22,
    tag: "METHOD STATEMENT 04",
    title: "หลังคา Metal Sheet & ผนัง Trimdek",
    subtitle: "ระบบห่อหุ้มอาคารป้องกันความร้อนและน้ำรั่วซึม (Architectural Envelope)",
    badge: "3D Envelope Simulation",
    type: "3d-roof",
    content: {
      features: [
        {
          icon: "roof",
          title: "หลังคา Metal Sheet Aluzinc 0.47 มม.",
          specs: ["ความหนา 0.47 มม. TCT แผ่นยาวไร้รอยต่อ", "บุฉนวนกันความร้อน PE/PU Foam หนาพิเศษ", "แซมแผ่นโปร่งแสง Skylight SCG ประหยัดพลังงานแสง"]
        },
        {
          icon: "wall",
          title: "ผนัง Wall Cladding Trimdek",
          specs: ["แผ่น Metal Siding หนา 0.47 มม. เคลือบสีอบ", "ติดตั้งซีลยาง Overlap กันน้ำรั่วซึม 100%", "ยึดบนโครงคร่าวเหล็กชุบกัลวาไนซ์ปลอดสนิม"]
        },
        {
          icon: "wind",
          title: "ระบายอากาศ Louvremax 470",
          specs: ["บานเกล็ดระบายอากาศเมทัลชีท 620 ตร.ม.", "พ่นเคลือบสีอบ Powder Coat ทนไอเคมี", "ออกแบบองศาใบเกล็ด กันละอองฝนสาด 100%"]
        }
      ]
    }
  },
  {
    id: 13,
    originalId: 23,
    tag: "METHOD STATEMENT 05",
    title: "ระบบสุขาภิบาล ระบายน้ำ และถนน ค.ส.ล.",
    subtitle: "การเชื่อมต่อโครงสร้างพื้นฐานภายนอกและระบบท่อใต้ดิน (Infrastructure & MEP)",
    badge: "3D Infrastructure Model",
    type: "3d-mep-road",
    content: {
      features: [
        {
          icon: "drain",
          title: "ระบบระบายน้ำฝนและบ่อพัก ค.ส.ล. (P101)",
          specs: ["ท่อ ค.ส.ล. ชั้นคุณภาพ พร้อมบ่อพักสำเร็จรูป MH รอบอาคาร", "ตรวจสอบระดับ Invert Level หน้างาน ป้องกันปัญหาน้ำท่วมขัง", "ฝาบ่อพักเหล็กหล่อชนิด Heavy Duty รองรับรถบรรทุกหนัก"]
        },
        {
          icon: "water",
          title: "ระบบน้ำดี น้ำเสีย และสุขาภิบาล (P102)",
          specs: ["ท่อประปา PVC CW 13.5 พร้อมทำแบบทดสอบแรงดันน้ำ (Pressure Test)", "วางท่อน้ำเสียความลาดเอียง Slope 1:200 ตามมาตรฐานสากล", "ติดตั้งถังบำบัดน้ำเสียสำเร็จรูป ถังดักไขมัน และสุขภัณฑ์ T-01 ครบชุด"]
        },
        {
          icon: "road",
          title: "ถนน ค.ส.ล. หนา 200 มม. รอบโรงงาน",
          specs: ["คอนกรีตผิวทางหนา 200 มม. เสริมเหล็ก Wiremesh 6 มม.", "บดอัดชั้นทางลูกรังและหินคลุกตามค่า CBR วิศวกรรม", "หยอดรอยต่อ Expansion และ Contraction Joint ตลอดสาย"]
        }
      ]
    }
  },
  {
    id: 14,
    originalId: 16,
    tag: "การบริหารห่วงโซ่อุปทาน (PART 1)",
    title: "แผนจัดซื้อวัสดุโครงสร้างและกรอบอาคาร (Lead Time ลบ 2 เดือน)",
    subtitle: "กำหนดสั่งซื้อ ของเข้าหน้างาน และช่วงติดตั้งจริง 8 รายการแรก สอดรับกับ Critical Path",
    badge: "Lead Time -2 เดือน",
    type: "supply-gantt",
    content: {
      part: 1,
      months: ["M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09", "M10"],
      materials: [
        {
          id: 1,
          name: "1. เสาเข็ม คอร. I-300x300 มม.",
          ref: "S101, S201",
          criteria: "มอก., รับ นน. ≥ 35 ตัน",
          order: { colStart: 1, colSpan: 1, label: "M01 (ช่วงต้น)" },
          arrive: { colStart: 2, colSpan: 2, label: "M01 - M02" },
          install: { colStart: 3, colSpan: 3, label: "M01 - M03" }
        },
        {
          id: 2,
          name: "2. เหล็กข้ออ้อย SD40 (DB12-25) & RB9",
          ref: "S002, S201",
          criteria: "Mill Cert, Tensile Test",
          order: { colStart: 1, colSpan: 1, label: "M01" },
          arrive: { colStart: 3, colSpan: 5, label: "M02 - M04" },
          install: { colStart: 3, colSpan: 7, label: "M02 - M05" }
        },
        {
          id: 3,
          name: "3. คอนกรีตผสมเสร็จ 280-320 ksc",
          ref: "S001, S202",
          criteria: "Slump Test, เก็บลูกปูน",
          order: { colStart: 2, colSpan: 1, label: "M01 - M02" },
          arrive: { colStart: 3, colSpan: 9, label: "M02 - M06" },
          install: { colStart: 3, colSpan: 9, label: "M02 - M06" }
        },
        {
          id: 4,
          name: "4. Cellular Beam (CSB1-3) SM520",
          ref: "S301, S302",
          criteria: "Yield ≥ 355 MPa, NDT",
          order: { colStart: 3, colSpan: 2, label: "M02 - M03" },
          arrive: { colStart: 8, colSpan: 3, label: "M04 - M05" },
          install: { colStart: 10, colSpan: 3, label: "M05 - M06" }
        },
        {
          id: 5,
          name: "5. แปเหล็กกัลวาไนซ์ C-150x75 & Sag rods",
          ref: "S401",
          criteria: "ความหนาชั้นชุบ Zinc, มอก.",
          order: { colStart: 6, colSpan: 2, label: "M03 - M04" },
          arrive: { colStart: 10, colSpan: 2, label: "M05 - M06" },
          install: { colStart: 11, colSpan: 3, label: "M06 - M07" }
        },
        {
          id: 6,
          name: "6. หลังคา Aluzinc 0.47 มม. + Skylight",
          ref: "A103, A104",
          criteria: "หนัก 0.47 มม. TCT, ซีลกันน้ำ",
          order: { colStart: 6, colSpan: 2, label: "M03 - M04" },
          arrive: { colStart: 10, colSpan: 3, label: "M05 - M06" },
          install: { colStart: 12, colSpan: 3, label: "M06 - M07" }
        },
        {
          id: 7,
          name: "7. คอนกรีตบล็อกหนา 200 มม. และ 100 มม.",
          ref: "A201, A202",
          criteria: "มอก. บล็อกไม่รับน้ำหนัก, แรงอัด",
          order: { colStart: 6, colSpan: 3, label: "M03 - M05" },
          arrive: { colStart: 12, colSpan: 2, label: "M06 - M07" },
          install: { colStart: 13, colSpan: 5, label: "M07 - M09" }
        },
        {
          id: 8,
          name: "8. ผนัง Trimdek Aluzinc 0.47 มม.",
          ref: "A201, A202",
          criteria: "เฉดสีเคลือบอบ, แนวซ้อนทับ",
          order: { colStart: 8, colSpan: 2, label: "M04 - M05" },
          arrive: { colStart: 12, colSpan: 2, label: "M06 - M07" },
          install: { colStart: 13, colSpan: 5, label: "M07 - M09" }
        }
      ]
    }
  },
  {
    id: 15,
    originalId: 17,
    tag: "การบริหารห่วงโซ่อุปทาน (PART 2)",
    title: "แผนจัดซื้อวัสดุสถาปัตย์ งานระบบ MEP และถนนภายนอก",
    subtitle: "ควบคุมงวดสั่งซื้อ ส่งมอบ และติดตั้งงานสถาปัตยกรรม MEP และถนน 8 รายการถัดไป",
    badge: "Quality & Sequence",
    type: "supply-gantt",
    content: {
      part: 2,
      months: ["M03", "M04", "M05", "M06", "M07", "M08", "M09", "M10", "M11", "M12"],
      materials: [
        {
          id: 9,
          name: "9. บานเกล็ดระบายอากาศ Louvremax 470",
          ref: "A201, A202",
          criteria: "เฉดสีเคลือบอบ, แนวซ้อนทับ",
          order: { colStart: 3, colSpan: 2, label: "M04" },
          arrive: { colStart: 8, colSpan: 3, label: "M06 - M07" },
          install: { colStart: 10, colSpan: 5, label: "M07 - M09" }
        },
        {
          id: 10,
          name: "10. ผงขัดฟลอร์ฮาร์ดเดนเนอร์ (Floor Hardener สีเขียว)",
          ref: "A102",
          criteria: "สีเขียวมาตรฐาน, ขัดเรียบเงา",
          order: { colStart: 1, colSpan: 2, label: "M03" },
          arrive: { colStart: 3, colSpan: 2, label: "M04" },
          install: { colStart: 5, colSpan: 4, label: "M05 - M06" }
        },
        {
          id: 11,
          name: "11. ประตูม้วนไฟฟ้า D1, ประตูเหล็ก D2-D6, หน้าต่าง W1-W4",
          ref: "A501",
          criteria: "มอเตอร์ไฟฟ้า, กระจกเขียวตัดแสง",
          order: { colStart: 3, colSpan: 2, label: "M04" },
          arrive: { colStart: 8, colSpan: 3, label: "M06 - M07" },
          install: { colStart: 10, colSpan: 7, label: "M07 - M10" }
        },
        {
          id: 12,
          name: "12. กระเบื้องพื้น/ผนัง 300x300, 200x300 มม. & สุขภัณฑ์ T-01",
          ref: "A401",
          criteria: "เกรด A กันลื่น R10, สุขภัณฑ์ประหยัดน้ำ",
          order: { colStart: 5, colSpan: 2, label: "M05" },
          arrive: { colStart: 8, colSpan: 3, label: "M07" },
          install: { colStart: 11, colSpan: 6, label: "M08 - M10" }
        },
        {
          id: 13,
          name: "13. ท่อระบายน้ำ ค.ส.ล. DN และบ่อพักสำเร็จรูป MH",
          ref: "P101",
          criteria: "ชั้นคุณภาพ 3, ฝาบ่อพักเหล็กหล่อ",
          order: { colStart: 2, colSpan: 2, label: "M04" },
          arrive: { colStart: 6, colSpan: 3, label: "M06 - M07" },
          install: { colStart: 8, colSpan: 7, label: "M07 - M10" }
        },
        {
          id: 14,
          name: "14. ท่อน้ำดี PVC CW ชั้น 13.5 (ขนาด 3/4\" - 1 1/2\")",
          ref: "P102",
          criteria: "มอก. ท่อน้ำดื่ม PVC สีฟ้า, ข้อต่อ มอก.",
          order: { colStart: 4, colSpan: 2, label: "M05" },
          arrive: { colStart: 8, colSpan: 2, label: "M07" },
          install: { colStart: 10, colSpan: 7, label: "M08 - M11" }
        },
        {
          id: 15,
          name: "15. ถังบำบัดน้ำเสียสำเร็จรูป, ถังดักไขมัน และท่อ PVC น้ำเสีย",
          ref: "P102, A401",
          criteria: "ขนาดรองรับผู้ใช้อาคาร, ปั๊มแรงดัน",
          order: { colStart: 4, colSpan: 2, label: "M05" },
          arrive: { colStart: 8, colSpan: 2, label: "M07" },
          install: { colStart: 10, colSpan: 6, label: "M08 - M10" }
        },
        {
          id: 16,
          name: "16. เหล็กตะแกรง Wiremesh dia 6 มม., วัสดุหยอดรอยต่อ Joint",
          ref: "S503, S504",
          criteria: "กำลังดึงสูง, ยางหยอดรอยต่อ Elastic",
          order: { colStart: 7, colSpan: 2, label: "M06" },
          arrive: { colStart: 11, colSpan: 2, label: "M08" },
          install: { colStart: 13, colSpan: 6, label: "M09 - M11" }
        }
      ]
    }
  },
  {
    id: 16,
    originalId: 15,
    tag: "ENGINEERING COORDINATION",
    title: "แผนจัดทำและอนุมัติแบบ Shop Drawing (Gantt Schedule)",
    subtitle: "กำหนดส่งและอนุมัติแบบ 8 กลุ่มหลัก (SD-01 ถึง SD-15) ล่วงหน้าหน้างาน 3-4 สัปดาห์",
    badge: "Lead-time 3-4 Weeks",
    type: "shop-drawings",
    content: {
      totalMonths: 14,
      leadTimeNote: "อนุมัติก่อนเริ่มงานหน้างาน 3 - 4 สัปดาห์ (Code 1 / Code 2)",
      disciplines: [
        { name: "งานโครงสร้างคอนกรีต", code: "SD-01 ~ SD-06", span: "M01 - M04", color: "cyan" },
        { name: "งานโครงสร้างเหล็ก", code: "SD-07 ~ SD-08", span: "M02 - M05", color: "amber" },
        { name: "งานสถาปัตย์ & หลังคา", code: "SD-09 ~ SD-12", span: "M04 - M07", color: "purple" },
        { name: "งานระบบ & As-Built", code: "SD-13 ~ SD-15+", span: "M05 - M13", color: "emerald" }
      ],
      packages: [
        {
          id: 1,
          code: "SD-01/02",
          name: "ผังตำแหน่งเสาเข็มไอ & ฐานราก F2/F4/F6",
          span: "M01 - M02",
          startMonth: 1,
          duration: 2,
          colorTheme: "cyan",
          leadTime: "3 สัปดาห์ก่อนตอกเข็ม",
          desc: "ผังพิกัดเสาเข็มไอ 300, ดีเทลขยายฐานราก ค.ส.ล. รับเสา Cellular"
        },
        {
          id: 2,
          code: "SD-03/04",
          name: "เสา ค.ส.ล. C1/C2, Corbel หูช้าง & คานคอดิน",
          span: "M01 - M03",
          startMonth: 1,
          duration: 3,
          colorTheme: "blue",
          leadTime: "3 สัปดาห์ก่อนหล่อเสา",
          desc: "ระยะเหล็กเสริมเสา ค.ส.ล., จุดเชื่อม Anchor Bolt และแนวคานคอดิน GB"
        },
        {
          id: 3,
          code: "SD-05/06",
          name: "บ่อบำบัด SBA/WEQ & พื้น Super Flat FS 250 มม.",
          span: "M02 - M04",
          startMonth: 2,
          duration: 3,
          colorTheme: "sky",
          leadTime: "4 สัปดาห์ก่อนเทพื้น",
          desc: "แบบเสริมเหล็กบ่อบำบัด, Joint Saw Cut Layout, หลุมเตาอบ PU"
        },
        {
          id: 4,
          code: "SD-07/08",
          name: "คาน Cellular Beam SM520 & โครงหลังคา",
          span: "M02 - M05",
          startMonth: 2,
          duration: 4,
          colorTheme: "amber",
          leadTime: "4 สัปดาห์ก่อนยกติดตั้ง",
          desc: "แบบ Fabrication รอยต่อ Bolt Connection, Sag Rod, แป C-Purlin"
        },
        {
          id: 5,
          code: "SD-09/10",
          name: "หลังคา Metal Sheet Aluzinc, ฉนวน & Skylight",
          span: "M04 - M06",
          startMonth: 4,
          duration: 3,
          colorTheme: "orange",
          leadTime: "3 สัปดาห์ก่อนมุง",
          desc: "แบบ Flashing ครอบจั่ว, ทางระบายน้ำรางน้ำฝน, ตำแหน่ง Skylight SCG"
        },
        {
          id: 6,
          code: "SD-11/12",
          name: "ผนังคอนกรีตบล็อก, เกล็ด Louvremax & ประตู D1",
          span: "M05 - M07",
          startMonth: 5,
          duration: 3,
          colorTheme: "purple",
          leadTime: "3 สัปดาห์ก่อนก่อผนัง",
          desc: "แนวเอ็นทับหลัง ค.ส.ล., ดีเทลยึดเกล็ดระบายอากาศ, รางประตูม้วนไฟฟ้า"
        },
        {
          id: 7,
          code: "SD-13/14",
          name: "ท่อระบายน้ำ ค.ส.ล., บ่อพัก MH & ระบบสุขาภิบาล",
          span: "M05 - M09",
          startMonth: 5,
          duration: 5,
          colorTheme: "emerald",
          leadTime: "4 สัปดาห์ก่อนวางท่อ",
          desc: "ระดับ Slope ท่อระบายน้ำ, บ่อดักไขมัน, รางระบายน้ำ U-Ditch ภายนอก"
        },
        {
          id: 8,
          code: "SD-15/As-built",
          name: "ถนน ค.ส.ล. 200 มม., Ramp & แบบ As-Built ส่งมอบ",
          span: "M08 - M13",
          startMonth: 8,
          duration: 6,
          colorTheme: "rose",
          leadTime: "อนุมัติก่อนเทถนน & ปิดเล่ม As-Built",
          desc: "ระดับถนน ค.ส.ล. เชื่อมทางสาธารณะ และแบบ As-Built Drawing ฉบับสมบูรณ์"
        }
      ]
    }
  },
{
    id: 17,
    originalId: 7,
    tag: "SITE MOBILIZATION",
    title: "แผนปฏิบัติการ Mobilization 4 สัปดาห์แรก",
    subtitle: "แผนเตรียมความพร้อมสนับสนุนจากสโตร์กลางเข้าหน่วยงานก่อสร้างในเดือนแรก (Month 01 Action Matrix)",
    badge: "4-Week Mobilization Matrix",
    type: "mobilization-matrix",
    content: {
      weeks: [
        {
          week: "สัปดาห์ที่ 01",
          theme: "การสำรวจและพื้นที่ชั่วคราว",
          color: "cyan",
          icon: "📍",
          items: [
            { title: "กล้อง Total Station & หมุด Benchmark", desc: "รังวัดแนวเขตที่ดิน วางแนว Gridline โครงสร้าง", owner: "Chief Surveyor" },
            { title: "รั้วชั่วคราวสูง 2 ม. & ป้ายโครงการ", desc: "ล้อมรั้วรอบพื้นที่ 450 ม. ติดป้ายชื่อและข้อมูลวิศวกร", owner: "Site Engineer" },
            { title: "หม้อแปลงชั่วคราว 100 kVA & น้ำประปา", desc: "ติดตั้งมิเตอร์ชั่วคราว พร้อมถังสำรองน้ำ 5,000 ลิตร", owner: "MEP Engineer" }
          ],
          checklist: "แนวเขตถูกต้อง 100%, น้ำ-ไฟฟ้าพร้อมใช้ตลอด 24 ชม."
        },
        {
          week: "สัปดาห์ที่ 02",
          theme: "สำนักงานสนามและแคมป์พัก",
          color: "sky",
          icon: "🏢",
          items: [
            { title: "ตู้คอนเทนเนอร์สำนักงานสนาม 4 ตู้", desc: "ตู้สำนักงาน PM, ห้องประชุม, ห้องน้ำแยก ช-ญ 8 ห้อง", owner: "Admin / Foreman" },
            { title: "ระบบ LAN / Wi-Fi & แอร์คอนดิชัน", desc: "ติดตั้งโต๊ะทำงาน บอร์ดบริหารงาน และจอประชุม Online", owner: "IT & Admin" },
            { title: "ป้อมยาม & สแกนใบหน้าคนงาน", desc: "รปภ. ประจำการ 24 ชม. ตรวจวัดแอลกอฮอล์และสารเสพติด", owner: "Safety Officer" }
          ],
          checklist: "สำนักงานสนามพร้อมใช้งาน, ระบบบันทึกเวลาทำงาน 100%"
        },
        {
          week: "สัปดาห์ที่ 03",
          theme: "เครื่องมือช่างและอุปกรณ์ความปลอดภัย",
          color: "emerald",
          icon: "🦺",
          items: [
            { title: "เครื่องกำเนิดไฟฟ้า 50 kVA & เครื่องเชื่อม", desc: "สกัดคอนกรีต, สายไฟสนามกันน้ำ, สปอตไลต์ LED", owner: "Site Storeman" },
            { title: "อุปกรณ์ PPE & ป้าย Safety Signboard", desc: "หมวก, รองเท้าหัวเหล็ก, Full Body Harness, ถังดับเพลิง 15 ถัง", owner: "จป.วิชาชีพ" },
            { title: "ตรวจเช็กสภาพเครื่องมือ (สีแท็กประจำเดือน)", desc: "เครื่องมือทุกชิ้นผ่านเกณฑ์ความปลอดภัย ติด Tag ผ่านตรวจ", owner: "Safety & QC" }
          ],
          checklist: "คนงานทุกคนสวม PPE 100% ก่อนผ่านประตูเข้าไซต์"
        },
        {
          week: "สัปดาห์ที่ 04",
          theme: "เครื่องจักรหนักและเริ่มงานเข็มต้นแรก",
          color: "amber",
          icon: "🏗️",
          items: [
            { title: "รถแบ็กโฮ PC200 & รถบด 10 ตัน", desc: "ปรับระดับดินหน้างาน ขุดเปิดทางเข้า-ออกโครงการ", owner: "Lead Foreman" },
            { title: "ชุดปั้นจั่นตอกเสาเข็ม I-300 จำนวน 2 ชุด", desc: "เครื่องจักรผ่านตรวจสภาพ จป., คนขับมีใบเซอร์ครบถ้วน", owner: "Subcontractor / PM" },
            { title: "เริ่มตอกเสาเข็มต้นแรก (First Pile Kick-off)", desc: "ที่ปรึกษาอนุมัติรายการคำนวณ Blow count เริ่มตอกปลาย M01", owner: "PM & Consultant" }
          ],
          checklist: "First Pile ตอกสำเร็จตามเกณฑ์ Blow Count ปลาย M01"
        }
      ]
    }
  },
      {
    id: 18,
    originalId: 18,
    tag: "SITE EXECUTION & LOGISTICS",
    title: "แผนบริหารจัดการหน้างาน 3 มิติ (3-Dimension Execution Method)",
    subtitle: "แผนกำลังคน (Manpower S-Curve), แผนผังการจัดส่ง Just-in-Time & Heavy Lifting, และแผนคุมแบบ Shop DWG",
    badge: "3-Dimension Execution Method",
    type: "site-logistics-method",
    content: {
      pillars: [
        {
          num: "01",
          title: "แผนกำลังคนและแรงงาน (Manpower Plan)",
          subtitle: "การจัดสรรแรงงานช่างฝีมือตามเส้นทางวิกฤต",
          color: "cyan",
          icon: "👷",
          targetPill: "🎯 เป้าหมาย: ป้องกันขาดแคลนแรงงานช่วง Peak M05-M08",
          items: [
            {
              icon: "📈",
              tag: "Peak 120-150 คน",
              title: "การกระจายกำลังคน (Labor S-Curve)",
              desc: "เฉลี่ย <strong>40-50 คน</strong> ในช่วง 3 เดือนแรก (M01-M03) และพุ่งสู่จุดสูงสุด (Peak Manpower) <strong>120-150 คน</strong> ในช่วง M05-M08 งานโครงสร้างเหล็ก, พื้น FS, และหลังคา"
            },
            {
              icon: "👥",
              tag: "6 ทีมช่าง (108 คน)",
              title: "จัดสรร 6 ทีมช่างฝีมือเฉพาะทาง",
              desc: "ตอกเข็ม (6 คน), ผูกเหล็ก/แบบ (30 คน), เทคอนกรีต (20 คน), ประกอบ Cellular Beam เชื่อม 6G (15 คน), ช่างหลังคา (15 คน), พื้น Hardener (12 คน)"
            },
            {
              icon: "📋",
              tag: "Daily 07:45 - 08:00 น.",
              title: "การควบคุมผู้รับเหมาช่วง (Subcontractor)",
              desc: "ตรวจ Pre-qualification, สัญญา Back-to-Back, หัก Retention 5%, ประชุม <strong>Morning Toolbox Talk (07:45 - 08:00 น.)</strong> ทุกวันเพื่อกำกับงานและความปลอดภัย"
            }
          ]
        },
        {
          num: "02",
          title: "แผนจัดส่ง Just-in-Time & Staging",
          subtitle: "การบริหารโลจิสติกส์และการยกของหนักปลอดภัย",
          color: "amber",
          icon: "🚚",
          targetPill: "🎯 เป้าหมาย: ลดความแออัดหน้างาน 10,540 ตร.ม. & ป้องกันวัสดุชำรุด",
          items: [
            {
              icon: "⚡",
              tag: "Staging Gridline 1-4",
              title: "กลยุทธ์จัดส่งแบบ Just-in-Time (JIT)",
              desc: "เพื่อลดความแออัดหน้างาน 10,540 ตร.ม. โดยแบ่งพื้นที่กองเก็บวัสดุ (Staging Area) ที่แนว <strong>Gridline 1-4 ทางเข้าโครงการ</strong> ไม่กีดขวางเส้นทางรถปูนและขนส่ง"
            },
            {
              icon: "🛡️",
              tag: "ยกสูง ≥ 30 ซม. + คลุมผ้าใบ",
              title: "มาตรการปกป้องวัสดุจากสภาพอากาศ",
              desc: "แผ่นเมทัลชีทและฉนวน<strong>ยกสูงจากพื้น ≥ 30 ซม.</strong> คลุมผ้าใบกันฝน, ปูนซีเมนต์เก็บในตู้คอนเทนเนอร์แห้ง, เหล็กเส้น SD40 วางบนหมอนไม้มีผ้าใบคลุมมิดชิด"
            },
            {
              icon: "🏗️",
              tag: "Mobile Crane 50T (ปจ.2)",
              title: "แผนความปลอดภัยยกของหนัก (Heavy Lifting)",
              desc: "กำหนดรัศมีการทำงานของ <strong>Mobile Crane 50 ตัน</strong> ในการยกติดตั้ง Cellular Beam พร้อมกั้นเขตอันตราย (Barricade 100%) และตรวจใบรับรอง ปจ.2 สลิง ทุกครั้ง"
            }
          ]
        },
        {
          num: "03",
          title: "แผนผลิตและประสานแบบ Shop DWG",
          subtitle: "การควบคุมแบบและแก้ปัญหาข้อขัดแย้งข้ามหมวด",
          color: "emerald",
          icon: "📐",
          targetPill: "🎯 เป้าหมาย: Zero Clash & ได้รับอนุมัติล่วงหน้าก่อนสร้าง 2 เดือน",
          items: [
            {
              icon: "🥇",
              tag: "M01 สัปดาห์ 1-2",
              title: "ลำดับความสำคัญของแบบ (Priority Matrix)",
              desc: "เร่งทำแบบฐานรากและเสาเข็ม (SD-01, SD-02) ภายในเดือน <strong>M01 สัปดาห์ 1-2</strong> เพื่อเริ่มงานก่อสร้างได้ทันทีในสัปดาห์ที่ 3-4 ป้องกันเวลาหน้างานสะดุด"
            },
            {
              icon: "🔄",
              tag: "เปิด Sleeves ทะลุคานล่วงหน้า",
              title: "ประสานแบบข้ามหมวด (Clash Detection)",
              desc: "ซ้อนทับแบบโครงสร้าง Cellular Beam (SD-06) ร่วมกับท่อระบายน้ำ/สุขาภิบาล (SD-12, SD-13) เพื่อเปิดช่องท่อ <strong>Sleeves ทะลุคานล่วงหน้า</strong> ป้องกันการสกัด"
            },
            {
              icon: "⏱️",
              tag: "อนุมัติใน 14 วัน (Lead -2M)",
              title: "รอบเวลาอนุมัติแบบ (Turnaround Target)",
              desc: "ส่งแบบล่วงหน้าก่อนเริ่มสร้างจริง 2 เดือน (<strong>-2M Lead Time</strong>) ติดตามที่ปรึกษาให้อนุมัติภายใน <strong>14 วันทำการ</strong> (มี Comment แก้ไขส่งกลับใน 3 วัน)"
            }
          ]
        }
      ]
    }
  },
    {
    id: 19,
    originalId: 12,
    tag: "PRELIMINARY BUDGET & CASH FLOW",
    title: "การบริหารงบเตรียมงานและสำนักงานสนาม (Preliminary Budget)",
    subtitle: "แผนเบิกจ่ายจริงรายเดือน 14 เดือน (Cash Burn-Rate) รวม 8.45 ล้านบาท และมาตรการล็อกงบประมาณ",
    badge: "13% of S+A (65M)",
    type: "burn-chart",
    content: {
      metrics: [
        { label: "งบจัดสรรสนาม (Working Budget)", val: "8.45 ล้าน", sub: "13% ของงบโครงสร้าง 40M + สถาปัตย์ 25M", icon: "💰", color: "blue" },
        { label: "ส่วนต่าง Sell BOQ vs ทำจริง", val: "-1.65 ล้าน", sub: "Sell BOQ ให้ 8% (6.8M) / ชดเชยด้วยกำไรโครงสร้าง", icon: "⚖️", color: "amber" },
        { label: "ช่วงเบิกจ่ายงานโครงสร้างหลัก", val: "850k/เดือน", sub: "M05–M07 งานโครงเหล็ก Cellular & ค.ส.ล. พื้น FS", icon: "🔥", color: "red" },
        { label: "งบเริ่มต้นและรื้อถอนส่งมอบ", val: "970k / 650k", sub: "M01 ตั้งแคมป์-หม้อแปลง / M14 ตรวจ Defect ส่งมอบ", icon: "🏁", color: "emerald" }
      ],
      burnData: PRELIM_BURN,
      strategy: "กลยุทธ์ควบคุมต้นทุน: ทำสัญญาเช่าเหมาจ่ายเครื่องจักรและตู้คอนเทนเนอร์ใน M01 พร้อมล็อก Man-Month บุคลากรประจำสนาม 11 อัตรา ป้องกันปัญหา Overrun"
    }
  },
  {
    id: 20,
    originalId: 26,
    tag: "FINANCIAL LIQUIDITY",
    title: "แผนบริหารกระแสเงินสด (Cash Flow 14 เดือน)",
    subtitle: "แบบจำลองก่อน VAT: เครดิตค่างวด 30 วัน รายจ่ายเชื่อมกับ S-Curve และ Preliminary Burn Rate",
    badge: "Net Cash +19.42 MB",
    type: "cashflow-chart",
    content: {
      basisNote: "ฐานก่อน VAT • เครดิต 30 วัน • M14 สมมติปิดยอดค้างและคืน Retention หลังตรวจรับ/วาง BG",
      notes: [
        { title: "01. ฐานรายรับและเงินล่วงหน้า", desc: `รายรับรวม ${formatMillion(PROJECT_FINANCIALS.sumSell, 3)}M ก่อน VAT; Advance 10.432M (= 11.162M รวม VAT) หักคืน 10% และ Retention 5% จากค่างวดตามฐานก่อน VAT` },
        { title: "02. วงเงินรองรับสภาพคล่อง", desc: `เงินสดสะสมต่ำสุด ${CASH_LOW.m}: ${CASH_LOW.net.toFixed(3)}M จึงต้องเตรียมวงเงินอย่างน้อย ${(Math.ceil(Math.max(0, -CASH_LOW.net) * 1000) / 1000).toFixed(3)}M ตามแบบจำลอง; รายจ่ายสูงสุด ${CASH_PEAK.m}: ${CASH_PEAK.outflow.toFixed(2)}M` },
        { title: "03. ปิดบัญชีและข้อสมมติ", desc: `M14 รับ ${formatMillion(FINAL_RECEIPT, 3)}M รวมคืน Retention 5.216M; จ่ายรวม 84.90M เหลือ 19.418M ก่อน OH ส่วนกลาง/ภาษี หากยอดสุดท้ายรับล่าช้าต้องเลื่อนกระแสเงินสดออกไป` }
      ],
      chartData: CASH_FLOW
    }
  },
  {
    id: 21,
    originalId: 30,
    tag: "PROJECT MANAGEMENT TEAM",
    title: "คณะทำงานและผู้บริหารโครงการ",
    subtitle: "กลุ่มนักศึกษาภาควิชาวิศวกรรมโยธา มหาวิทยาลัยเอเชียอาคเนย์ (SAU)",
    badge: "SAU Civil Engineering",
    type: "team-list",
    content: {
      lead: {
        name: "นาย สิรวิชญ์ หอมสุวรรณ",
        id: "6945810014",
        role: "Project Director / Lead Presenter",
        faculty: "วิศวกรรมโยธา มหาวิทยาลัยเอเชียอาคเนย์",
        avatar: "assets/team/project_director.jpg"
      },
      members: [
        { name: "นาย สิรวิชญ์ หอมสุวรรณ", id: "6945810014", role: "ผู้อำนวยการโครงการ (Project Director)", avatar: "assets/team/project_director.jpg" },
        { name: "นาย สันติ นุ่นเขียว", id: "6945810010", role: "Structural Engineer / BIM Coordinator", avatar: "assets/team/santi_nunkhiao.png" },
        { name: "นาย ภาณุพงศ์ กรสว่าง", id: "6945810003", role: "Cost Control & Quantity Surveyor", avatar: "assets/team/panupong_kornsawang.png" },
        { name: "นาย อภิชาติ คล้ายสุบรรณ", id: "6945810013", role: "MEP Engineer / Planning", avatar: "assets/team/aphichat_khlaisuban.png" },
        { name: "นาย ดนุสรณ์ ดวงทอง", id: "6945810016", role: "QA/QC & HSE Officer", avatar: "assets/team/danusorn_duangthong.jpg" }
      ],
      thankYou: "ขอขอบพระคุณคณะกรรมการและผู้ว่าจ้าง บริษัท เอเชียอาคเนย์ จำกัด"
    }
  }
];
