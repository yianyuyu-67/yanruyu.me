// Content and interaction contracts shared by the main scene and its panels.
// Keeping these values outside the renderer makes copy and routing changes local.
export const InteractionMode = Object.freeze({
  MAIN: 'MAIN', BOARD_FOCUS: 'BOARD_FOCUS', INTERNSHIP_PANEL: 'INTERNSHIP_PANEL',
  CASE_FILES_PANEL: 'CASE_FILES_PANEL', CABINET_FOCUS: 'CABINET_FOCUS', SKILL_PANEL: 'SKILL_PANEL',
  FOLDER_SELECT: 'FOLDER_SELECT', PORTFOLIO_FULLSCREEN: 'PORTFOLIO_FULLSCREEN',
  STARTUP_FOCUS: 'STARTUP_FOCUS', STARTUP_OPEN: 'STARTUP_OPEN', STARTUP_DETAIL: 'STARTUP_DETAIL',
  DESK_FOCUS: 'DESK_FOCUS', THEATRE_PANEL: 'THEATRE_PANEL', MESSAGE_PANEL: 'MESSAGE_PANEL',
  PROFILE_PANEL: 'PROFILE_PANEL', LANYARD_PANEL: 'LANYARD_PANEL', LAMP_ON: 'LAMP_ON', LAMP_OFF: 'LAMP_OFF'
});

export const theatreProjects = Object.freeze([
  { title: '校园剧本杀舞台', time: '项目经历', role: '舞台统筹与视觉记录', description: '舞台执行、道具协作与现场记录。' },
  { title: '原创话剧项目', time: '项目经历', role: '制作支持', description: '从排练到演出现场的制作支持。' },
  { title: '舞美记录', time: '项目经历', role: '影像与资料整理', description: '整理舞台资料并沉淀为可复用素材。' }
]);

export const detailCopyMap = Object.freeze({
  profile: '个人资料：姓名、技能、兴趣和联系方式。',
  'clue-board': '三段实习经历线索板：地图、照片和时间线将在此展开。',
  'clue-paper': '线索纸张：可替换为对应经历的详细说明。',
  'skill-book': '技能档案：软件工具、视觉表达与项目协作能力。',
  'archive-cabinet': '档案柜：简历、个人档案、技能与作品集。',
  'startup-crate': '创业档案箱：海娜纹身与校园剧本杀项目记录。',
  'phone-camera': '自媒体经历：手机与相机拍摄、剪辑和发布记录。',
  typewriter: '匿名留言板入口：打字机上的来信与线索。',
  newspaper: '话剧舞台项目：三段演出制作与舞美记录。',
  lamp: '桌面台灯：暖黄色工作光源。'
});

export const portfolioEntries = Object.freeze([
  { id: 'poster', title: '海报', folderTitle: 'POSTER', folderSubtitle: '海报作品', color: '#1E32EB', titleColor: '#D6F427', titleScale: 1.55, description: '海报作品集：品牌视觉、活动传播与信息层级的整理。', placeholder: '海报作品页面' },
  { id: 'vibecoding', title: 'vibecoding', folderTitle: 'VIBE\nCODING', folderSubtitle: '互动作品', color: '#C9F21A', titleColor: '#1331C7', titleScale: 1.28, titleLineHeight: 1.02, description: 'Vibe Coding：用代码快速搭建、验证并打磨可交互的产品想法。', placeholder: 'Vibe Coding 作品页面' },
  { id: 'illustration', title: '插画', folderTitle: 'ILLUSTRATION', folderSubtitle: '插画作品', color: '#151217', titleColor: '#FF5D55', titleScale: 0.72, description: '插画作品集：从概念草图到成稿的视觉探索与素材归档。', placeholder: '插画作品页面' }
]);

export const focusViewForInteraction = Object.freeze({
  'clue-board': 'clueBoardView', 'clue-paper': 'clueBoardView',
  'archive-cabinet': 'archiveCabinetView', 'skill-book': 'archiveCabinetView',
  'startup-crate': 'startupBoxView', typewriter: 'deskView', newspaper: 'deskView',
  lamp: 'deskView', desk: 'deskView', 'sign-window': 'leftPlaqueView', 'photo-frame': 'photoFrameView'
});
