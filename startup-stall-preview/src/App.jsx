import { useEffect, useRef } from "react";
import ElasticMesh from "./ElasticMesh";
import StartupExperience from "./StartupExperience";
import startupContent from "./startupContent";

import phone from "../assets/sticker-phone.png";
import sign from "../assets/sticker-sign.png";
import paintBlack from "../assets/sticker-paint-black.png";
import paintRed from "../assets/sticker-paint-red.png";
import paintBlue from "../assets/sticker-paint-blue.png";
import paintGreen from "../assets/sticker-paint-green.png";
import paintPurple from "../assets/sticker-paint-purple.png";
import palette from "../assets/sticker-palette.png";
import notebook from "../assets/sticker-notebook.png";
import money from "../assets/sticker-money.png";
import swabs from "../assets/sticker-swabs.png";
import soap from "../assets/sticker-soap.png";
import scene01 from "../assets/photo-scene-01.png";
import scene02 from "../assets/photo-scene-02.png";
import scene03 from "../assets/photo-scene-03.png";
import scene04 from "../assets/photo-scene-04.png";

const photoItems = [
  { className: "sticker-photo-01", image: scene01, place: "什刹海公园", result: "泛流量", success: false },
  { className: "sticker-photo-02", image: scene02, place: "酒馆创意市集", result: "泛流量", success: false },
  { className: "sticker-photo-03", image: scene03, place: "万圣节创意市集", result: "泛流量", success: false },
  { className: "sticker-photo-04", image: scene04, place: "潘家园", result: "垂直场景", success: true },
];

function PhotoSticker({ item }) {
  return (
    <button
      className={`sticker sticker-photo ${item.className}`}
      type="button"
      data-draggable
      data-layout-id={item.className}
      data-flip
      aria-pressed="false"
      aria-label={`${item.place}拍立得，点击翻面`}
    >
      <span className="photo-card">
        <span className="photo-face photo-front"><img src={item.image} alt="" /></span>
        <span className={`photo-face photo-back${item.success ? " photo-back-success" : ""}`}>
          <strong>{item.place}</strong>
          <span>{item.result} <b>{item.success ? "✓" : "×"}</b></span>
          {item.success && <small>日均 1000+</small>}
        </span>
      </span>
    </button>
  );
}

export default function App() {
  const stageRef = useRef(null);
  const isEmbedded = new URLSearchParams(window.location.search).get("embedded") === "1";

  useEffect(() => {
    if (isEmbedded) {
      document.documentElement.classList.add("embedded-page");
      document.body.classList.add("embedded-page");
    }
    const experience = new StartupExperience(stageRef.current).mount();
    window.StartupExperience = StartupExperience;
    window.startupExperience = experience;
    window.startupContent = startupContent;

    return () => {
      experience.destroy();
      if (isEmbedded) {
        document.documentElement.classList.remove("embedded-page");
        document.body.classList.remove("embedded-page");
      }
      if (window.startupExperience === experience) delete window.startupExperience;
    };
  }, [isEmbedded]);

  return (
    <>
      <main ref={stageRef} className={`stall-stage${isEmbedded ? " is-embedded" : ""}`} aria-label="小鱼海娜摆摊物件互动预览">
        <div className="stall-cloth" aria-hidden="true" />
        <ElasticMesh
          className="elastic-mesh-layer"
          aria-hidden="true"
          image=""
          interaction="hover"
          tilt={0}
          shading={1}
          color1="#eed37e"
          color2="#EAB308"
          showGrid
          gridDensity={20}
          gridOpacity={0.28}
          gridColor="#ffffff"
          highlight="#ffffff"
          borderRadius={25}
          stiffness={0.05}
          damping={0.2}
          grabRadius={0.6}
          pull={0.4}
          wobble={5}
          resolution={25}
          enabled
        />
        <div className="stall-shadow" aria-hidden="true" />

        <button className="stall-exit" type="button" aria-label="关闭摊布体验" title="关闭摊布体验">×</button>
        <button className="reset-layout" type="button" aria-label="恢复初始摆放" title="恢复初始摆放">↺</button>

        <section className="stall-layout">
          <div className="sticker sticker-phone" data-draggable data-layout-id="phone" aria-label="小红书主页手机贴图">
            <img src={phone} alt="手机" />
          </div>

          <img className="sticker sticker-sign" data-draggable data-layout-id="sign" data-entry="henna" tabIndex="0" role="button" src={sign} alt="小鱼海娜摊名牌，点击查看介绍" />
          <img className="sticker sticker-paint sticker-paint-black" data-draggable data-layout-id="paint-black" src={paintBlack} alt="黑色海娜颜料管" />
          <img className="sticker sticker-paint sticker-paint-red" data-draggable data-layout-id="paint-red" src={paintRed} alt="红色海娜颜料管" />
          <img className="sticker sticker-paint sticker-paint-blue" data-draggable data-layout-id="paint-blue" src={paintBlue} alt="蓝色海娜颜料管" />
          <img className="sticker sticker-paint sticker-paint-green" data-draggable data-layout-id="paint-green" src={paintGreen} alt="绿色海娜颜料管" />
          <img className="sticker sticker-paint sticker-paint-purple" data-draggable data-layout-id="paint-purple" src={paintPurple} alt="紫色海娜颜料管" />
          <img className="sticker sticker-palette" data-draggable data-layout-id="palette" src={palette} alt="调色盘" />

          {photoItems.map((item) => <PhotoSticker key={item.className} item={item} />)}

          <img className="sticker sticker-notebook" data-draggable data-layout-id="notebook" data-entry="case" tabIndex="0" role="button" src={notebook} alt="摊位笔记本，点击查看创业卷宗" />
          <button className="sticker sticker-money" type="button" data-draggable data-layout-id="money" data-money aria-expanded="false" aria-label="一沓钱，点击查看日流水变化">
            <img src={money} alt="" />
            <span className="money-result" role="status"><span>80</span><b>→</b><strong>1000+</strong><small>元/日</small></span>
          </button>
          <img className="sticker sticker-swabs" data-draggable data-layout-id="swabs" src={swabs} alt="棉签" />
          <img className="sticker sticker-soap" data-draggable data-layout-id="soap" src={soap} alt="洗手液" />
        </section>
      </main>

      <div className="content-overlay" data-content-overlay hidden>
        <div className="content-backdrop" data-close-content />
        <section className="content-panel" role="dialog" aria-modal="true" aria-labelledby="content-panel-title" tabIndex="-1">
          <header className="content-panel-header">
            <div>
              <p className="content-panel-kicker" id="content-panel-kicker" />
              <h2 id="content-panel-title" />
            </div>
            <button className="content-close" type="button" data-close-content aria-label="关闭内容面板" title="关闭">×</button>
          </header>
          <div className="content-panel-body" id="content-panel-body" />
        </section>
      </div>

      <div className="gallery-overlay" data-gallery-overlay hidden>
        <div className="gallery-backdrop" data-close-gallery />
        <section className="gallery-panel" role="dialog" aria-modal="true" aria-labelledby="gallery-title" tabIndex="-1">
          <header className="gallery-header">
            <div>
              <p className="gallery-kicker">小鱼海娜 / 作品档案</p>
              <h2 id="gallery-title">漂移照片墙</h2>
            </div>
            <button className="content-close gallery-close" type="button" data-close-gallery aria-label="关闭照片墙" title="关闭">×</button>
          </header>
          <div className="drift-wall" data-drift-wall aria-label="海娜纹身作品照片墙" />
        </section>
      </div>
    </>
  );
}
