import { ArrowRight, Dumbbell, ExternalLink, Gamepad2, Github, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

type PortfolioProject = {
  title: string;
  category: string;
  summary: string;
  highlights: string[];
  tech: string[];
  preview: string;
  liveUrl: string;
  sourceUrl: string;
  isInternal?: boolean;
  Icon: typeof Trophy;
  accent: 'orange' | 'blue' | 'green';
};

const portfolioProjects: PortfolioProject[] = [
  {
    title: '篮球网站',
    category: 'React 互动内容站',
    summary: '篮球主题前端项目，包含投篮小游戏、球员资料、教学资源、战术内容和经典绝杀页面。',
    highlights: ['React Router 多页面结构', '投篮小游戏与动画反馈', '本地媒体资源与响应式布局'],
    tech: ['React', 'TypeScript', 'Vite', 'Three.js'],
    preview: '/portfolio/basketball-preview.png',
    liveUrl: '/basketball',
    sourceUrl: 'https://github.com/Bin606341/personal-vibe-coding-portfolio',
    isInternal: true,
    Icon: Trophy,
    accent: 'orange',
  },
  {
    title: '3D小球弹跳',
    category: '网页小游戏',
    summary: '一个轻量级 3D 小球弹跳体验，突出物理运动、实时交互和游戏化视觉表达。',
    highlights: ['单页小游戏体验', '运动反馈与场景表现', '静态部署到 Vercel'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    preview: '/portfolio/bouncing-ball-preview.png',
    liveUrl: 'https://bouncing-ball-3d.vercel.app/',
    sourceUrl: 'https://github.com/Bin606341/bouncing-ball-3d',
    Icon: Gamepad2,
    accent: 'blue',
  },
  {
    title: '健身网站',
    category: '静态产品网站',
    summary: '围绕健身内容、动作教学和饮食计划搭建的展示型网站，强调信息层级和视觉完成度。',
    highlights: ['健身内容分区展示', '真实图片与视频资源', '移动端适配'],
    tech: ['HTML', 'CSS', 'JavaScript'],
    preview: '/portfolio/fitness-preview.png',
    liveUrl: 'https://fitness-website-ih2m66.vercel.app/',
    sourceUrl: 'https://github.com/Bin606341/fitness-website',
    Icon: Dumbbell,
    accent: 'green',
  },
];

export const PortfolioLanding = () => (
  <section className="portfolio-landing" aria-labelledby="portfolio-landing-heading">
    <div className="portfolio-landing-inner">
      <div className="portfolio-landing-header">
        <span className="eyebrow">Frontend Portfolio</span>
        <h1 id="portfolio-landing-heading">选择你想看的作品</h1>
        <p>
          这里是我的个人作品集入口。三个项目分别展示 React 互动网站、网页小游戏和静态展示网站，
          点击卡片即可进入对应线上作品。
        </p>
      </div>

      <div className="portfolio-grid">
        {portfolioProjects.map((project) => {
          const Icon = project.Icon;
          const primaryLabel = project.isInternal ? `进入 ${project.title}` : `在线预览 ${project.title}`;
          const primaryContent = (
            <>
              {project.isInternal ? <ArrowRight size={17} aria-hidden="true" /> : <ExternalLink size={17} aria-hidden="true" />}
              <span>{project.isInternal ? '进入作品' : '在线预览'}</span>
            </>
          );

          return (
            <article
              className={`portfolio-project-card accent-${project.accent}`}
              data-testid="portfolio-project-card"
              key={project.title}
            >
              <div className="portfolio-card-preview">
                <img src={project.preview} alt={`${project.title}页面预览`} loading="eager" />
                <div className="portfolio-card-badge">
                  <Icon size={18} aria-hidden="true" />
                  <span>{project.category}</span>
                </div>
              </div>
              <div className="portfolio-card-body">
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
                <ul>
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="tag-row">
                  {project.tech.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="portfolio-actions">
                {project.isInternal ? (
                  <Link aria-label={primaryLabel} to={project.liveUrl}>
                    {primaryContent}
                  </Link>
                ) : (
                  <a aria-label={primaryLabel} href={project.liveUrl} rel="noreferrer" target="_blank">
                    {primaryContent}
                  </a>
                )}
                <a aria-label={`源码 ${project.title}`} href={project.sourceUrl} rel="noreferrer" target="_blank">
                  <Github size={17} aria-hidden="true" />
                  <span>源码</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
