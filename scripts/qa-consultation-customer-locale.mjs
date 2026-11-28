import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const project = path.resolve(process.env.QA_CONSULTATION_ROOT || process.cwd());
const requireProject = createRequire(path.join(project, 'package.json'));
const ts = requireProject('typescript');
const React = requireProject('react');
const { renderToStaticMarkup } = requireProject('react-dom/server');
const output = process.env.QA_CONSULTATION_OUTPUT;
const receipts = [], failures = [];
const state = { locale: 'en', user: { id: 'fixture-owner', role: 'USER', email: 'fictional@example.test' }, bookings: [] };
const box = tag => function FixtureBox({ children, asChild, ...props }) { return asChild ? React.cloneElement(React.Children.only(children), props) : React.createElement(tag, props, children); };
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} }; cache.set(file, loadedModule);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true
  }}).outputText;
  const localRequire = name => {
    if (name === 'server-only') return {};
    if (name === 'next/headers') return { cookies: async () => ({ get: key => key === 'naksharix-language' ? { value: state.locale } : undefined }) };
    if (name === 'next/navigation') return { redirect: url => { throw Error('REDIRECT:' + url); } };
    if (name === 'next/link') return { __esModule: true, default: box('a') };
    if (name === '@/lib/auth/jwt') return { getCurrentUser: async () => state.user };
    if (name === '@/lib/db') return { prisma: { consultationBooking: {
      findUnique: async ({ where }) => state.bookings.find(b => b.id === where.id) ?? null,
      findMany: async ({ where }) => { assert.equal(where.userId, state.user.id); return state.bookings.filter(b => b.userId === where.userId); }
    } } };
    if (name === '@/lib/seo') return { seo: input => input };
    if (name === '@/components/section') return { Section: box('section') };
    if (name === '@/components/ui/card') return { Card: box('section'), CardContent: box('div'), CardHeader: box('div'), CardTitle: box('h2') };
    if (name === '@/components/ui/button') return { Button: box('button') };
    if (name === '@/components/language-provider') return { useLanguage: () => ({ locale: state.locale }) };
    if (name === '@/lib/security/csrf') return { secureFetch: () => { throw Error('Server render must not send a review'); } };
    if (name === 'lucide-react') return { Star: () => null, Video: () => null };
    if (name.startsWith('@/')) {
      const base = path.join(project, name.slice(2));
      const found = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(fs.existsSync);
      if (!found) throw Error('Missing source module ' + name);
      return load(found);
    }
    return requireProject(name);
  };
  new Function('module', 'exports', 'require', compiled)(loadedModule, loadedModule.exports, localRequire);
  return loadedModule.exports;
}
const pages = {
  success: load(path.join(project, 'app/consultation/success/[id]/page.tsx')),
  bookings: load(path.join(project, 'app/dashboard/bookings/page.tsx')),
  history: load(path.join(project, 'app/dashboard/consultations/page.tsx'))
};
const fixture = (status, paymentStatus, meetingLink = 'https://meet.google.com/abc-defg-hij') => ({
  id: 'fixture-booking', userId: 'fixture-owner', astrologerProfile: { displayName: 'Fictional Astrologer' },
  status, paymentStatus, mode: 'VIDEO', scheduledAt: new Date('2026-11-26T10:00:00.000Z'), durationMins: 30,
  metadata: { meetingLink, customerEmail: 'fictional@example.test', adminBypass: paymentStatus === 'ADMIN_BYPASS' },
  birthName: 'Fictional Person', birthDate: new Date('1992-05-18T00:00:00Z'), birthTime: '08:15', birthPlace: 'Delhi', question: 'Fictional question', reviews: []
});
async function render(which) { return renderToStaticMarkup(await pages[which].default({ params: Promise.resolve({ id: 'fixture-booking' }) })); }
function check(name, fn) { try { fn(); receipts.push({ name, passed: true }); } catch (e) { failures.push({ name, error: e.message }); } }
function plain(html) { return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
const expected = {
  en: { bookings: 'My Bookings', history: 'Consultation History', requested: 'Your booking request has been received', closed: 'Your consultation booking has been closed', scheduled: 'Your consultation is scheduled', accepted: 'Your consultation request has been accepted', empty: 'No consultation bookings yet.', signIn: 'Sign in', paid: 'Paid', privacy: 'The meeting is hosted by a third party.', pending: 'Payment is pending.', rating: 'Rate your consultation' },
  hi: { bookings: 'मेरी बुकिंग', history: 'परामर्श का इतिहास', requested: 'आपका बुकिंग अनुरोध मिल गया है', closed: 'आपकी परामर्श बुकिंग बंद हो गई है', scheduled: 'आपके परामर्श का समय तय है', accepted: 'आपका परामर्श अनुरोध स्वीकार हो गया है', empty: 'अभी कोई परामर्श बुकिंग नहीं है।', signIn: 'प्रवेश करें', paid: 'भुगतान हो गया', privacy: 'बैठक किसी अन्य सेवा पर होगी।', pending: 'भुगतान लंबित है।', rating: 'अपने परामर्श को अंक दें' },
  hinglish: { bookings: 'Meri bookings', history: 'Pichhle consultations', requested: 'Aapki booking request mil gayi hai', closed: 'Aapki consultation booking band ho gayi hai', scheduled: 'Aapke consultation ka samay tay hai', accepted: 'Aapki consultation request sweekar ho gayi hai', empty: 'Abhi koi consultation booking nahi hai.', signIn: 'Sign in karein', paid: 'Payment ho gaya', privacy: 'Meeting ek third-party service par hogi.', pending: 'Payment baaki hai.', rating: 'Apne consultation ko rating dein' }
};
const scenarios = [
  { name: 'paid-request-awaits-approval', status: 'REQUESTED', payment: 'PAID', join: false, title: 'requested' },
  { name: 'paid-rejection-not-confirmed', status: 'REJECTED', payment: 'PAID', join: false, title: 'closed' },
  { name: 'accepted-unpaid-no-room', status: 'ACCEPTED', payment: 'PENDING', join: false, title: 'accepted' },
  { name: 'confirmed-paid-room', status: 'CONFIRMED', payment: 'PAID', join: true, title: 'scheduled' },
  { name: 'accepted-free-room', status: 'ACCEPTED', payment: 'FREE', join: true, title: 'accepted' },
  { name: 'accepted-admin-test-room', status: 'ACCEPTED', payment: 'ADMIN_BYPASS', join: true, title: 'accepted' },
  { name: 'javascript-url-rejected', status: 'CONFIRMED', payment: 'PAID', link: 'javascript:alert(1)', join: false, title: 'scheduled' },
  { name: 'unapproved-host-rejected', status: 'CONFIRMED', payment: 'PAID', link: 'https://unapproved.example.test/session', join: false, title: 'scheduled' },
  { name: 'pending-recovery-preserved', status: 'REQUESTED', payment: 'PENDING', join: false, title: 'requested' }
];
if (process.argv.includes('--baseline')) {
  for (const row of scenarios.filter(s => ['paid-request-awaits-approval', 'paid-rejection-not-confirmed', 'accepted-unpaid-no-room', 'javascript-url-rejected'].includes(s.name))) {
    state.bookings = [fixture(row.status, row.payment, row.link)];
    const which = row.name.startsWith('paid-') ? 'success' : 'bookings';
    const html = await render(which);
    check('baseline/' + row.name, () => {
      if (which === 'success') assert.ok(!plain(html).includes('Your Consultation has been Secured!'), plain(html).slice(0, 220));
      else assert.ok(!html.includes('<a href="' + state.bookings[0].metadata.meetingLink + '"'), 'Ineligible or unsafe meeting URL is rendered');
    });
  }
} else {
  for (const locale of ['en', 'hi', 'hinglish']) {
    state.locale = locale;
    for (const row of scenarios) {
      state.bookings = [fixture(row.status, row.payment, row.link)];
      for (const which of ['success', 'bookings', 'history']) {
        const html = await render(which), text = plain(html);
        check(`${locale}/${which}/${row.name}`, () => {
          assert.equal(/<a[^>]+href="https:\/\/meet\.google\.com\/abc-defg-hij"/.test(html), row.join);
          assert.ok(!html.includes('href="javascript:'));
          assert.ok(!html.includes('href="https://unapproved.example.test'));
          assert.ok(!/\b(REQUESTED|REJECTED|ACCEPTED|CONFIRMED|ADMIN_BYPASS|PENDING|PAID)\b/.test(text), 'Raw backend status leaked');
          assert.ok(text.includes('3:30'), 'IST slot time was lost');
          if (which === 'success') {
            assert.equal(plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''), expected[locale][row.title]);
            assert.ok(html.includes('href="/dashboard/bookings"') && html.includes('href="/consultation"'));
            if (['requested', 'closed'].includes(row.title) || row.name === 'accepted-unpaid-no-room') assert.ok(!text.includes(expected[locale].scheduled));
          } else assert.ok(text.includes(expected[locale][which]));
          if (row.name === 'accepted-unpaid-no-room' && which !== 'history') assert.ok(!text.includes(expected[locale].paid));
          if (which === 'history' && row.join) assert.ok(text.includes(expected[locale].privacy));
          if (which === 'bookings' && row.name === 'pending-recovery-preserved') assert.ok(text.includes(expected[locale].pending));
        });
      }
    }
    for (const which of ['bookings', 'history']) {
      state.bookings = [];
      check(`${locale}/${which}/empty`, () => {});
      const empty = plain(await render(which));
      assert.ok(empty.includes(expected[locale].empty));
      state.user = null;
      const login = await render(which);
      check(`${locale}/${which}/signed-out`, () => { assert.ok(plain(login).includes(expected[locale].signIn)); assert.ok(login.includes(which === 'bookings' ? 'href="/login"' : 'href="/auth/login"')); });
      state.user = { id: 'fixture-owner', role: 'USER', email: 'fictional@example.test' };
      state.bookings = [fixture('COMPLETED', 'PAID')];
      const review = await render(which);
      check(`${locale}/${which}/completed-review`, () => { assert.ok(review.includes('<form')); assert.ok(plain(review).includes(expected[locale].rating)); });
      state.bookings[0].reviews = [{ rating: 4, body: 'Fictional review' }];
      const rated = await render(which);
      check(`${locale}/${which}/review-already-recorded`, () => { assert.ok(!rated.includes('<form')); assert.ok(plain(rated).includes('4')); });
      check(`${locale}/${which}/metadata`, () => {});
      const metadata = await pages[which].generateMetadata();
      assert.ok(metadata.title.includes(expected[locale][which]));
    }
  }
  state.user = null;
  await assert.rejects(() => render('success'), /REDIRECT:\/login$/);
  receipts.push({ name: 'success/signed-out-redirect', passed: true });
  state.user = { id: 'another-user', role: 'USER', email: 'another@example.test' };
  state.bookings = [fixture('CONFIRMED', 'PAID')];
  await assert.rejects(() => render('success'), /REDIRECT:\/astrologers$/);
  receipts.push({ name: 'success/ownership-redirect', passed: true });
}

if (!process.argv.includes('--server-only') && !process.argv.includes('--baseline')) {
  const { chromium } = requireProject('playwright');
  const { expect } = requireProject('@playwright/test');
  const files = ['components/consultation-review-form.tsx', 'lib/consultations/customer-copy.ts', 'lib/consultations/slot-time.ts'];
  const modules = files.map(file => JSON.stringify('@/' + file.replace(/\.tsx?$/, '')) + ':function(module,exports,require){' + ts.transpileModule(fs.readFileSync(path.join(project, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, esModuleInterop: true }}).outputText + '}').join(',');
  const bundle = `(()=>{const modules={${modules}},cache={};const box=tag=>({children,...props})=>React.createElement(tag,props,children);function require(name){if(name==='react')return React;if(name==='lucide-react')return {Star:()=>null};if(name==='@/components/ui/button')return {Button:box('button')};if(name==='@/components/ui/textarea')return {Textarea:box('textarea')};if(name==='@/components/language-provider')return {useLanguage:()=>({locale:window.caseState.locale})};if(name==='@/lib/security/csrf')return {secureFetch:async(url,options)=>{window.calls.push({url,...options});await new Promise(resolve=>window.releaseRequest=resolve);const state=window.caseState;if(state.networkError)throw Error('synthetic network failure');return {ok:state.status===200,status:state.status,json:async()=>{if(state.badJson)throw Error('synthetic invalid JSON');return state.status===200?(state.ack??{data:{review:{id:'fixture-review',consultationBookingId:'fixture-booking',rating:3}}}):{error:state.error};}};}};if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unconfigured dependency '+name);const module={exports:{}};cache[name]=module;modules[name](module,module.exports,require);return module.exports;}let root;window.mountCase=input=>{if(root)root.unmount();window.caseState=input;window.calls=[];root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(require('@/components/consultation-review-form').ConsultationReviewForm,{bookingId:'fixture-booking'}));};window.changeLocale=locale=>{window.caseState.locale=locale;root.render(React.createElement(require('@/components/consultation-review-form').ConsultationReviewForm,{bookingId:'fixture-booking'}));};})();`;
  const errors = [], browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => route.abort());
    await page.setContent('<!doctype html><html><body><div id="root"></div></body></html>');
    for (const name of ['react', 'react-dom']) await page.addScriptTag({ path: path.join(path.dirname(requireProject.resolve(name + '/package.json')), 'umd', name + '.development.js') });
    await page.addScriptTag({ content: bundle });
    const messages = {
      en: ['Your consultation rating has been saved.', 'Please sign in to review a consultation.', 'Refresh this page and try submitting your review again.', 'This booking could not be found. Check your bookings before trying again.', 'You can review a consultation after it is completed.', 'Choose a rating from 1 to 5 and keep feedback within 800 characters.', 'Please wait a moment before submitting another review.', 'Could not save rating. Please try again.', 'We could not confirm that your rating was saved. Check your bookings before trying again.'],
      hi: ['आपके परामर्श के अंक सहेज लिए गए हैं।', 'परामर्श की समीक्षा के लिए कृपया प्रवेश करें।', 'यह पृष्ठ फिर खोलें और समीक्षा दोबारा जमा करें।', 'यह बुकिंग नहीं मिली। फिर प्रयास करने से पहले अपनी बुकिंग देखें।', 'परामर्श पूरा होने के बाद आप समीक्षा दे सकते हैं।', '1 से 5 के बीच अंक चुनें और प्रतिक्रिया 800 अक्षरों के भीतर रखें।', 'अगली समीक्षा जमा करने से पहले थोड़ी देर प्रतीक्षा करें।', 'अंक सहेजे नहीं जा सके। कृपया फिर प्रयास करें।', 'आपके अंक सहेजे जाने की पुष्टि नहीं हो सकी। फिर प्रयास करने से पहले अपनी बुकिंग देखें।'],
      hinglish: ['Aapke consultation ki rating save ho gayi hai.', 'Consultation ka review dene ke liye sign in karein.', 'Yeh page refresh karein aur review dobara jama karein.', 'Yeh booking nahi mili. Phir koshish karne se pehle apni bookings dekhein.', 'Consultation poora hone ke baad aap review de sakte hain.', '1 se 5 ke beech rating chunein aur feedback 800 characters tak rakhein.', 'Agla review jama karne se pehle thodi der rukein.', 'Rating save nahi ho paayi. Kripya phir koshish karein.', 'Aapki rating save hone ki pushti nahi ho saki. Phir koshish karne se pehle apni bookings dekhein.']
    };
    const outcomes = [{ status: 200, expected: 0 },
      { status: 200, badJson: true, expected: 8 },
      { status: 200, ack: {}, expected: 8 },
      { status: 200, ack: { data: { review: { id: '', consultationBookingId: 'fixture-booking', rating: 3 } } }, expected: 8 },
      { status: 200, ack: { data: { review: { id: 'fixture-review', consultationBookingId: 'another-booking', rating: 3 } } }, expected: 8 },
      { status: 200, ack: { data: { review: { id: 'fixture-review', consultationBookingId: 'fixture-booking', rating: 5 } } }, expected: 8 }, { status: 401, expected: 1 }, { status: 403, expected: 2 }, { status: 404, expected: 3 }, { status: 422, error: 'Reviews are available after a completed consultation', expected: 4 }, { status: 422, error: 'Validation failed', expected: 5 }, { status: 429, expected: 6 }, { status: 500, error: 'PRIVATE_INTERNAL_FAILURE', expected: 7 }, { status: 500, badJson: true, expected: 7 }, { status: 0, networkError: true, expected: 7 }];
    for (const locale of ['en', 'hi', 'hinglish']) for (const outcome of outcomes) {
      await page.evaluate(input => window.mountCase(input), { locale, ...outcome });
      await expect(page.getByText(expected[locale].rating, { exact: true })).toBeVisible();
      const stars = page.getByRole('group').getByRole('button');
      await stars.nth(2).click(); await expect(stars.nth(2)).toHaveAttribute('aria-pressed', 'true');
      await page.locator('textarea').fill('Fictional feedback');
      await expect(page.locator('textarea')).toHaveAttribute('maxlength', '800');
      await page.locator('form').evaluate(form => {
        window.ReactDOM.unstable_batchedUpdates(() => { form.requestSubmit(); form.requestSubmit(); });
      });
      await expect(page.locator('button[type=submit]')).toBeDisabled();
      await expect(stars.nth(2)).toBeDisabled();
      await page.locator('form').evaluate(form => form.requestSubmit());
      assert.equal(await page.evaluate(() => window.calls.length), 1);
      const sent = await page.evaluate(() => window.calls[0]);
      assert.equal(sent.url, '/api/consultation-bookings/review'); assert.equal(sent.method, 'POST');
      assert.deepEqual(JSON.parse(sent.body), { bookingId: 'fixture-booking', rating: 3, body: 'Fictional feedback' });
      await page.evaluate(() => window.releaseRequest());
      await expect(page.getByRole('status')).toHaveText(messages[locale][outcome.expected]);
      await expect(page.locator('button[type=submit]')).toBeEnabled();
      await expect(page.getByText('PRIVATE_INTERNAL_FAILURE', { exact: true })).toHaveCount(0);
      if (outcome.expected === 0) {
        const next = locale === 'hi' ? 'hinglish' : 'hi';
        await page.evaluate(value => window.changeLocale(value), next);
        await expect(page.getByRole('status')).toHaveText(messages[next][0]);
      }
      receipts.push({ name: `client/${locale}/${outcome.status}/${outcome.badJson ? 'invalid-json' : outcome.networkError ? 'network-error' : outcome.ack ? JSON.stringify(outcome.ack) : outcome.expected}`, passed: true });
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
}
const result = { scope: 'Actual server-page React renders with fixture auth/database/cookie adapters; actual review component, submission handler and error mapping in Chromium with isolated presentation/context and controlled network responses. No live database, provider or customer-message claim.', source: project, passed: receipts.length, failed: failures.length, receipts, failures };
if (output) fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ passed: result.passed, failed: result.failed, failures: result.failures }));
if (failures.length) process.exitCode = 1;
