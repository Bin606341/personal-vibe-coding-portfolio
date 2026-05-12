# HoopVerse Basketball Site Design

## Product Goal

HoopVerse is an immersive basketball knowledge website. The home page should immediately attract users with a playable 3D seaside sunset court, while the content pages help users learn NBA teams, current players, Hall of Fame legends, position fundamentals, full-court tactics, and classic game winners.

## MVP Scope

The MVP uses a balanced approach:

- Build the complete 3D home experience and all five content sections.
- Show all 30 NBA team entries.
- Provide structured player, Hall of Fame, tutorial, tactic, and classic shot data.
- Prefer reliable public references and legal video embeds or placeholders.
- Keep live data synchronization, backend CMS, and advanced interactive tactic boards out of the first version.

## Target Users

The site targets mixed basketball users:

- Young basketball fans who respond to game-like visual experiences.
- NBA fans who want browsable team, player, and legend information.
- Basketball beginners who want position-specific skills and tactic explanations.
- Users interested in NBA history and classic moments.

## Visual Direction

The visual direction is realistic scene plus stylized character plus energetic UI:

- Home scene: seaside court, sunset, ocean, sky glow, court lights, hoop, and interactive entry objects.
- Character: stylized 3D basketball player, not fully realistic but clearly dimensional.
- UI: dark court-night base, basketball orange, gold accents, sea blue, controlled purple glow, and readable cards.
- Content pages: visually strong but structured for scanning and learning.

## Home Page

The home page is an immersive navigation scene, not a marketing landing page.

Required interactions:

- Arrow keys move the player around the court.
- `D` triggers a shot.
- The basketball follows a visible flight arc.
- Shot feedback appears near the hoop.
- Five scene entries are reachable by walking near them.
- `Enter` enters the highlighted section.
- A fixed top navigation remains available so users are never trapped by the 3D interaction.

Scene entries:

- Current Players: team logo wall or team showcase board.
- Hall of Fame: memorial wall or honor corridor.
- Training: training equipment zone.
- Tactics: coach board zone.
- Classic Game Winners: replay screen zone.

## Current Players

The section starts with a 30-team NBA grid. Team cards show hover scale, glow, and subtle shake. Clicking a team opens the team roster view.

Player cards include:

- Photo or stylized placeholder.
- Name.
- Number.
- Position.
- Height.
- Weight.
- Age.
- Country or school.
- Short bio.
- Key stat line.
- Play-style tags.

The MVP includes static curated data and is structured so deeper or live data can be added later.

## Hall of Fame

The section uses a legend wall plus filters.

Filters:

- Era.
- Position.
- Representative team.
- Achievement type.

Legend detail includes:

- Career summary.
- Main achievements.
- Representative teams.
- Signature moments.
- Hall of Fame context.

## Training

Training uses position tabs: PG, SG, SF, PF, and C.

Each position has at least three action cards. Each action card includes:

- Name.
- Use case.
- Steps.
- Key points.
- Common mistakes.
- Legal video embed link or placeholder.

## Tactics

Tactics combine video, tactic diagrams, and text.

Tactic categories:

- Half-court offense.
- Transition.
- Pick and roll.
- Off-ball movement.
- Zone defense.
- Late-game sets.

Each tactic card includes:

- Name.
- Situation.
- Simplified court diagram.
- Player spacing.
- Movement explanation.
- Execution keys.
- Legal video embed link or placeholder.

## Classic Game Winners

Classic game winners are organized by player, with supporting filters.

Filters:

- Era.
- Team.
- Regular season, playoffs, or finals.
- Buzzer beater, clutch shot, or game winner.

Each moment includes:

- Title.
- Date.
- Matchup.
- Stage.
- Description.
- Video embed or external link.
- Historical meaning.

## Acceptance Criteria

- The 3D court renders on desktop and mobile widths without a blank canvas.
- Arrow keys move the character.
- `D` triggers a shot animation and feedback.
- Moving near each entry highlights it and `Enter` navigates to the matching page.
- Top navigation reaches all five sections.
- All 30 NBA teams appear in the current players grid.
- Team cards have hover motion and open roster views.
- Hall of Fame page has legend cards, filters, and details.
- Training page has five position tabs and at least three action cards per position.
- Tactics page has categories, tactic diagrams, and card detail.
- Classic winners page is player-led and supports filters.
- Text does not overlap or overflow on normal desktop and mobile viewports.
- Build, tests, and browser smoke checks pass before claiming completion.

