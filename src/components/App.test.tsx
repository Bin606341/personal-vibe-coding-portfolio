import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

const renderRoute = (path = '/') =>
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AppRoutes />
    </MemoryRouter>,
  );

describe('Portfolio-Bin routes', () => {
  it('renders the portfolio landing as the home route without basketball section navigation', () => {
    renderRoute('/');

    expect(screen.getByText('Portfolio-Bin')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '主导航' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '选择你想看的作品' })).toBeInTheDocument();
    expect(screen.getAllByTestId('portfolio-project-card')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /进入 篮球网站/i })).toHaveAttribute('href', '/basketball');
    expect(screen.getByRole('link', { name: /在线预览 3D小球弹跳/i })).toHaveAttribute(
      'href',
      'https://bouncing-ball-3d.vercel.app/',
    );
    expect(screen.getByRole('link', { name: /在线预览 健身网站/i })).toHaveAttribute(
      'href',
      'https://fitness-website-ih2m66.vercel.app/',
    );
    expect(screen.getByRole('link', { name: /在线预览 聚会游戏图鉴/i })).toHaveAttribute(
      'href',
      'https://party-game-website-ten.vercel.app/',
    );
    expect(screen.queryByRole('application', { name: '篮球蓄力投篮小游戏区域' })).not.toBeInTheDocument();
  });

  it('renders the basketball route with the charge-shot wall game', () => {
    renderRoute('/basketball');

    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /按住蓄力投篮小游戏/i })).toBeInTheDocument();
    expect(screen.getByRole('application', { name: '篮球蓄力投篮小游戏区域' })).toBeInTheDocument();
    expect(screen.getAllByText(/WORLD 1/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/投篮/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/按住球场/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: '切换声音' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重置投篮' })).toBeInTheDocument();
  });

  it('renders current players with a complete 30 team grid', () => {
    renderRoute('/players');

    expect(screen.getByRole('heading', { name: /现役球员区/i })).toBeInTheDocument();
    expect(screen.getAllByText(/30 支 NBA 球队/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId('team-card')).toHaveLength(30);
  });

  it('renders hall of fame filters and legend cards', () => {
    renderRoute('/hall');

    expect(screen.getByRole('heading', { name: /历史名人堂区/i })).toBeInTheDocument();
    expect(screen.getByLabelText('按年代筛选')).toBeInTheDocument();
    expect(screen.getAllByText('Michael Jordan').length).toBeGreaterThanOrEqual(1);
  });

  it('renders training position tabs and drill cards', async () => {
    renderRoute('/training');

    expect(screen.getByRole('heading', { name: /教学区/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'PG' })).toBeInTheDocument();
    expect(screen.getAllByTestId('video-resource-card').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByTestId('inline-media').length).toBeGreaterThanOrEqual(3);

    fireEvent.click(screen.getByRole('tab', { name: 'C' }));

    expect(await screen.findByRole('heading', { name: '篮下卡位' })).toBeInTheDocument();
    expect(screen.getAllByTestId('drill-card').length).toBeGreaterThanOrEqual(3);
  });

  it('renders tactic cards and classic winner content', () => {
    renderRoute('/tactics');
    expect(screen.getByRole('heading', { name: /战术区/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Horns 双高位起手' })).toBeInTheDocument();
    expect(screen.getAllByTestId('video-resource-card').length).toBeGreaterThanOrEqual(1);

    cleanup();

    renderRoute('/clutch');
    expect(screen.getByRole('heading', { name: /历史经典绝杀区/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Shot' })).toBeInTheDocument();
    expect(screen.getAllByTestId('video-resource-card').length).toBeGreaterThanOrEqual(3);
  });
});
