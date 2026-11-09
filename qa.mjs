import fs from 'node:fs';
import path from 'node:path';

let fail = 0;
const ok = (m) => console.log('  PASS ' + m);
const bad = (m) => { console.log('  FAIL ' + m); fail++; };

const dist = path.resolve('dist');
if (!fs.existsSync(dist)) { console.log('dist/ missing - run build first'); process.exit(1); }

const must = ['index.html','rest-area-near-me/index.html','rest-stop-near-me/index.html',
  'highway-rest-area-near-me/index.html','about/index.html','privacy/index.html',
  'methodology/index.html','sitemap.xml','robots.txt','_redirects'];
for (const f of must) {
  fs.existsSync(path.join(dist, f)) ? ok('exists ' + f) : bad('missing ' + f);
}

const corridors = JSON.parse(fs.readFileSync('data/corridors.json','utf8'));
for (const c of corridors) {
  const p = path.join(dist, 'corridor', c.slug, 'index.html');
  fs.existsSync(p) ? ok('corridor ' + c.slug) : bad('corridor missing ' + c.slug);
}

const home = fs.readFileSync(path.join(dist,'index.html'),'utf8');
home.includes('Rest area near me') ? ok('H1 present on home') : bad('H1 missing on home');
home.includes('15 minutes every 2 hours') ? ok('2-hour rule present') : bad('2-hour rule missing');

const sm = fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
const locs = (sm.match(/<loc>/g) || []).length;
locs >= 13 ? ok('sitemap urls: ' + locs) : bad('sitemap too small: ' + locs);

const robots = fs.readFileSync(path.join(dist,'robots.txt'),'utf8');
const hasCrawlDelayDirective = robots.split('\n').some((l) => /^\s*crawl-delay\s*:/i.test(l));
!hasCrawlDelayDirective ? ok('no crawl-delay directive') : bad('crawl-delay directive found');
robots.includes('Sitemap:') ? ok('robots sitemap line') : bad('robots missing sitemap');

// data integrity
const areas = JSON.parse(fs.readFileSync('data/rest-areas.json','utf8'));
areas.every(a => a.source && a.verified_at) ? ok('every stop has source + verified_at') : bad('stop missing source/verified_at');
areas.every(a => (a.lat === null && a.lon === null) || (typeof a.lat === 'number' && typeof a.lon === 'number'))
  ? ok('no half-populated coordinates') : bad('half-populated coordinates found');
areas.every(a => a.lat === null || (a.coord_precision && a.coord_source_url))
  ? ok('every pin is labelled + sourced') : bad('pin without precision/source');

// map must actually be on the corridor pages
const nh44 = fs.readFileSync(path.join(dist,'corridor','nh44','index.html'),'utf8');
nh44.includes('stops-map') ? ok('leaflet map present on corridor page') : bad('leaflet map missing');
const cssFiles = fs.readdirSync(path.join(dist,'_astro')).filter(f => f.endsWith('.css'));
const allCss = cssFiles.map(f => fs.readFileSync(path.join(dist,'_astro',f),'utf8')).join('');
allCss.includes('leaflet-container') ? ok('leaflet css bundled') : bad('leaflet css not bundled');

// body weight rule
allCss.includes('font-weight:500') || allCss.includes('font-weight: 500') ? ok('body weight 500 applied') : bad('body weight not applied');

console.log(fail === 0 ? '\nQA PASSED' : `\nQA FAILED (${fail})`);
process.exit(fail === 0 ? 0 : 1);
