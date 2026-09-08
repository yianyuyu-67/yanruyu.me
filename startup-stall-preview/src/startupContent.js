import gallery01 from "../assets/henna-gallery/20260907-223503.jpg";
import gallery02 from "../assets/henna-gallery/20260907-223531.jpg";
import gallery03 from "../assets/henna-gallery/20260907-223534.jpg";
import gallery04 from "../assets/henna-gallery/20260907-223538.jpg";
import gallery05 from "../assets/henna-gallery/20260907-223540.jpg";
import gallery06 from "../assets/henna-gallery/20260907-223544.jpg";
import gallery07 from "../assets/henna-gallery/20260907-223547.jpg";
import gallery08 from "../assets/henna-gallery/20260907-223550.jpg";
import gallery09 from "../assets/henna-gallery/20260907-223552.jpg";
import gallery10 from "../assets/henna-gallery/20260907-223556.jpg";
import gallery11 from "../assets/henna-gallery/20260907-223559.jpg";
import gallery12 from "../assets/henna-gallery/20260907-223602.jpg";

const hennaGallery = [gallery01, gallery02, gallery03, gallery04, gallery05, gallery06, gallery07, gallery08, gallery09, gallery10, gallery11, gallery12];

const startupContent = Object.freeze({
  henna: {
    kicker: "小鱼海娜 / 摊位档案",
    title: "海娜与我的摊",
    introTitle: "海娜（Henna）是什么",
    intro: "源自南亚与中东的天然植物染料，研成膏后绘于皮肤，无创无痛，可留存 1~2 周——每个人纹出来的图案都独一无二。",
    stallTitle: "我的摊",
    stallCopy: "从一支笔、一张桌布开始，把短暂的线下相遇变成可以持续复购的体验。",
    stats: [
      { value: "40+", label: "篇小红书笔记" },
      { value: "5w+", label: "累计曝光" },
      { value: "5500+", label: "赞藏" },
    ],
    worksTitle: "作品展示",
    worksNote: "记录每一次出摊、每一笔纹样和遇见的人。",
    works: [],
    gallery: hennaGallery,
  },
  case: {
    kicker: "创业卷宗 / 小鱼海娜",
    title: "从 0 成本接单到日均 1000+ 元——“流量池”的选择有多重要",
    steps: [
      { number: "01", title: "起步", copy: "先用朋友圈 + 学校论坛做线上预约，零场地成本开工；很快发现客群太窄、订单太散，收入有很大涨幅空间。" },
      { number: "02", title: "转向", copy: "决定去线下摆摊，在场地的自然人流中筛选转化客群。" },
      { number: "03", title: "验证", copy: "先后试了什刹海公园、酒馆创意市集、万圣节创意市集，从公园泛人流到主题市集逐个测——实测“高意向垂直场景”的转化远高于“泛流量场景”，最终锁定潘家园鬼市，日均流水 80 → 1000+ 元。" },
      { number: "04", title: "内容侧", copy: "小红书矩阵发布 40+ 篇笔记、累计曝光 5w+、赞藏 5500+，跑通“内容预热 → 线下引流 → 私域沉淀”闭环，沉淀微信好友 100+，复购率做到 40%。" },
    ],
    conclusion: "场景决定人群、机制决定转化、内容决定成本",
  },
});

export default startupContent;
