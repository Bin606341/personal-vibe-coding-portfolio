import currentPlayers from './currentPlayers.generated.json';

export type VideoResource = {
  label: string;
  sourceName: string;
  url: string;
  localUrl: string;
  posterUrl: string;
  mediaType: 'video' | 'gif';
};

export type Player = {
  name: string;
  nameCn: string;
  number: string;
  position: string;
  height: string;
  weight: string;
  age?: number;
  experience: string;
  origin: string;
  bio: string;
  stats: string;
  tags: string[];
  imageUrl?: string;
  sourceUrl?: string;
};

export type Team = {
  id: string;
  name: string;
  nameCn: string;
  abbreviation: string;
  city: string;
  conference: 'East' | 'West';
  colors: [string, string];
  players: Player[];
};

export type Drill = {
  name: string;
  useCase: string;
  steps: string[];
  keyPoints: string[];
  mistakes: string[];
  video: VideoResource;
};

export type TrainingPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type Legend = {
  id: string;
  name: string;
  era: string;
  position: string;
  team: string;
  achievementType: string;
  summary: string;
  achievements: string[];
  moments: string[];
};

export type Tactic = {
  id: string;
  name: string;
  situation: string;
  spacing: string;
  movement: string;
  keys: string[];
  video: VideoResource;
  diagramType: 'pick-roll' | 'horns' | 'zone' | 'transition' | 'baseline' | 'motion';
};

export type TacticCategory = {
  id: string;
  name: string;
  description: string;
  tactics: Tactic[];
};

export type ClassicMoment = {
  title: string;
  date: string;
  matchup: string;
  stage: string;
  type: string;
  description: string;
  meaning: string;
  video: VideoResource;
};

export type ClassicPlayer = {
  id: string;
  name: string;
  era: string;
  team: string;
  moments: ClassicMoment[];
};

type DraftDrill = Omit<Drill, 'video'> & { videoLabel: string };
type DraftTactic = Omit<Tactic, 'video'> & { videoLabel: string };
type DraftTacticCategory = Omit<TacticCategory, 'tactics'> & { tactics: DraftTactic[] };
type DraftClassicMoment = Omit<ClassicMoment, 'video'> & { videoLabel: string };
type DraftClassicPlayer = Omit<ClassicPlayer, 'moments'> & { moments: DraftClassicMoment[] };

type OfficialRosterPlayer = {
  personId: number;
  name: string;
  slug: string;
  teamAbbreviation: string;
  jerseyNumber: string;
  position: string;
  height: string;
  weight: string;
  college: string;
  country: string;
  draftYear: number | null;
  draftRound: number | null;
  draftNumber: number | null;
  fromYear: string;
  toYear: string;
  pts: number;
  reb: number;
  ast: number;
};

const teamNbaIds: Record<string, number> = {
  hawks: 1610612737,
  celtics: 1610612738,
  nets: 1610612751,
  hornets: 1610612766,
  bulls: 1610612741,
  cavaliers: 1610612739,
  mavericks: 1610612742,
  nuggets: 1610612743,
  pistons: 1610612765,
  warriors: 1610612744,
  rockets: 1610612745,
  pacers: 1610612754,
  clippers: 1610612746,
  lakers: 1610612747,
  grizzlies: 1610612763,
  heat: 1610612748,
  bucks: 1610612749,
  timberwolves: 1610612750,
  pelicans: 1610612740,
  knicks: 1610612752,
  thunder: 1610612760,
  magic: 1610612753,
  sixers: 1610612755,
  suns: 1610612756,
  'trail-blazers': 1610612757,
  kings: 1610612758,
  spurs: 1610612759,
  raptors: 1610612761,
  jazz: 1610612762,
  wizards: 1610612764,
};

const playerNbaIds: Record<string, number> = {
  'Trae Young': 1629027,
  'Jalen Johnson': 1630552,
  'Jayson Tatum': 1628369,
  'Jaylen Brown': 1627759,
  'Cam Thomas': 1630560,
  'Nic Claxton': 1629651,
  'LaMelo Ball': 1630163,
  'Brandon Miller': 1641706,
  'Coby White': 1629632,
  'Josh Giddey': 1630581,
  'Donovan Mitchell': 1628378,
  'Evan Mobley': 1630596,
  'Anthony Davis': 203076,
  'Kyrie Irving': 202681,
  'Nikola Jokic': 203999,
  'Jamal Murray': 1627750,
  'Cade Cunningham': 1630595,
  'Ausar Thompson': 1641709,
  'Stephen Curry': 201939,
  'Jimmy Butler': 202710,
  'Kevin Durant': 201142,
  'Alperen Sengun': 1630578,
  'Tyrese Haliburton': 1630169,
  'Pascal Siakam': 1627783,
  'Kawhi Leonard': 202695,
  'James Harden': 201935,
  'Luka Doncic': 1629029,
  'LeBron James': 2544,
  'Ja Morant': 1629630,
  'Jaren Jackson Jr.': 1628991,
  'Bam Adebayo': 1628389,
  'Tyler Herro': 1629639,
  'Giannis Antetokounmpo': 203507,
  'Damian Lillard': 203081,
  'Anthony Edwards': 1630162,
  'Rudy Gobert': 203497,
  'Zion Williamson': 1629627,
  'Trey Murphy III': 1630530,
  'Jalen Brunson': 1628973,
  'Karl-Anthony Towns': 1626157,
  'Shai Gilgeous-Alexander': 1628983,
  'Chet Holmgren': 1631096,
  'Paolo Banchero': 1631094,
  'Franz Wagner': 1630532,
  'Joel Embiid': 203954,
  'Tyrese Maxey': 1630178,
  'Devin Booker': 1626164,
  'Jalen Green': 1630224,
  'Scoot Henderson': 1630703,
  'Shaedon Sharpe': 1631101,
  'Domantas Sabonis': 1627734,
  'Zach LaVine': 203897,
  'Victor Wembanyama': 1641705,
  "De'Aaron Fox": 1628368,
  'Scottie Barnes': 1630567,
  'RJ Barrett': 1629628,
  'Lauri Markkanen': 1628374,
  'Keyonte George': 1641718,
  'Alex Sarr': 1642259,
  'Bilal Coulibaly': 1641731,
};

const legendNbaIds: Record<string, number> = {
  'Michael Jordan': 893,
  'Kobe Bryant': 977,
  'Magic Johnson': 77142,
  'Larry Bird': 1449,
  "Shaquille O'Neal": 406,
  'Tim Duncan': 1495,
  'Allen Iverson': 947,
  'Hakeem Olajuwon': 165,
  'LeBron James': 2544,
  'Stephen Curry': 201939,
  'Kevin Durant': 201142,
};

const nbaHeadshot = (id: number) => `/nba/headshots/${id}.png`;

export const getTeamLogoUrl = (teamId: string) => {
  const nbaId = teamNbaIds[teamId];
  return nbaId ? `/nba/logos/${nbaId}.svg` : undefined;
};

export const getLegendImageUrl = (name: string) => {
  const nbaId = legendNbaIds[name];
  return nbaId ? nbaHeadshot(nbaId) : undefined;
};

const player = (
  name: string,
  nameCn: string,
  number: string,
  position: string,
  age: number,
  bio: string,
  tags: string[],
): Player => ({
  name,
  nameCn,
  number,
  position,
  height: '待接入官方 roster',
  weight: '待接入官方 roster',
  age,
  experience: `${Math.max(1, age - 18)} 年经验参考`,
  origin: 'MVP 静态样例',
  bio,
  stats: 'MVP 样例数据，正式版接入官方或授权数据源更新。',
  tags,
  imageUrl: playerNbaIds[name] ? nbaHeadshot(playerNbaIds[name]) : undefined,
  sourceUrl: 'https://www.nba.com/players',
});

const teamShells: Team[] = [
  {
    id: 'hawks',
    name: 'Atlanta Hawks',
    nameCn: '亚特兰大老鹰',
    abbreviation: 'ATL',
    city: 'Atlanta',
    conference: 'East',
    colors: ['#E03A3E', '#C1D32F'],
    players: [
      player('Trae Young', '特雷-杨', '11', 'PG', 27, '以超远投射和挡拆传球带动进攻的核心后卫。', ['远投', '组织', '挡拆']),
      player('Jalen Johnson', '杰伦-约翰逊', '1', 'F', 24, '具备推进、篮板和弱侧终结能力的锋线。', ['转换', '篮板', '锋线组织']),
    ],
  },
  {
    id: 'celtics',
    name: 'Boston Celtics',
    nameCn: '波士顿凯尔特人',
    abbreviation: 'BOS',
    city: 'Boston',
    conference: 'East',
    colors: ['#007A33', '#BA9653'],
    players: [
      player('Jayson Tatum', '杰森-塔图姆', '0', 'SF', 28, '攻防两端稳定的全明星锋线，能持球也能无球终结。', ['单打', '三分', '防守']),
      player('Jaylen Brown', '杰伦-布朗', '7', 'SG/SF', 29, '强壮的侧翼得分手，擅长冲击篮筐和对位防守。', ['突破', '转换', '侧翼防守']),
    ],
  },
  {
    id: 'nets',
    name: 'Brooklyn Nets',
    nameCn: '布鲁克林篮网',
    abbreviation: 'BKN',
    city: 'Brooklyn',
    conference: 'East',
    colors: ['#111111', '#FFFFFF'],
    players: [
      player('Cam Thomas', '卡姆-托马斯', '24', 'SG', 24, '自主得分能力突出的后卫，擅长急停和中距离。', ['持球得分', '急停', '中距离']),
      player('Nic Claxton', '尼克-克拉克斯顿', '33', 'C', 27, '移动能力优秀的护框中锋，能换防到外线。', ['护框', '吃饼', '换防']),
    ],
  },
  {
    id: 'hornets',
    name: 'Charlotte Hornets',
    nameCn: '夏洛特黄蜂',
    abbreviation: 'CHA',
    city: 'Charlotte',
    conference: 'East',
    colors: ['#1D1160', '#00788C'],
    players: [
      player('LaMelo Ball', '拉梅洛-鲍尔', '1', 'PG', 24, '节奏感和传球想象力突出的控卫。', ['传球', '节奏', '超远三分']),
      player('Brandon Miller', '布兰登-米勒', '24', 'SF', 23, '高尺寸侧翼投手，能承担成长型主攻任务。', ['侧翼投射', '无球', '单打']),
    ],
  },
  {
    id: 'bulls',
    name: 'Chicago Bulls',
    nameCn: '芝加哥公牛',
    abbreviation: 'CHI',
    city: 'Chicago',
    conference: 'East',
    colors: ['#CE1141', '#111111'],
    players: [
      player('Coby White', '科比-怀特', '0', 'G', 26, '速度快、投射提升明显的后场得分点。', ['转换', '三分', '突破']),
      player('Josh Giddey', '约什-吉迪', '3', 'G', 23, '高大组织后卫，擅长推进、篮板和传球。', ['组织', '篮板', '推进']),
    ],
  },
  {
    id: 'cavaliers',
    name: 'Cleveland Cavaliers',
    nameCn: '克利夫兰骑士',
    abbreviation: 'CLE',
    city: 'Cleveland',
    conference: 'East',
    colors: ['#860038', '#FDBB30'],
    players: [
      player('Donovan Mitchell', '多诺万-米切尔', '45', 'SG', 29, '爆发力强的后场核心，关键球和突破威胁突出。', ['关键球', '突破', '三分']),
      player('Evan Mobley', '埃文-莫布利', '4', 'PF/C', 24, '覆盖面积大的内线防守者，进攻端持续成长。', ['护框', '协防', '顺下']),
    ],
  },
  {
    id: 'mavericks',
    name: 'Dallas Mavericks',
    nameCn: '达拉斯独行侠',
    abbreviation: 'DAL',
    city: 'Dallas',
    conference: 'West',
    colors: ['#00538C', '#002B5E'],
    players: [
      player('Anthony Davis', '安东尼-戴维斯', '3', 'PF/C', 33, '攻防一体的大个子，护框和中距离终结都很稳定。', ['护框', '低位', '中距离']),
      player('Kyrie Irving', '凯里-欧文', '11', 'PG', 34, '控运技术顶级的后卫，单打和终结手感出色。', ['控运', '单打', '终结']),
    ],
  },
  {
    id: 'nuggets',
    name: 'Denver Nuggets',
    nameCn: '丹佛掘金',
    abbreviation: 'DEN',
    city: 'Denver',
    conference: 'West',
    colors: ['#0E2240', '#FEC524'],
    players: [
      player('Nikola Jokic', '尼古拉-约基奇', '15', 'C', 31, '历史级传球中锋，能从低位、高位和转换中组织全队。', ['高位策应', '低位', '篮板']),
      player('Jamal Murray', '贾马尔-穆雷', '27', 'PG', 29, '季后赛表现突出的后卫，挡拆投篮和关键球能力强。', ['挡拆', '急停', '关键球']),
    ],
  },
  {
    id: 'pistons',
    name: 'Detroit Pistons',
    nameCn: '底特律活塞',
    abbreviation: 'DET',
    city: 'Detroit',
    conference: 'East',
    colors: ['#C8102E', '#1D42BA'],
    players: [
      player('Cade Cunningham', '凯德-坎宁安', '2', 'PG', 24, '高大控卫，兼具持球得分和阵地组织。', ['组织', '中距离', '错位']),
      player('Ausar Thompson', '奥萨尔-汤普森', '9', 'SF', 23, '运动能力出众的锋线，防守覆盖和转换冲击突出。', ['防守', '转换', '篮板']),
    ],
  },
  {
    id: 'warriors',
    name: 'Golden State Warriors',
    nameCn: '金州勇士',
    abbreviation: 'GSW',
    city: 'Golden State',
    conference: 'West',
    colors: ['#1D428A', '#FFC72C'],
    players: [
      player('Stephen Curry', '斯蒂芬-库里', '30', 'PG', 38, '改变篮球空间的历史级射手，仍是体系进攻核心。', ['无球', '三分', '挡拆']),
      player('Jimmy Butler', '吉米-巴特勒', '10', 'SF', 36, '强硬侧翼，擅长造杀伤、低位和关键回合处理。', ['造犯规', '防守', '关键球']),
    ],
  },
  {
    id: 'rockets',
    name: 'Houston Rockets',
    nameCn: '休斯敦火箭',
    abbreviation: 'HOU',
    city: 'Houston',
    conference: 'West',
    colors: ['#CE1141', '#111111'],
    players: [
      player('Kevin Durant', '凯文-杜兰特', '35', 'F', 37, '顶级投射锋线，任何区域都能完成高难度出手。', ['投射', '单打', '关键球']),
      player('Alperen Sengun', '阿尔佩伦-申京', '28', 'C', 23, '脚步细腻的策应中锋，低位和传球都很有威胁。', ['低位', '策应', '篮板']),
    ],
  },
  {
    id: 'pacers',
    name: 'Indiana Pacers',
    nameCn: '印第安纳步行者',
    abbreviation: 'IND',
    city: 'Indiana',
    conference: 'East',
    colors: ['#002D62', '#FDBB30'],
    players: [
      player('Tyrese Haliburton', '泰瑞斯-哈利伯顿', '0', 'PG', 26, '传球视野开阔的控卫，转换和早攻发动能力强。', ['传球', '转换', '三分']),
      player('Pascal Siakam', '帕斯卡尔-西亚卡姆', '43', 'PF', 32, '全能前锋，擅长推进、低位转身和中距离。', ['低位', '转换', '中距离']),
    ],
  },
  {
    id: 'clippers',
    name: 'LA Clippers',
    nameCn: '洛杉矶快船',
    abbreviation: 'LAC',
    city: 'Los Angeles',
    conference: 'West',
    colors: ['#C8102E', '#1D428A'],
    players: [
      player('Kawhi Leonard', '科怀-伦纳德', '2', 'SF', 34, '攻防稳定的侧翼，擅长中距离和对位防守。', ['中距离', '防守', '单打']),
      player('James Harden', '詹姆斯-哈登', '1', 'PG', 36, '挡拆组织和持球投篮经验丰富的后卫。', ['挡拆', '造犯规', '组织']),
    ],
  },
  {
    id: 'lakers',
    name: 'Los Angeles Lakers',
    nameCn: '洛杉矶湖人',
    abbreviation: 'LAL',
    city: 'Los Angeles',
    conference: 'West',
    colors: ['#552583', '#FDB927'],
    players: [
      player('Luka Doncic', '卢卡-东契奇', '77', 'PG/F', 27, '大核持球手，挡拆阅读、后撤步和传球都是顶级。', ['持球大核', '后撤步', '组织']),
      player('LeBron James', '勒布朗-詹姆斯', '23', 'F', 41, '历史级全能前锋，兼具组织、冲击和比赛阅读。', ['全能', '转换', '组织']),
    ],
  },
  {
    id: 'grizzlies',
    name: 'Memphis Grizzlies',
    nameCn: '孟菲斯灰熊',
    abbreviation: 'MEM',
    city: 'Memphis',
    conference: 'West',
    colors: ['#5D76A9', '#12173F'],
    players: [
      player('Ja Morant', '贾-莫兰特', '12', 'PG', 26, '爆发力极强的控卫，突破和空中终结极具观赏性。', ['突破', '快攻', '终结']),
      player('Jaren Jackson Jr.', '小贾伦-杰克逊', '13', 'PF/C', 26, '兼具护框和外线投射的现代内线。', ['护框', '三分', '协防']),
    ],
  },
  {
    id: 'heat',
    name: 'Miami Heat',
    nameCn: '迈阿密热火',
    abbreviation: 'MIA',
    city: 'Miami',
    conference: 'East',
    colors: ['#98002E', '#F9A01B'],
    players: [
      player('Bam Adebayo', '巴姆-阿德巴约', '13', 'C', 28, '移动能力极强的防守中轴，能换防和策应。', ['换防', '策应', '护框']),
      player('Tyler Herro', '泰勒-希罗', '14', 'SG', 26, '投射和持球得分兼备的后卫。', ['投射', '急停', '无球']),
    ],
  },
  {
    id: 'bucks',
    name: 'Milwaukee Bucks',
    nameCn: '密尔沃基雄鹿',
    abbreviation: 'MIL',
    city: 'Milwaukee',
    conference: 'East',
    colors: ['#00471B', '#EEE1C6'],
    players: [
      player('Giannis Antetokounmpo', '扬尼斯-阿德托昆博', '34', 'PF', 31, '冲击力历史级的前锋，转换和篮下压迫感极强。', ['转换', '篮下', '防守']),
      player('Damian Lillard', '达米安-利拉德', '0', 'PG', 35, '超远投射和关键球能力突出的后卫。', ['超远三分', '挡拆', '关键球']),
    ],
  },
  {
    id: 'timberwolves',
    name: 'Minnesota Timberwolves',
    nameCn: '明尼苏达森林狼',
    abbreviation: 'MIN',
    city: 'Minnesota',
    conference: 'West',
    colors: ['#0C2340', '#78BE20'],
    players: [
      player('Anthony Edwards', '安东尼-爱德华兹', '5', 'SG', 24, '力量、弹跳和投射结合的年轻核心。', ['突破', '三分', '防守']),
      player('Rudy Gobert', '鲁迪-戈贝尔', '27', 'C', 33, '多届最佳防守级别的护框中锋。', ['护框', '篮板', '掩护']),
    ],
  },
  {
    id: 'pelicans',
    name: 'New Orleans Pelicans',
    nameCn: '新奥尔良鹈鹕',
    abbreviation: 'NOP',
    city: 'New Orleans',
    conference: 'West',
    colors: ['#0C2340', '#C8102E'],
    players: [
      player('Zion Williamson', '蔡恩-威廉森', '1', 'PF', 25, '篮下冲击力极强的前锋，依靠力量和第一步制造优势。', ['冲击', '篮下', '转换']),
      player('Trey Murphy III', '特雷-墨菲三世', '25', 'SF', 25, '高尺寸射手，适合拉开空间和弱侧终结。', ['三分', '弱侧', '转换']),
    ],
  },
  {
    id: 'knicks',
    name: 'New York Knicks',
    nameCn: '纽约尼克斯',
    abbreviation: 'NYK',
    city: 'New York',
    conference: 'East',
    colors: ['#006BB6', '#F58426'],
    players: [
      player('Jalen Brunson', '杰伦-布伦森', '11', 'PG', 29, '脚步、节奏和中距离非常成熟的后场核心。', ['节奏', '中距离', '关键球']),
      player('Karl-Anthony Towns', '卡尔-安东尼-唐斯', '32', 'C', 30, '具备三分和低位能力的空间型大个子。', ['三分', '低位', '篮板']),
    ],
  },
  {
    id: 'thunder',
    name: 'Oklahoma City Thunder',
    nameCn: '俄克拉荷马城雷霆',
    abbreviation: 'OKC',
    city: 'Oklahoma City',
    conference: 'West',
    colors: ['#007AC1', '#EF3B24'],
    players: [
      player('Shai Gilgeous-Alexander', '谢伊-吉尔杰斯-亚历山大', '2', 'PG', 27, '节奏变化和突破造杀伤顶级的后卫。', ['突破', '中距离', '造犯规']),
      player('Chet Holmgren', '切特-霍姆格伦', '7', 'C', 23, '兼具护框、空间和移动能力的长人。', ['护框', '三分', '顺下']),
    ],
  },
  {
    id: 'magic',
    name: 'Orlando Magic',
    nameCn: '奥兰多魔术',
    abbreviation: 'ORL',
    city: 'Orlando',
    conference: 'East',
    colors: ['#0077C0', '#C4CED4'],
    players: [
      player('Paolo Banchero', '保罗-班凯罗', '5', 'PF', 23, '大体型持球前锋，擅长错位和强攻。', ['错位', '持球', '低位']),
      player('Franz Wagner', '弗朗茨-瓦格纳', '22', 'SF', 24, '技术全面的锋线，能突破、组织和无球终结。', ['突破', '无球', '组织']),
    ],
  },
  {
    id: 'sixers',
    name: 'Philadelphia 76ers',
    nameCn: '费城 76 人',
    abbreviation: 'PHI',
    city: 'Philadelphia',
    conference: 'East',
    colors: ['#006BB6', '#ED174C'],
    players: [
      player('Joel Embiid', '乔尔-恩比德', '21', 'C', 32, '低位、中距离和护框兼备的超级中锋。', ['低位', '中距离', '护框']),
      player('Tyrese Maxey', '泰瑞斯-马克西', '0', 'PG', 25, '速度极快的后卫，擅长突破和外线投射。', ['速度', '三分', '突破']),
    ],
  },
  {
    id: 'suns',
    name: 'Phoenix Suns',
    nameCn: '菲尼克斯太阳',
    abbreviation: 'PHX',
    city: 'Phoenix',
    conference: 'West',
    colors: ['#1D1160', '#E56020'],
    players: [
      player('Devin Booker', '德文-布克', '1', 'SG', 29, '技术细腻的得分后卫，擅长中距离和关键球处理。', ['中距离', '持球', '关键球']),
      player('Jalen Green', '杰伦-格林', '4', 'SG', 24, '爆发力突出的后卫，具备连续得分能力。', ['突破', '急停', '转换']),
    ],
  },
  {
    id: 'trail-blazers',
    name: 'Portland Trail Blazers',
    nameCn: '波特兰开拓者',
    abbreviation: 'POR',
    city: 'Portland',
    conference: 'West',
    colors: ['#E03A3E', '#111111'],
    players: [
      player('Scoot Henderson', '斯库特-亨德森', '00', 'PG', 22, '身体素质出色的年轻控卫，擅长冲击篮筐。', ['突破', '推进', '组织']),
      player('Shaedon Sharpe', '谢登-夏普', '17', 'SG', 22, '弹跳和终结天赋出众的侧翼得分手。', ['终结', '转换', '投射']),
    ],
  },
  {
    id: 'kings',
    name: 'Sacramento Kings',
    nameCn: '萨克拉门托国王',
    abbreviation: 'SAC',
    city: 'Sacramento',
    conference: 'West',
    colors: ['#5A2D81', '#63727A'],
    players: [
      player('Domantas Sabonis', '多曼塔斯-萨博尼斯', '11', 'C', 29, '高位手递手和篮板能力突出的内线。', ['手递手', '篮板', '策应']),
      player('Zach LaVine', '扎克-拉文', '8', 'SG', 31, '运动能力和外线投射兼备的得分后卫。', ['三分', '转换', '终结']),
    ],
  },
  {
    id: 'spurs',
    name: 'San Antonio Spurs',
    nameCn: '圣安东尼奥马刺',
    abbreviation: 'SAS',
    city: 'San Antonio',
    conference: 'West',
    colors: ['#C4CED4', '#111111'],
    players: [
      player('Victor Wembanyama', '维克托-文班亚马', '1', 'C', 22, '身高臂展罕见的攻防核心，护框和空间能力都极强。', ['护框', '三分', '错位']),
      player("De'Aaron Fox", '德阿龙-福克斯', '4', 'PG', 28, '速度极快的后卫，擅长转换和关键时刻突破。', ['速度', '突破', '关键球']),
    ],
  },
  {
    id: 'raptors',
    name: 'Toronto Raptors',
    nameCn: '多伦多猛龙',
    abbreviation: 'TOR',
    city: 'Toronto',
    conference: 'East',
    colors: ['#CE1141', '#111111'],
    players: [
      player('Scottie Barnes', '斯科蒂-巴恩斯', '4', 'F', 24, '全能锋线，能防多个位置并承担组织。', ['全能', '防守', '组织']),
      player('RJ Barrett', 'RJ-巴雷特', '9', 'SG/SF', 25, '左手侧翼得分手，擅长突破和转换。', ['突破', '转换', '侧翼']),
    ],
  },
  {
    id: 'jazz',
    name: 'Utah Jazz',
    nameCn: '犹他爵士',
    abbreviation: 'UTA',
    city: 'Utah',
    conference: 'West',
    colors: ['#002B5C', '#F9A01B'],
    players: [
      player('Lauri Markkanen', '劳里-马尔卡宁', '23', 'PF', 28, '高尺寸空间前锋，投射和空切威胁明显。', ['三分', '空切', '错位']),
      player('Keyonte George', '基扬特-乔治', '3', 'G', 22, '年轻后卫，具备持球投篮和组织潜力。', ['持球', '三分', '组织']),
    ],
  },
  {
    id: 'wizards',
    name: 'Washington Wizards',
    nameCn: '华盛顿奇才',
    abbreviation: 'WAS',
    city: 'Washington',
    conference: 'East',
    colors: ['#002B5C', '#E31837'],
    players: [
      player('Alex Sarr', '亚历克斯-萨尔', '20', 'C', 21, '机动型长人，具备护框和空间化潜力。', ['护框', '移动', '顺下']),
      player('Bilal Coulibaly', '比拉尔-库利巴利', '0', 'SF', 21, '长臂侧翼，防守和转换冲击力突出。', ['防守', '转换', '侧翼']),
    ],
  },
];

const formatDraft = (player: OfficialRosterPlayer) => {
  if (player.draftYear && player.draftRound && player.draftNumber) {
    return `${player.draftYear} 年第 ${player.draftRound} 轮第 ${player.draftNumber} 顺位`;
  }

  return 'NBA.com 未列选秀顺位';
};

const formatExperience = (player: OfficialRosterPlayer) => {
  const from = Number(player.fromYear);
  const to = Number(player.toYear);
  if (Number.isFinite(from) && Number.isFinite(to) && to >= from) {
    return `${to - from + 1} 个赛季`;
  }

  return 'NBA.com 未列经验';
};

const officialRosterByTeam = (currentPlayers.players as OfficialRosterPlayer[]).reduce(
  (teams, player) => {
    const list = teams.get(player.teamAbbreviation) ?? [];
    list.push({
      name: player.name,
      nameCn: player.name,
      number: player.jerseyNumber || '-',
      position: player.position || '-',
      height: player.height || '-',
      weight: player.weight ? `${player.weight} lbs` : '-',
      experience: formatExperience(player),
      origin: `${player.country || 'NBA.com'} · ${player.college || '未列学校'}`,
      bio: `${player.name} 当前列入 NBA.com League Roster，位置为 ${player.position || '未列'}，身高 ${player.height || '未列'}，体重 ${
        player.weight || '未列'
      } lbs。`,
      stats: `NBA.com ${currentPlayers.sourceName} Season: ${player.pts} PPG / ${player.reb} RPG / ${player.ast} APG`,
      tags: [player.position || 'NBA', player.country || 'NBA.com', formatDraft(player)].filter(Boolean),
      imageUrl: nbaHeadshot(player.personId),
      sourceUrl: player.slug ? `https://www.nba.com/player/${player.personId}/${player.slug}` : currentPlayers.sourceUrl,
    });
    teams.set(player.teamAbbreviation, list);
    return teams;
  },
  new Map<string, Player[]>(),
);

export const nbaTeams: Team[] = teamShells.map((team) => ({
  ...team,
  players: officialRosterByTeam.get(team.abbreviation) ?? team.players,
}));

const trainingByPositionDraft: Record<TrainingPosition, DraftDrill[]> = {
  PG: [
    {
      name: '变向运球突破',
      useCase: '面对单防时制造第一步优势。',
      steps: ['降低重心', '外侧脚试探', '球从体前快速换手', '突破后用身体护球'],
      keyPoints: ['眼睛看防守人胸口', '换手后第一步要长', '球不高于腰部'],
      mistakes: ['重心太高', '只换手不变速', '突破路线太横'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '挡拆阅读',
      useCase: '使用中锋掩护后判断投篮、传球或突破。',
      steps: ['等待掩护站稳', '贴肩过掩护', '观察中锋防守位置', '选择顺下传球或急停投篮'],
      keyPoints: ['不要提前启动', '肩膀贴近掩护', '读弱侧协防'],
      mistakes: ['离掩护太远', '只盯篮筐', '传球角度太平'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '突破分球',
      useCase: '吸引协防后找到底角或弱侧队友。',
      steps: ['先攻击禁区', '让协防真正收缩', '跳停保持平衡', '传到底角或弧顶'],
      keyPoints: ['突破要有威胁', '传球前用眼神误导', '落地前确定目标'],
      mistakes: ['过早收球', '传球路线穿越人群', '只找固定队友'],
      videoLabel: '可嵌入教学视频占位',
    },
  ],
  SG: [
    {
      name: '接球投篮',
      useCase: '无球跑位后快速完成外线终结。',
      steps: ['提前准备脚步', '接球同时下沉', '脚尖对篮筐', '顺势起跳出手'],
      keyPoints: ['手脚同步', '接球前看篮筐', '出手点稳定'],
      mistakes: ['接球后再找脚步', '身体后仰', '出手节奏太慢'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '无球跑位',
      useCase: '通过掩护和反跑获得空位。',
      steps: ['先慢走隐藏意图', '贴掩护肩膀通过', '突然加速外弹', '接球后立即判断'],
      keyPoints: ['变速比路线更重要', '贴掩护减少防守空间', '跑位后保持投篮准备'],
      mistakes: ['一直匀速跑', '绕掩护太宽', '接球后停顿'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '急停跳投',
      useCase: '突破中防守退让时制造中距离机会。',
      steps: ['运球加速', '双脚或一二步急停', '核心收紧', '垂直起跳出手'],
      keyPoints: ['急停前先变速', '肩膀保持正对篮筐', '落点稳定'],
      mistakes: ['刹不住向前飘', '急停后球暴露', '只靠手臂发力'],
      videoLabel: '可嵌入教学视频占位',
    },
  ],
  SF: [
    {
      name: '三威胁启动',
      useCase: '侧翼接球后判断投篮、突破或传球。',
      steps: ['接球面筐', '球放在保护侧', '做投篮假动作', '根据防守重心启动'],
      keyPoints: ['动作要能真的投', '第一步攻击防守脚外侧', '保持传球视野'],
      mistakes: ['假动作幅度太虚', '启动前暴露球', '只会右路突破'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '侧翼强突',
      useCase: '从 45 度位置冲击篮筐或制造协防。',
      steps: ['压低肩膀', '第一步切进中线或底线', '第二步护球', '终结或分球'],
      keyPoints: ['先判断底线空间', '用非运球手保护', '靠近篮筐再起跳'],
      mistakes: ['横向运球过多', '没观察协防', '起跳点太远'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '防守轮转',
      useCase: '弱侧协防后补回外线。',
      steps: ['站在球和人之间', '看到突破先收缩', '逼停后外弹', '高举手干扰投篮'],
      keyPoints: ['先保护篮下', '轮转要喊人', '外弹脚步要短快'],
      mistakes: ['只盯自己的人', '协防过深不回位', '扑防直接起跳'],
      videoLabel: '可嵌入教学视频占位',
    },
  ],
  PF: [
    {
      name: '低位脚步',
      useCase: '背身接球后用脚步获得近筐机会。',
      steps: ['卡住深位', '接球确认底线', '肩膀假转', '轴心脚稳定后转身终结'],
      keyPoints: ['先要位再要球', '假动作带动肩膀', '终结时护球'],
      mistakes: ['离篮筐太远', '走步', '只会一侧转身'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '挡拆顺下',
      useCase: '给持球人掩护后攻击篮下。',
      steps: ['站稳掩护', '看持球人方向', '转身面向篮筐', '顺下接球终结'],
      keyPoints: ['掩护角度决定质量', '顺下要看球', '接球前伸手给目标'],
      mistakes: ['移动掩护', '顺下太晚', '接球后放低球'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '中距离短顺下',
      useCase: '对手夹击后在罚球线附近接球处理。',
      steps: ['掩护后短顺到罚球线', '接球面筐', '读底角和篮下', '投篮或分球'],
      keyPoints: ['停在传球窗口', '接球先看弱侧', '动作要果断'],
      mistakes: ['顺到人群里', '接球后背对篮筐', '不看底角'],
      videoLabel: '可嵌入教学视频占位',
    },
  ],
  C: [
    {
      name: '篮下卡位',
      useCase: '保护防守篮板和创造二次进攻。',
      steps: ['出手瞬间找人', '用身体挡住路线', '降低重心', '再起跳抓板'],
      keyPoints: ['先卡人后看球', '手臂展开但不推人', '落点判断要提前'],
      mistakes: ['只看球不找人', '站得太直', '提前起跳'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '护框站位',
      useCase: '面对突破时保护篮筐。',
      steps: ['站在突破线和篮筐之间', '保持垂直起跳', '不主动下压手臂', '落地后找篮板'],
      keyPoints: ['脚步先到位', '手臂垂直', '避免无谓犯规'],
      mistakes: ['追着人跑', '身体前扑', '盖帽后不保护篮板'],
      videoLabel: '可嵌入教学视频占位',
    },
    {
      name: '低位背打',
      useCase: '在禁区附近创造稳定终结。',
      steps: ['深位接球', '背身感受防守重心', '一次强运靠近篮筐', '勾手或转身上篮'],
      keyPoints: ['接球位置越深越好', '不要连续无效运球', '终结手要柔和'],
      mistakes: ['背打区域太远', '低头看球', '终结前暴露球'],
      videoLabel: '可嵌入教学视频占位',
    },
  ],
};

export const hallOfFameLegends: Legend[] = [
  {
    id: 'michael-jordan',
    name: 'Michael Jordan',
    era: '1990s',
    position: 'SG',
    team: 'Chicago Bulls',
    achievementType: 'Championship',
    summary: 'NBA 历史最具代表性的竞争者之一，以得分、防守、关键球和总决赛统治力闻名。',
    achievements: ['6 次 NBA 总冠军', '6 次总决赛 MVP', '5 次常规赛 MVP', '名人堂成员'],
    moments: ['1998 年总决赛关键跳投', '流感之战', 'The Shot'],
  },
  {
    id: 'kobe-bryant',
    name: 'Kobe Bryant',
    era: '2000s',
    position: 'SG',
    team: 'Los Angeles Lakers',
    achievementType: 'Scoring',
    summary: '以脚步、后仰跳投和曼巴精神影响一代球迷的湖人传奇。',
    achievements: ['5 次 NBA 总冠军', '2 次总决赛 MVP', '1 次常规赛 MVP', '名人堂成员'],
    moments: ['81 分之夜', '2010 总决赛抢七', '退役战 60 分'],
  },
  {
    id: 'magic-johnson',
    name: 'Magic Johnson',
    era: '1980s',
    position: 'PG',
    team: 'Los Angeles Lakers',
    achievementType: 'Playmaking',
    summary: 'Showtime Lakers 的核心，以身高、视野和快攻传球重新定义控卫。',
    achievements: ['5 次 NBA 总冠军', '3 次常规赛 MVP', '3 次总决赛 MVP', '名人堂成员'],
    moments: ['新秀赛季总决赛客串中锋', 'Showtime 快攻', '梦一队'],
  },
  {
    id: 'larry-bird',
    name: 'Larry Bird',
    era: '1980s',
    position: 'SF',
    team: 'Boston Celtics',
    achievementType: 'Shooting',
    summary: '凯尔特人传奇前锋，投射、传球、篮板和比赛阅读都极其出色。',
    achievements: ['3 次 NBA 总冠军', '3 次常规赛 MVP', '2 次总决赛 MVP', '名人堂成员'],
    moments: ['三分大赛名场面', '与魔术师的时代对抗', '1986 总冠军'],
  },
  {
    id: 'shaquille-oneal',
    name: "Shaquille O'Neal",
    era: '2000s',
    position: 'C',
    team: 'Los Angeles Lakers',
    achievementType: 'Dominance',
    summary: '巅峰期最具破坏力的内线之一，凭力量和篮下终结统治禁区。',
    achievements: ['4 次 NBA 总冠军', '3 次总决赛 MVP', '1 次常规赛 MVP', '名人堂成员'],
    moments: ['湖人三连冠', '总决赛禁区统治', '与科比组成 OK 组合'],
  },
  {
    id: 'tim-duncan',
    name: 'Tim Duncan',
    era: '2000s',
    position: 'PF',
    team: 'San Antonio Spurs',
    achievementType: 'Fundamentals',
    summary: '基本功扎实、稳定高效的历史级大前锋，是马刺体系的长期基石。',
    achievements: ['5 次 NBA 总冠军', '3 次总决赛 MVP', '2 次常规赛 MVP', '名人堂成员'],
    moments: ['1999 总冠军', '2003 单核季后赛表现', '2014 团队篮球巅峰'],
  },
  {
    id: 'allen-iverson',
    name: 'Allen Iverson',
    era: '2000s',
    position: 'G',
    team: 'Philadelphia 76ers',
    achievementType: 'Culture',
    summary: '以速度、变向和无畏打法影响篮球文化的小个后卫传奇。',
    achievements: ['1 次常规赛 MVP', '4 次得分王', '名人堂成员'],
    moments: ['2001 总决赛第一战', '招牌 crossover', '费城答案时代'],
  },
  {
    id: 'hakeem-olajuwon',
    name: 'Hakeem Olajuwon',
    era: '1990s',
    position: 'C',
    team: 'Houston Rockets',
    achievementType: 'Footwork',
    summary: '脚步华丽、防守覆盖强的中锋，梦幻脚步成为内线教学经典。',
    achievements: ['2 次 NBA 总冠军', '2 次总决赛 MVP', '1 次常规赛 MVP', '名人堂成员'],
    moments: ['1994 与 1995 连冠', '梦幻脚步教学模板', '攻防一体赛季'],
  },
];

const tacticCategoriesDraft: DraftTacticCategory[] = [
  {
    id: 'half-court',
    name: '半场进攻',
    description: '通过站位、掩护和弱侧转移创造高质量出手机会。',
    tactics: [
      {
        id: 'horns-entry',
        name: 'Horns 双高位起手',
        situation: '阵地战开局，需要让持球人有两侧掩护选择。',
        spacing: '两名内线站罚球线两侧，两个射手沉底角，控卫弧顶持球。',
        movement: '控卫选择一侧掩护，另一侧内线外弹或顺下，弱侧射手随防守补位移动。',
        keys: ['双高位角度要站稳', '底角保持空间', '控卫读大个防守位置'],
        videoLabel: '战术视频占位',
        diagramType: 'horns',
      },
    ],
  },
  {
    id: 'pick-roll',
    name: '挡拆战术',
    description: '围绕持球人和掩护人的二人配合制造错位。',
    tactics: [
      {
        id: 'high-pnr',
        name: '高位挡拆',
        situation: '需要核心后卫在弧顶制造投篮或顺下传球。',
        spacing: '三名射手拉开到底角和侧翼，五号位上提掩护。',
        movement: '后卫贴肩过掩护，内线顺下，弱侧根据协防做额外传导。',
        keys: ['持球人贴掩护', '顺下目标明确', '弱侧不能站死'],
        videoLabel: '战术视频占位',
        diagramType: 'pick-roll',
      },
    ],
  },
  {
    id: 'transition',
    name: '快攻转换',
    description: '抢到篮板或完成抢断后，用速度和宽度打未落位防守。',
    tactics: [
      {
        id: 'wide-lanes',
        name: '三线快攻',
        situation: '防守篮板后第一时间推进。',
        spacing: '持球人中路推进，两翼拉边线，大个拖后跟进。',
        movement: '边路提前到底角或篮下，拖后大个可顺下或停在弧顶做二次进攻。',
        keys: ['第一传要快', '两翼必须拉宽', '中路推进不要过早停球'],
        videoLabel: '战术视频占位',
        diagramType: 'transition',
      },
    ],
  },
  {
    id: 'zone-defense',
    name: '区域联防',
    description: '通过区域站位保护禁区并诱导对手投低效率球。',
    tactics: [
      {
        id: 'two-three-zone',
        name: '2-3 区域联防',
        situation: '对手突破强但外线不稳定，或需要保护内线犯规风险。',
        spacing: '两名后卫在上线，三名前场球员覆盖底角、肘区和篮下。',
        movement: '球到侧翼时上线压迫，底角由底线防守人上提，中锋守篮下。',
        keys: ['随球移动形成整体', '保护罚球线', '底角轮转要提前沟通'],
        videoLabel: '战术视频占位',
        diagramType: 'zone',
      },
    ],
  },
  {
    id: 'late-game',
    name: '关键球战术',
    description: '比赛末段通过掩护、误导和空间安排给核心创造最后一投。',
    tactics: [
      {
        id: 'baseline-elevator',
        name: '底线电梯门',
        situation: '边线或底线发球，需要快速给射手创造三分空间。',
        spacing: '两名掩护人站罚球线附近，射手从底线穿过中路。',
        movement: '射手穿过两名掩护人之间，掩护人合拢，接球后快速出手。',
        keys: ['射手启动要突然', '掩护不能移动', '发球路线要提前设计'],
        videoLabel: '战术视频占位',
        diagramType: 'baseline',
      },
    ],
  },
];

const classicPlayersDraft: DraftClassicPlayer[] = [
  {
    id: 'michael-jordan',
    name: 'Michael Jordan',
    era: '1990s',
    team: 'Chicago Bulls',
    moments: [
      {
        title: 'The Shot',
        date: '1989-05-07',
        matchup: 'Bulls vs Cavaliers',
        stage: 'Playoffs',
        type: 'Buzzer Beater',
        description: '乔丹在终场前完成经典跳投，成为季后赛历史名场面。',
        meaning: '标志着乔丹早期季后赛传奇的开始。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '1998 Finals Game 6',
        date: '1998-06-14',
        matchup: 'Bulls vs Jazz',
        stage: 'Finals',
        type: 'Game Winner',
        description: '乔丹抢断后完成中距离反超跳投。',
        meaning: '公牛第二个三连冠的最后一击。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '1997 Finals Game 1',
        date: '1997-06-01',
        matchup: 'Bulls vs Jazz',
        stage: 'Finals',
        type: 'Clutch Shot',
        description: '乔丹在总决赛首战命中制胜中投。',
        meaning: '展现其总决赛关键球稳定性。',
        videoLabel: '公开视频嵌入占位',
      },
    ],
  },
  {
    id: 'kobe-bryant',
    name: 'Kobe Bryant',
    era: '2000s',
    team: 'Los Angeles Lakers',
    moments: [
      {
        title: '2006 Suns Double Clutch',
        date: '2006-04-30',
        matchup: 'Lakers vs Suns',
        stage: 'Playoffs',
        type: 'Game Winner',
        description: '科比在加时命中高难度制胜球。',
        meaning: '体现其季后赛单打和关键球能力。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2009 Heat Buzzer Beater',
        date: '2009-12-04',
        matchup: 'Lakers vs Heat',
        stage: 'Regular Season',
        type: 'Buzzer Beater',
        description: '科比面对韦德防守命中打板三分绝杀。',
        meaning: '常规赛最著名的高难度压哨球之一。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2010 Kings Game Winner',
        date: '2010-01-01',
        matchup: 'Lakers vs Kings',
        stage: 'Regular Season',
        type: 'Game Winner',
        description: '科比在底角命中压哨三分完成绝杀。',
        meaning: '曼巴关键球形象的代表案例。',
        videoLabel: '公开视频嵌入占位',
      },
    ],
  },
  {
    id: 'lebron-james',
    name: 'LeBron James',
    era: '2010s',
    team: 'Cavaliers / Lakers',
    moments: [
      {
        title: '2018 Raptors Bank Shot',
        date: '2018-05-05',
        matchup: 'Cavaliers vs Raptors',
        stage: 'Playoffs',
        type: 'Buzzer Beater',
        description: '詹姆斯全场推进后命中漂移打板绝杀。',
        meaning: '展现其转换推进和高难度终结能力。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2009 Magic Game 2',
        date: '2009-05-22',
        matchup: 'Cavaliers vs Magic',
        stage: 'Playoffs',
        type: 'Buzzer Beater',
        description: '詹姆斯接边线发球命中弧顶三分绝杀。',
        meaning: '年轻时期季后赛关键球代表作。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2018 Pacers Game 5',
        date: '2018-04-25',
        matchup: 'Cavaliers vs Pacers',
        stage: 'Playoffs',
        type: 'Game Winner',
        description: '詹姆斯封盖后回到前场命中压哨三分。',
        meaning: '攻防连续回合决定比赛的经典场面。',
        videoLabel: '公开视频嵌入占位',
      },
    ],
  },
  {
    id: 'stephen-curry',
    name: 'Stephen Curry',
    era: '2010s',
    team: 'Golden State Warriors',
    moments: [
      {
        title: '2016 OKC Deep Three',
        date: '2016-02-27',
        matchup: 'Warriors vs Thunder',
        stage: 'Regular Season',
        type: 'Game Winner',
        description: '库里在超远距离命中加时制胜三分。',
        meaning: '改变外线投篮尺度的代表镜头。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2014 Mavericks Winner',
        date: '2014-04-01',
        matchup: 'Warriors vs Mavericks',
        stage: 'Regular Season',
        type: 'Game Winner',
        description: '库里在加时命中中距离制胜球。',
        meaning: '早期勇士崛起阶段的关键球样本。',
        videoLabel: '公开视频嵌入占位',
      },
      {
        title: '2022 Celtics Game 4 Closing Run',
        date: '2022-06-10',
        matchup: 'Warriors vs Celtics',
        stage: 'Finals',
        type: 'Clutch Shot',
        description: '库里在总决赛关键战连续命中高压投篮。',
        meaning: '奠定 2022 总冠军走势的重要表现。',
        videoLabel: '公开视频嵌入占位',
      },
    ],
  },
];

const trainingMediaByPosition: Record<TrainingPosition, VideoResource[]> = {
  PG: [
    {
      label: 'Dribbling control',
      sourceName: 'YouTube - ILoveBasketballTV',
      url: 'https://www.youtube.com/watch?v=oADaM2L1YLc',
      localUrl: '/media/pg-dribble-control.mp4',
      posterUrl: '/media/pg-dribble-control.jpg',
      mediaType: 'video',
    },
    {
      label: 'Passing window',
      sourceName: 'YouTube - By Any Means Basketball',
      url: 'https://www.youtube.com/watch?v=ciuCQYMKucg',
      localUrl: '/media/pg-passing-window.mp4',
      posterUrl: '/media/pg-passing-window.jpg',
      mediaType: 'video',
    },
    {
      label: 'Pick-and-roll read',
      sourceName: 'YouTube - The Film Room',
      url: 'https://www.youtube.com/watch?v=kx3cEz9ZHNQ',
      localUrl: '/media/pg-pick-roll-read.mp4',
      posterUrl: '/media/pg-pick-roll-read.jpg',
      mediaType: 'video',
    },
  ],
  SG: [
    {
      label: 'Shooting form',
      sourceName: 'YouTube - BreakthroughBBall',
      url: 'https://www.youtube.com/watch?v=akSJjN8UIj0',
      localUrl: '/media/sg-shooting-form.mp4',
      posterUrl: '/media/sg-shooting-form.jpg',
      mediaType: 'video',
    },
    {
      label: 'Pull-up jumper',
      sourceName: 'YouTube - ShotMechanics',
      url: 'https://www.youtube.com/watch?v=eN9ySpzDt0E',
      localUrl: '/media/sg-pull-up-jumper.mp4',
      posterUrl: '/media/sg-pull-up-jumper.jpg',
      mediaType: 'video',
    },
    {
      label: 'Off-ball relocation',
      sourceName: 'YouTube - Dr. Dish Basketball',
      url: 'https://www.youtube.com/watch?v=u26gG3oAXKo',
      localUrl: '/media/sg-off-ball-relocation.mp4',
      posterUrl: '/media/sg-off-ball-relocation.jpg',
      mediaType: 'video',
    },
  ],
  SF: [
    {
      label: 'Triple-threat start',
      sourceName: 'YouTube - NBA India',
      url: 'https://www.youtube.com/watch?v=faSWqXfSZNg',
      localUrl: '/media/sf-triple-threat.mp4',
      posterUrl: '/media/sf-triple-threat.jpg',
      mediaType: 'video',
    },
    {
      label: 'Wing drive finish',
      sourceName: 'YouTube - PGC Coaching',
      url: 'https://www.youtube.com/watch?v=V2-Lj1SuxTU',
      localUrl: '/media/sf-wing-drive-finish.mp4',
      posterUrl: '/media/sf-wing-drive-finish.jpg',
      mediaType: 'video',
    },
    {
      label: 'Closeout defense',
      sourceName: 'YouTube - BreakthroughBBall',
      url: 'https://www.youtube.com/watch?v=P6io-yG7ZAQ',
      localUrl: '/media/sf-closeout-defense.mp4',
      posterUrl: '/media/sf-closeout-defense.jpg',
      mediaType: 'video',
    },
  ],
  PF: [
    {
      label: 'Low-post footwork',
      sourceName: 'YouTube - ShotMechanics',
      url: 'https://www.youtube.com/watch?v=1BkPSQL1ZzM',
      localUrl: '/media/pf-low-post-footwork.mp4',
      posterUrl: '/media/pf-low-post-footwork.jpg',
      mediaType: 'video',
    },
    {
      label: 'Pick-and-roll dive',
      sourceName: 'YouTube - USA Basketball',
      url: 'https://www.youtube.com/watch?v=ffjo8ReDzhA',
      localUrl: '/media/pf-roll-finish.mp4',
      posterUrl: '/media/pf-roll-finish.jpg',
      mediaType: 'video',
    },
    {
      label: 'Short-roll mid-range',
      sourceName: 'YouTube - Detailed Game',
      url: 'https://www.youtube.com/watch?v=5ayTEcFKakk',
      localUrl: '/media/pf-short-roll-midrange.mp4',
      posterUrl: '/media/pf-short-roll-midrange.jpg',
      mediaType: 'video',
    },
  ],
  C: [
    {
      label: 'Box-out positioning',
      sourceName: 'YouTube - BreakthroughBBall',
      url: 'https://www.youtube.com/watch?v=gbb9CoEMF7s',
      localUrl: '/media/c-box-out.mp4',
      posterUrl: '/media/c-box-out.jpg',
      mediaType: 'video',
    },
    {
      label: 'Low-post backdown',
      sourceName: 'YouTube - Pro Training Basketball',
      url: 'https://www.youtube.com/watch?v=DJ0kOypvrDQ',
      localUrl: '/media/c-low-post-backdown.mp4',
      posterUrl: '/media/c-low-post-backdown.jpg',
      mediaType: 'video',
    },
    {
      label: 'Rim-protection stance',
      sourceName: 'YouTube - Shot Science Basketball',
      url: 'https://www.youtube.com/watch?v=HW5QhCSKTsw',
      localUrl: '/media/c-rim-protection.mp4',
      posterUrl: '/media/c-rim-protection.jpg',
      mediaType: 'video',
    },
  ],
};

const tacticMediaResources: VideoResource[] = [
  {
    label: 'Horns offense',
    sourceName: 'YouTube - Coach Josh - Versatile Basketball Training',
    url: 'https://www.youtube.com/watch?v=uKd8JVvtFkE',
    localUrl: '/media/horns-offense.mp4',
    posterUrl: '/media/horns-offense.jpg',
    mediaType: 'video',
  },
  {
    label: 'Pick-and-roll action',
    sourceName: 'YouTube - BasketHead',
    url: 'https://www.youtube.com/watch?v=l_IT_Ddcmzk',
    localUrl: '/media/pick-roll-action.mp4',
    posterUrl: '/media/pick-roll-action.jpg',
    mediaType: 'video',
  },
  {
    label: 'Fast break drill',
    sourceName: 'YouTube - Basketball Coach Allen',
    url: 'https://www.youtube.com/watch?v=8m9GZQP_RbM',
    localUrl: '/media/fast-break-drill.mp4',
    posterUrl: '/media/fast-break-drill.jpg',
    mediaType: 'video',
  },
  {
    label: '2-3 zone movement',
    sourceName: 'YouTube - Upward Sports',
    url: 'https://www.youtube.com/watch?v=Cs2vk3GRU-o',
    localUrl: '/media/zone-perimeter-movement.mp4',
    posterUrl: '/media/zone-perimeter-movement.jpg',
    mediaType: 'video',
  },
  {
    label: 'Elevator screen play',
    sourceName: 'YouTube - Coach Kalogeropoulos Kostas',
    url: 'https://www.youtube.com/watch?v=5ZkPfgAzVNc',
    localUrl: '/media/elevator-screen-play.mp4',
    posterUrl: '/media/elevator-screen-play.jpg',
    mediaType: 'video',
  },
];

const classicMediaResourcesByPlayer: Record<string, VideoResource[]> = {
  'michael-jordan': [
    {
      label: 'The Shot',
      sourceName: 'ESPN Throwback',
      url: 'https://www.youtube.com/watch?v=L1ChoqrQCrE',
      localUrl: '/media/classic-mj-the-shot.mp4',
      posterUrl: '/media/classic-mj-the-shot.jpg',
      mediaType: 'video',
    },
    {
      label: '1998 Finals Game 6',
      sourceName: 'pennyccw',
      url: 'https://www.youtube.com/watch?v=siXP1DNLeOo',
      localUrl: '/media/classic-mj-1998-finals-game6.mp4',
      posterUrl: '/media/classic-mj-1998-finals-game6.jpg',
      mediaType: 'video',
    },
    {
      label: '1997 Finals Game 1',
      sourceName: 'MJ23 His Airness Forever',
      url: 'https://www.youtube.com/watch?v=OTnL4ta0QV0',
      localUrl: '/media/classic-mj-1997-finals-game1.mp4',
      posterUrl: '/media/classic-mj-1997-finals-game1.jpg',
      mediaType: 'video',
    },
  ],
  'kobe-bryant': [
    {
      label: '2006 Suns Double Clutch',
      sourceName: 'Josip Stani',
      url: 'https://www.youtube.com/watch?v=QBvDh9PdlHI',
      localUrl: '/media/classic-kobe-2006-suns.mp4',
      posterUrl: '/media/classic-kobe-2006-suns.jpg',
      mediaType: 'video',
    },
    {
      label: '2009 Heat Buzzer Beater',
      sourceName: 'NBA',
      url: 'https://www.youtube.com/watch?v=Zhtz4MAWs5o',
      localUrl: '/media/classic-kobe-2009-heat.mp4',
      posterUrl: '/media/classic-kobe-2009-heat.jpg',
      mediaType: 'video',
    },
    {
      label: '2010 Kings Game Winner',
      sourceName: 'TheKobeChannel',
      url: 'https://www.youtube.com/watch?v=YVsbPEITvnY',
      localUrl: '/media/classic-kobe-2010-kings.mp4',
      posterUrl: '/media/classic-kobe-2010-kings.jpg',
      mediaType: 'video',
    },
  ],
  'lebron-james': [
    {
      label: '2009 Magic Game 2',
      sourceName: 'ESPN',
      url: 'https://www.youtube.com/watch?v=weKpOu-TUXA',
      localUrl: '/media/classic-lebron-2009-magic.mp4',
      posterUrl: '/media/classic-lebron-2009-magic.jpg',
      mediaType: 'video',
    },
    {
      label: '2018 Raptors Bank Shot',
      sourceName: 'ESPN',
      url: 'https://www.youtube.com/watch?v=Rfsj8zHNfls',
      localUrl: '/media/classic-lebron-2018-raptors.mp4',
      posterUrl: '/media/classic-lebron-2018-raptors.jpg',
      mediaType: 'video',
    },
    {
      label: '2018 Pacers Game 5',
      sourceName: 'ESPN',
      url: 'https://www.youtube.com/watch?v=JYmejM38vKs',
      localUrl: '/media/classic-lebron-2018-pacers.mp4',
      posterUrl: '/media/classic-lebron-2018-pacers.jpg',
      mediaType: 'video',
    },
  ],
  'stephen-curry': [
    {
      label: '2016 Thunder Deep Three',
      sourceName: 'NBA',
      url: 'https://www.youtube.com/watch?v=GEMVGHoenXM',
      localUrl: '/media/classic-curry-2016-thunder.mp4',
      posterUrl: '/media/classic-curry-2016-thunder.jpg',
      mediaType: 'video',
    },
    {
      label: '2014 Mavericks Winner',
      sourceName: 'Jerel Young',
      url: 'https://www.youtube.com/watch?v=5L0m7jnjXPY',
      localUrl: '/media/classic-curry-2014-mavericks.mp4',
      posterUrl: '/media/classic-curry-2014-mavericks.jpg',
      mediaType: 'video',
    },
    {
      label: '2022 Celtics Closing Run',
      sourceName: 'NBA',
      url: 'https://www.youtube.com/watch?v=EvS0sr2eEnk',
      localUrl: '/media/classic-curry-2022-celtics.mp4',
      posterUrl: '/media/classic-curry-2022-celtics.jpg',
      mediaType: 'video',
    },
  ],
};

const attachVideo = <T extends { videoLabel: string }>(
  item: T,
  video: VideoResource,
  label: string = item.videoLabel,
): Omit<T, 'videoLabel'> & {
  video: VideoResource;
} => {
  const { videoLabel, ...rest } = item;
  return {
    ...rest,
    video: {
      ...video,
      label,
    },
  };
};

export const trainingByPosition = Object.fromEntries(
  (Object.entries(trainingByPositionDraft) as [TrainingPosition, DraftDrill[]][]).map(([position, drills]) => [
    position,
    drills.map((drill, index) => attachVideo(drill, trainingMediaByPosition[position][index], drill.name)),
  ]),
) as Record<TrainingPosition, Drill[]>;

export const tacticCategories: TacticCategory[] = tacticCategoriesDraft.map((category, categoryIndex) => ({
  ...category,
  tactics: category.tactics.map((tactic) =>
    attachVideo(tactic, tacticMediaResources[categoryIndex], tactic.name) as Tactic,
  ),
}));

export const classicPlayers: ClassicPlayer[] = classicPlayersDraft.map((player) => ({
  ...player,
  moments: player.moments.map((moment, momentIndex) =>
    attachVideo(moment, classicMediaResourcesByPlayer[player.id][momentIndex], moment.title) as ClassicMoment,
  ),
}));

export const dataSourceNote =
  `Current players data comes from NBA.com League Roster cache (${currentPlayers.sourceName}, ${currentPlayers.generatedAt} generated, local cache of ${currentPlayers.playerCount} players). Team logos and headshots use the NBA CDN cache. Training, tactics, and classic sections now use section-specific locally cached videos, and each resource keeps its source page in the url field.`;

