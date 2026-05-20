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

describe('HoopVerse routes', () => {
  it('renders the home route with the charge-shot wall game', () => {
    renderRoute('/');

    expect(screen.getByRole('heading', { name: /Hold-to-shoot basketball/i })).toBeInTheDocument();
    expect(screen.getByRole('application', { name: 'Basketball charge shot game area' })).toBeInTheDocument();
    expect(screen.getAllByText(/WORLD 1/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/SHOOT!/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Click anywhere/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Toggle sound' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset shot' })).toBeInTheDocument();
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
