import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const base = new URL(process.env.AUTH_E2E_BASE_URL || "http://127.0.0.1:3000");
const dbUrl = new URL(process.env.DATABASE_URL || "postgresql://none:none@invalid/none");
if (process.env.CI !== "true" || base.protocol !== "http:" ||
  !["localhost", "127.0.0.1"].includes(base.hostname) ||
  !["localhost", "127.0.0.1"].includes(dbUrl.hostname) ||
  dbUrl.pathname !== "/naksharix" || !process.env.JWT_SECRET) {
  throw new Error("AUTH_E2E_REFUSED: requires CI localhost app and disposable localhost DB");
}
const prisma = new PrismaClient();
const unique = randomUUID().slice(0, 12);
const email = "qa-user-" + unique + "@example.test";
const astroEmail = "qa-astro-" + unique + "@example.test";
const adminEmail = "qa-admin-" + unique + "@example.test";
const password = "E2e!" + randomUUID() + "abc";
const testCode = "734928";
const usersToClean = new Set();
let csrf, csrfCookie, userCookie, adminCookie, astroCookie;
let userId, astroId, adminId, astroProfileId, bookingId, reportId;
let passed = 0, failed = 0;
async function req(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try { return await fetch(new URL(path, base), { redirect: "manual", signal: controller.signal, ...options }); }
  finally { clearTimeout(timer); }
}
async function post(path, body, session = "", method = "POST") {
  return req(path, { method, headers: { "content-type": "application/json", "x-csrf-token": csrf, cookie: [csrfCookie, session].filter(Boolean).join("; ") }, body: JSON.stringify(body) });
}
async function check(name, action) {
  try { await action(); passed++; console.log("AUTH_ROLE_PASS " + name); }
  catch (e) { failed++; console.error("AUTH_ROLE_FAIL " + name + ": " + (e?.stack || e)); }
}
try {
  const tokenResponse = await req("/api/csrf");
  assert.equal(tokenResponse.status, 200);
  csrf = (await tokenResponse.json()).data.csrfToken;
  csrfCookie = (tokenResponse.headers.get("set-cookie") || "").split(";")[0];
  assert.ok(csrf && csrfCookie);

  await check("signup creates OTP and no login session", async () => {
    const res = await post("/api/auth/signup", { name: "QA User", email, password, role: "USER", locale: "en" });
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    assert.equal(body.data?.verificationRequired, true);
    assert.equal(body.data?.deliverySent, false, "CI intentionally disables real email");
    assert.doesNotMatch(res.headers.get("set-cookie") || "", /naksharix_session/);
    userId = body.data.user.id; usersToClean.add(userId);
    const otp = await prisma.otpToken.findFirst({ where: { userId, purpose: "EMAIL_VERIFY" } });
    assert.ok(otp && !otp.consumedAt && otp.expiresAt > new Date());
  });
  await check("unverified login denied", async () => {
    const res = await post("/api/auth/login", { email, password, roleIntent: "USER", loginMode: "USER" });
    const body = await res.json();
    assert.equal(res.status, 403, JSON.stringify(body));
    assert.equal(body.details?.code, "EMAIL_VERIFICATION_REQUIRED");
  });
  await check("wrong OTP rejected then test-only OTP hash injected in disposable DB", async () => {
    const res = await post("/api/auth/otp/verify", { email, code: "000000" });
    assert.equal(res.status, 400);
    const row = await prisma.otpToken.findFirstOrThrow({ where: { userId, purpose: "EMAIL_VERIFY", consumedAt: null } });
    assert.equal(row.attempts, 1);
    const digest = createHmac("sha256", process.env.JWT_SECRET)
      .update("EMAIL_VERIFY:" + email + ":" + testCode).digest("hex");
    await prisma.otpToken.update({ where: { id: row.id }, data: { codeHash: digest } });
  });
  await check("valid OTP consumed and authenticated session issued", async () => {
    const res = await post("/api/auth/otp/verify", { email, code: testCode });
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.equal(body.data?.verified, true);
    userCookie = (res.headers.get("set-cookie") || "").split(";")[0];
    assert.match(userCookie, /naksharix_session=/);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.ok(u.emailVerifiedAt && u.emailVerified);
    const otp = await prisma.otpToken.findFirstOrThrow({ where: { userId, purpose: "EMAIL_VERIFY" } });
    assert.ok(otp.consumedAt);
    const me = await req("/api/auth/me", { headers: { cookie: userCookie } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).data.user.id, userId);
  });
  await check("OTP replay rejected", async () => {
    assert.equal((await post("/api/auth/otp/verify", { email, code: testCode })).status, 400);
  });
  await check("regular user denied admin API and astrologer management", async () => {
    for (const path of ["/api/admin/analytics", "/api/admin/report-requests", "/api/admin/bookings", "/api/admin/readiness"]) {
      const res = await req(path, { headers: { cookie: userCookie } });
      assert.ok([403, 404].includes(res.status), path + " returned " + res.status);
    }
    assert.equal((await post("/api/admin/astrologers/review", { profileId: "none", action: "APPROVE" }, userCookie)).status, 403);
    assert.equal((await post("/api/astrologer/availability", { dayOfWeek: 2, startTime: "11:00", endTime: "11:30" }, userCookie)).status, 403);
  });
  await check("admin has authenticated access to actual admin data", async () => {
    const hash = await bcrypt.hash(password, 12);
    const u = await prisma.user.create({ data: { email: adminEmail, name: "QA Admin", role: "ADMIN", passwordHash: hash, emailVerified: new Date(), emailVerifiedAt: new Date() } });
    adminId = u.id; usersToClean.add(adminId);
    const res = await post("/api/auth/login", { email: adminEmail, password, roleIntent: "USER", loginMode: "USER" });
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    adminCookie = (res.headers.get("set-cookie") || "").split(";")[0];
    for (const path of ["/api/admin/analytics", "/api/admin/bookings", "/api/admin/report-requests", "/api/admin/readiness"]) {
      const view = await req(path, { headers: { cookie: adminCookie } });
      assert.equal(view.status, 200, path + " HTTP " + view.status);
    }
  });
  await check("admin operational readiness view uses real checks without sample metrics", async () => {
    const response = await req("/admin/readiness", { headers: { cookie: adminCookie } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes("System Readiness"));
    assert.ok(html.includes("Production database"));
    assert.ok(html.includes("Distributed Redis"));
    assert.ok(html.includes("Learning and Puja schema"), "new tables are shown in operator readiness");
    const schemaRes = await req("/api/admin/readiness", { headers: { cookie: adminCookie } });
    assert.equal(schemaRes.status, 200);
    const schemaJson = await schemaRes.json();
    assert.equal(schemaJson.data.services.databaseSchema.ready, true);
    assert.equal(schemaJson.data.services.databaseSchema.missingCount, 0);
    assert.equal(schemaJson.data.services.monitoring.provider, "console_safe_logger",
      "Sentry config alone must not claim an active SDK");

    assert.ok(!html.includes("ci-secret-ci-secret"), "sensitive environment output not allowed");
    const publicRes = await req("/admin/readiness");
    const publicBody = await publicRes.text();
    assert.ok([302, 303, 307, 308].includes(publicRes.status) ||
      (publicRes.status === 200 && publicBody.includes("NEXT_REDIRECT")),
      "unauthenticated admin view must redirect");
    assert.ok(!publicBody.includes("Production database"), "admin diagnostics cannot render anonymously");
  });
  await check("astrologer signup creates pending private profile", async () => {
    const res = await post("/api/auth/signup", { name: "QA Astrologer", email: astroEmail, password, role: "ASTROLOGER", locale: "en" });
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    astroId = body.data.user.id; usersToClean.add(astroId);
    const profile = await prisma.astrologerProfile.findUniqueOrThrow({ where: { userId: astroId } });
    astroProfileId = profile.id;
    assert.equal(profile.status, "PENDING_REVIEW");
    const view = await req("/astrologers");
    assert.equal(view.status, 200);
    assert.ok(!(await view.text()).includes("QA Astrologer"));
  });
  await check("admin approves profile and public listing includes it", async () => {
    const res = await post("/api/admin/astrologers/review", { profileId: astroProfileId, action: "APPROVE" }, adminCookie);
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.equal(body.data.profile.status, "APPROVED");
    const view = await req("/astrologers");
    assert.equal(view.status, 200);
    assert.ok((await view.text()).includes("QA Astrologer"));
  });
  await check("verified astrologer login and availability slot creation", async () => {
    await prisma.user.update({ where: { id: astroId }, data: { emailVerified: new Date(), emailVerifiedAt: new Date() } });
    const login = await post("/api/auth/login", { email: astroEmail, password, roleIntent: "ASTROLOGER", loginMode: "ASTROLOGER" });
    const loginBody = await login.json();
    assert.equal(login.status, 200, JSON.stringify(loginBody));
    astroCookie = (login.headers.get("set-cookie") || "").split(";")[0];
    const slot = await post("/api/astrologer/availability", { dayOfWeek: 2, startTime: "11:00", endTime: "11:30", consultationType: "CHAT", isActive: true, status: "ONLINE" }, astroCookie);
    assert.equal(slot.status, 201, await slot.text());
  });
  await check("expert credentials need independent admin review before public reviewed badge", async () => {
    const credentials = "/api/astrologer/credentials";
    const reviewApi = "/api/admin/astrologers/credentials";
    const invalidActor = await post(credentials, {
      credentialName: "Professional Astronomy Certificate",
      issuer: "Example Academy", issuedYear: 2024,
      referenceUrl: "https://example.org/credentials/example"
    }, userCookie);
    assert.equal(invalidActor.status, 403);
    const firstProfile = await req("/astrologers/" + astroProfileId);
    const firstHtml = await firstProfile.text();
    assert.equal(firstProfile.status, 200);
    assert.ok(firstHtml.includes("credentials unverified"), "Public page incorrectly claims verified expert");
    const malicious = await post(credentials, {
      credentialName: "Professional Astronomy Certificate",
      issuer: "Example Academy", issuedYear: 2024,
      referenceUrl: "http://localhost/admin"
    }, astroCookie);
    assert.equal(malicious.status, 422);
    const evidence = {
      credentialName: "Professional Astronomy Certificate",
      issuer: "Example Academy", issuedYear: 2024,
      referenceUrl: "https://example.org/credentials/example"
    };
    const submitted = await post(credentials, evidence, astroCookie);
    assert.equal(submitted.status, 200, await submitted.text());
    const stored = await prisma.astrologerProfile.findUniqueOrThrow({
      where: { id: astroProfileId }, select: { certificates: true }
    });
    assert.equal(stored.certificates.reviewStatus, "PENDING");
    const selfReview = await post(reviewApi, {
      profileId: astroProfileId, decision: "DOCUMENTS_REVIEWED",
      note: "This account cannot approve its own evidence."
    }, astroCookie);
    assert.equal(selfReview.status, 404);
    const staffReview = await post(reviewApi, {
      profileId: astroProfileId, decision: "DOCUMENTS_REVIEWED",
      note: "Reviewed public credential evidence manually in disposable CI fixture."
    }, adminCookie);
    assert.equal(staffReview.status, 200, await staffReview.text());
    const publicAfter = await req("/astrologers/" + astroProfileId);
    const publicHtml = await publicAfter.text();
    assert.equal(publicAfter.status, 200);
    assert.ok(publicHtml.includes("Professional documents reviewed by Naksharix"));
    assert.ok(!publicHtml.includes(evidence.referenceUrl),
      "Private credential reference leaked onto public page");
  });

  await check("user booking persists correct IST time without payment bypass", async () => {
    const slot = await prisma.availabilitySlot.findFirstOrThrow({ where: { astrologerProfileId: astroProfileId } });
    const res = await post("/api/consultation-bookings", {
      astrologerProfileId: astroProfileId, slotId: slot.id, bookingDate: "2027-01-05",
      customerName: "QA User", customerEmail: email, question: "What should I understand before planning my career?"
    }, userCookie);
    const body = await res.json();
    assert.equal(res.status, 201, JSON.stringify(body));
    assert.equal(body.data.booking.paymentStatus, "PENDING");
    assert.equal(body.data.booking.status, "REQUESTED");
    assert.equal(body.data.booking.scheduledAt, "2027-01-05T05:30:00.000Z");
    bookingId = body.data.booking.id;
    const b = await prisma.consultationBooking.findUniqueOrThrow({ where: { id: bookingId } });
    assert.equal(b.userId, userId);
  });
  await check("legacy Google OAuth aliases cannot bypass NextAuth or redirect off-site", async () => {
    const start = await req("/api/auth/google?next=https%3A%2F%2Fevil.example");
    assert.equal(start.status, 307);
    const location = new URL(start.headers.get("location") || "", base);
    assert.equal(location.protocol, "http:");
    assert.ok(["localhost", "127.0.0.1"].includes(location.hostname), "OAuth alias redirected off localhost");
    assert.equal(location.port, base.port);
    assert.equal(location.pathname, "/auth/login");
    const callback = await req("/api/auth/google/callback?code=forged&state=%2Fadmin");
    assert.equal(callback.status, 410);
    assert.doesNotMatch(callback.headers.get("set-cookie") || "", /naksharix_session/);
  });
  await check("second unpaid booking of same astrologer slot is rejected", async () => {
    const slot = await prisma.availabilitySlot.findFirstOrThrow({ where: { astrologerProfileId: astroProfileId } });
    const collision = await post("/api/consultation-bookings", {
      astrologerProfileId: astroProfileId, slotId: slot.id, bookingDate: "2027-01-05",
      customerName: "QA User", customerEmail: email,
      question: "Please check that this pending slot cannot be sold twice."
    }, userCookie);
    assert.equal(collision.status, 409, await collision.text());
    const active = await prisma.consultationBooking.count({
      where: { astrologerProfileId: astroProfileId, scheduledAt: new Date("2027-01-05T05:30:00.000Z"),
        status: { in: ["REQUESTED", "ACCEPTED", "CONFIRMED", "COMPLETED"] } }
    });
    assert.equal(active, 1);
  });
  await check("concurrent booking requests serialize to one active reservation", async () => {
    const slot = await prisma.availabilitySlot.findFirstOrThrow({ where: { astrologerProfileId: astroProfileId } });
    const requestBody = {
      astrologerProfileId: astroProfileId, slotId: slot.id, bookingDate: "2027-01-12",
      customerName: "QA User", customerEmail: email,
      question: "Concurrent appointment reservation must never create two active bookings."
    };
    const pair = await Promise.all([
      post("/api/consultation-bookings", requestBody, userCookie),
      post("/api/consultation-bookings", requestBody, userCookie)
    ]);
    const statuses = pair.map((res) => res.status).sort((a, b) => a - b);
    assert.deepEqual(statuses, [201, 409], "concurrent booking responses must be 201 and 409");
    const count = await prisma.consultationBooking.count({
      where: { astrologerProfileId: astroProfileId, scheduledAt: new Date("2027-01-12T05:30:00.000Z"),
        status: { in: ["REQUESTED", "ACCEPTED", "CONFIRMED", "COMPLETED"] } }
    });
    assert.equal(count, 1, "concurrent reservations wrote multiple active bookings");
  });
  await check("unpaid booking cannot be accepted by astrologer", async () => {
    const res = await post("/api/astrologer/bookings/action", { bookingId, action: "ACCEPT" }, astroCookie);
    assert.equal(res.status, 409, "unpaid booking accepted: " + await res.text());
  });


  await check("consultation session link is role-scoped and stored only for confirmed bookings", async () => {
    const fixture = await prisma.consultationBooking.create({
      data: {
        userId, astrologerProfileId: astroProfileId, mode: "VIDEO",
        status: "CONFIRMED", paymentStatus: "ADMIN_BYPASS", amount: 0,
        scheduledAt: new Date("2027-06-12T08:00:00.000Z"), durationMins: 30,
        question: "Private audiovisual booking coordination acceptance fixture."
      }
    });
    const unauthorizedNotes = await post("/api/astrologer/notes", {
      userId, title: "Owner-only private note", body: "Only the linked astrologer may write this context.", private: true
    }, userCookie);
    assert.equal(unauthorizedNotes.status, 403);
    const publicNote = await post("/api/astrologer/notes", {
      userId, title: "Insecure visibility", body: "This must never become public.", private: false
    }, astroCookie);
    assert.equal(publicNote.status, 422);
    const eligibleNote = await post("/api/astrologer/notes", {
      userId, title: "Private case context", body: "This note is restricted to the booked astrologer.", private: true
    }, astroCookie);
    assert.equal(eligibleNote.status, 201, await eligibleNote.text());
    const noteRow = await prisma.astrologerNote.findFirstOrThrow({
      where: { astrologerProfileId: astroProfileId, userId, title: "Private case context" }
    });
    assert.equal(noteRow.private, true);
    const endpoint = "/api/consultations/session-link";
    const meetingLink = "https://meet.jit.si/naksharix-qa-" + unique;
    const anon = await req(endpoint + "?bookingId=" + encodeURIComponent(fixture.id));
    assert.equal(anon.status, 401);
    const deniedWrite = await post(endpoint, { bookingId: fixture.id, meetingLink }, userCookie);
    assert.equal(deniedWrite.status, 404, "Customer must not assign provider links");
    for (const malicious of [
      "javascript:alert(1)", "https://evil.example/room",
      "https://meet.jit.si.evil.example/room",
      "https://user@meet.jit.si/room",
      "http://meet.jit.si/room"
    ]) {
      const response = await post(endpoint, { bookingId: fixture.id, meetingLink: malicious }, astroCookie);
      assert.equal(response.status, 422, "Unsafe meeting provider accepted: " + malicious);
    }
    const saved = await post(endpoint, { bookingId: fixture.id, meetingLink }, astroCookie);
    assert.equal(saved.status, 200, await saved.text());
    const ownerRead = await req(endpoint + "?bookingId=" + fixture.id, {
      headers: { cookie: userCookie }
    });
    const ownerData = await ownerRead.json();
    assert.equal(ownerRead.status, 200);
    assert.equal(ownerData.data.assigned, true);
    assert.equal(ownerData.data.meetingLink, meetingLink);
    assert.equal(ownerData.data.providerReady, false, "No unverified third-party provider uptime claim");
    const astrologerRead = await req(endpoint + "?bookingId=" + fixture.id, {
      headers: { cookie: astroCookie }
    });
    assert.equal(astrologerRead.status, 200);
    const unpaid = await post(endpoint, { bookingId, meetingLink }, astroCookie);
    assert.equal(unpaid.status, 409, "Unpaid customer booking assigned an active meeting room");
    const unpaidRead = await req(endpoint + "?bookingId=" + bookingId, {
      headers: { cookie: userCookie }
    });
    const unpaidData = await unpaidRead.json();
    assert.equal(unpaidRead.status, 200);
    assert.equal(unpaidData.data.meetingLink, null);
    const customerDashboard = await req("/dashboard/consultations", {
      headers: { cookie: userCookie }
    });
    const rendered = await customerDashboard.text();
    assert.equal(customerDashboard.status, 200);
    assert.ok(rendered.includes(meetingLink), "Customer could not view assigned provider room");
  });

  await check("verified consultation review appears only in its astrologer's private dashboard", async () => {
    const denied = await req("/astrologer/reviews", { headers: { cookie: userCookie } });
    const deniedHtml = await denied.text();
    assert.ok([302, 303, 307, 308].includes(denied.status) || (denied.status === 200 && deniedHtml.includes("NEXT_REDIRECT") && !deniedHtml.includes("Latest Client Reviews")), "role authorization response unexpected");
    const anonymous = await req("/astrologer/reviews");
    assert.ok([302, 303, 307, 308].includes(anonymous.status), "anonymous visitor accessed reviews");

    // Synthetic paid/completed fixture is confined to disposable CI PostgreSQL.
    await prisma.consultationBooking.update({
      where: { id: bookingId }, data: { status: "COMPLETED", paymentStatus: "PAID" }
    });
    const reviewText = "This completed consultation gave useful context for my decisions.";
    const review = await post("/api/consultation-bookings/review", {
      bookingId, rating: 5, body: reviewText
    }, userCookie);
    assert.equal(review.status, 200, await review.text());
    const ownerPage = await req("/astrologer/reviews", { headers: { cookie: astroCookie } });
    assert.equal(ownerPage.status, 200);
    const html = await ownerPage.text();
    assert.ok(html.includes(reviewText), "verified review body not rendered in private dashboard");
    assert.ok(html.includes("Reviews and Ratings"), "dashboard title absent");
  });

  await check("support tickets are owned by the user and triaged only by admin", async () => {
    const anonRead = await req("/api/support/tickets");
    assert.equal(anonRead.status, 401);
    const payload = { subject: "Account access assistance", message: "Please help with my account settings and access." };
    const created = await post("/api/support/tickets", payload, userCookie);
    const createBody = await created.json();
    assert.equal(created.status, 201, JSON.stringify(createBody));
    const ticketId = createBody.data.ticket.id;
    assert.equal(createBody.data.ticket.status, "OPEN");

    const owned = await req("/api/support/tickets", { headers: { cookie: userCookie } });
    const ownedBody = await owned.json();
    assert.equal(owned.status, 200);
    assert.ok(ownedBody.data.tickets.some((ticket) => ticket.id === ticketId));
    const forbiddenAdmin = await req("/api/admin/support", { headers: { cookie: userCookie } });
    assert.equal(forbiddenAdmin.status, 404);
    const invalid = await post("/api/support/tickets", { subject: "a", message: "x" }, userCookie);
    assert.equal(invalid.status, 422);

    const adminList = await req("/api/admin/support", { headers: { cookie: adminCookie } });
    const adminBody = await adminList.json();
    assert.equal(adminList.status, 200);
    assert.ok(adminBody.data.tickets.some((ticket) => ticket.id === ticketId));
    const unauthorizedUpdate = await post("/api/admin/support", {
      ticketId, status: "RESOLVED", priority: "HIGH"
    }, userCookie, "PATCH");
    assert.equal(unauthorizedUpdate.status, 404);
    const reviewed = await post("/api/admin/support", {
      ticketId, status: "IN_PROGRESS", priority: "HIGH"
    }, adminCookie, "PATCH");
    assert.equal(reviewed.status, 200, await reviewed.text());
    const saved = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } });
    assert.equal(saved.status, "IN_PROGRESS");
    assert.equal(saved.priority, "HIGH");
    assert.equal(saved.userId, userId);

    const userMutation = randomUUID();
    const userReply = { ticketId, clientMutationId: userMutation, message: "Can you advise how to access my account?" };
    const anonymousReply = await post("/api/support/tickets/reply", userReply);
    assert.equal(anonymousReply.status, 401);
    const userSent = await post("/api/support/tickets/reply", userReply, userCookie);
    assert.equal(userSent.status, 200, await userSent.text());
    const replay = await post("/api/support/tickets/reply", userReply, userCookie);
    const replayBody = await replay.json();
    assert.equal(replay.status, 200);
    assert.equal(replayBody.data.duplicate, true);
    const deniedStaff = await post("/api/admin/support/reply", {
      ticketId, message: "I should not be able to respond as staff.", clientMutationId: randomUUID()
    }, userCookie);
    assert.equal(deniedStaff.status, 404);
    const staffReply = await post("/api/admin/support/reply", {
      ticketId, message: "We have reviewed your account-access request.", clientMutationId: randomUUID()
    }, adminCookie);
    assert.equal(staffReply.status, 200, await staffReply.text());
    const conversation = await prisma.supportTicket.findUniqueOrThrow({ where: { id: ticketId } });
    assert.equal(conversation.messages.length, 3, "reply replay appended a duplicate message");
    assert.equal(conversation.messages[1].author, "USER");
    assert.equal(conversation.messages[2].author, "ADMIN");
    const closure = await post("/api/admin/support", {
      ticketId, status: "RESOLVED", priority: "HIGH"
    }, adminCookie, "PATCH");
    assert.equal(closure.status, 200, await closure.text());
    const closedReply = await post("/api/support/tickets/reply", {
      ticketId, message: "I need more help.", clientMutationId: randomUUID()
    }, userCookie);
    assert.equal(closedReply.status, 409);
  });

  await check("push subscription API does not falsely claim unimplemented delivery", async () => {
    const anon = await post("/api/notifications/subscribe", {
      endpoint: "https://push.example.test/subscription", keys: {}
    });
    assert.equal(anon.status, 401);
    const logged = await post("/api/notifications/subscribe", {
      endpoint: "https://push.example.test/subscription", keys: {}
    }, userCookie);
    const result = await logged.json();
    assert.equal(logged.status, 503, JSON.stringify(result));
    assert.doesNotMatch(JSON.stringify(result), /"subscribed":true/);
    assert.doesNotMatch(JSON.stringify(result), /push\.example\.test/);
  });

  await check("written questions and puja enquiries are real private non-payment tickets", async () => {
    for (const path of ["/ask-astrologer", "/puja-enquiry", "/learn"]) {
      const page = await req(path);
      assert.equal(page.status, 200, "public explanatory page missing: " + path);
    }
    const anon = await post("/api/guidance-enquiries", {
      kind: "WRITTEN_GUIDANCE", topic: "CAREER",
      message: "Please review this career question using available guidance."
    });
    assert.equal(anon.status, 401);
    const rejected = await post("/api/guidance-enquiries", {
      kind: "PUJA_ENQUIRY", topic: "GENERAL",
      message: "Need a ceremony.", paymentStatus: "PAID"
    }, userCookie);
    assert.equal(rejected.status, 422, "client may not inject payment fields");
    const written = await post("/api/guidance-enquiries", {
      kind: "WRITTEN_GUIDANCE", topic: "CAREER",
      message: "I am exploring a career change and want to know what traditional chart concepts mean."
    }, userCookie);
    const writtenBody = await written.json();
    assert.equal(written.status, 201, JSON.stringify(writtenBody));
    assert.equal(writtenBody.data.paymentRequired, false);
    assert.equal(writtenBody.data.expertAssigned, false);
    assert.equal(writtenBody.data.bookingCreated, false);
    const writtenId = writtenBody.data.ticket.id;
    const puja = await post("/api/guidance-enquiries", {
      kind: "PUJA_ENQUIRY", topic: "SPIRITUAL_PRACTICE",
      message: "I would like more information about Rudrabhishek traditions before making any arrangements."
    }, userCookie);
    const pujaBody = await puja.json();
    assert.equal(puja.status, 201, JSON.stringify(pujaBody));
    const pujaId = pujaBody.data.ticket.id;
    const actual = await prisma.supportTicket.findMany({
      where: { id: { in: [writtenId, pujaId] } },
      select: { id: true, userId: true, subject: true, messages: true }
    });
    assert.equal(actual.length, 2);
    for (const ticket of actual) {
      assert.equal(ticket.userId, userId);
      assert.equal(ticket.messages.length, 1);
      assert.equal(ticket.messages[0].author, "USER");
    }
    assert.ok(actual.some((item) => item.subject.startsWith("[WRITTEN GUIDANCE]")));
    assert.ok(actual.some((item) => item.subject.startsWith("[PUJA ENQUIRY]")));

    const owned = await req("/api/support/tickets", { headers: { cookie: userCookie } });
    const ownedData = await owned.json();
    assert.ok(ownedData.data.tickets.some((ticket) => ticket.id === pujaId));
    const staff = await req("/api/admin/support", { headers: { cookie: adminCookie } });
    const staffData = await staff.json();
    assert.ok(staffData.data.tickets.some((ticket) => ticket.id === writtenId));
    const staffReply = await post("/api/admin/support/reply", {
      ticketId: writtenId,
      message: "Your question was received. Guidance availability will be reviewed before any assignment.",
      clientMutationId: randomUUID()
    }, adminCookie);
    assert.equal(staffReply.status, 200, await staffReply.text());
    const conversation = await prisma.supportTicket.findUniqueOrThrow({
      where: { id: writtenId },
      select: { messages: true }
    });
    assert.equal(conversation.messages.length, 2);
    assert.equal(conversation.messages[1].author, "ADMIN");
  });

  await check("free lessons persist real owner-scoped progress and forbid forged credits", async () => {
    const endpoint = "/api/learn/progress";
    const anon = await req(endpoint);
    assert.equal(anon.status, 401);
    const initial = await req(endpoint, { headers: { cookie: userCookie } });
    const initialData = await initial.json();
    assert.equal(initial.status, 200, JSON.stringify(initialData));
    assert.equal(initialData.data.totalLessons, 4);
    assert.equal(initialData.data.completed.length, 0);
    const invalid = await post(endpoint, {
      lessonId: "fake-certified-course", completed: true
    }, userCookie);
    assert.equal(invalid.status, 422);
    const spoof = await post(endpoint, {
      lessonId: "panchang", completed: true, userId: adminId
    }, userCookie);
    assert.equal(spoof.status, 422);
    const completed = await post(endpoint, { lessonId: "panchang", completed: true }, userCookie);
    assert.equal(completed.status, 200, await completed.text());
    const saved = await prisma.learningProgress.findUniqueOrThrow({
      where: { userId_lessonId: { userId, lessonId: "panchang" } }
    });
    assert.ok(saved.completedAt instanceof Date);
    const isolated = await req(endpoint, { headers: { cookie: astroCookie } });
    const isolatedData = await isolated.json();
    assert.equal(isolated.status, 200);
    assert.equal(isolatedData.data.completed.length, 0);
    const duplicate = await post(endpoint, { lessonId: "panchang", completed: true }, userCookie);
    assert.equal(duplicate.status, 200, await duplicate.text());
    const count = await prisma.learningProgress.count({ where: { userId, lessonId: "panchang" } });
    assert.equal(count, 1, "replayed completion created duplicate records");
    const unset = await post(endpoint, { lessonId: "panchang", completed: false }, userCookie);
    assert.equal(unset.status, 200, await unset.text());
    const after = await req(endpoint, { headers: { cookie: userCookie } });
    const afterData = await after.json();
    assert.equal(after.status, 200);
    assert.equal(afterData.data.completed.length, 0);
  });

  await check("puja partner registry is staff-only and lists only independently reviewed entries", async () => {
    const endpoint = "/api/admin/puja-partners";
    const unauth = await req(endpoint);
    assert.equal(unauth.status, 404);
    const forbidden = await post(endpoint, {
      name: "Fixture Regional Temple", region: "India",
      traditions: ["Ganesh Puja"], evidenceUrl: "https://example.org/registry/temple"
    }, userCookie);
    assert.equal(forbidden.status, 404);
    const created = await post(endpoint, {
      name: "Fixture Regional Temple", region: "Test India",
      traditions: ["Ganesh Puja"], evidenceUrl: "https://example.org/registry/temple"
    }, adminCookie);
    const info = await created.json();
    assert.equal(created.status, 201, JSON.stringify(info));
    const partnerId = info.data.partner.id;
    assert.equal(info.data.partner.reviewStatus, "PENDING");
    try {
      const publicBefore = await req("/api/puja/partners");
      const beforeData = await publicBefore.json();
      assert.equal(publicBefore.status, 200);
      assert.ok(!beforeData.data.partners.some((x) => x.id === partnerId));
      const privateRequest = await post("/api/guidance-enquiries", {
        kind: "PUJA_ENQUIRY", topic: "SPIRITUAL_PRACTICE", partnerId,
        message: "Please share basic details about this regional ritual enquiry before booking."
      }, userCookie);
      assert.equal(privateRequest.status, 422, "unreviewed partner was accepted as an option");
      const blockedReview = await post(endpoint, {
        partnerId, decision: "VERIFIED", note: "Users cannot verify providers."
      }, userCookie, "PATCH");
      assert.equal(blockedReview.status, 404);
      const reviewed = await post(endpoint, {
        partnerId, decision: "VERIFIED",
        note: "Disposable fixture: manual review only, not a real vendor."
      }, adminCookie, "PATCH");
      assert.equal(reviewed.status, 200, await reviewed.text());
      const publicAfter = await req("/api/puja/partners");
      const afterData = await publicAfter.json();
      assert.equal(publicAfter.status, 200);
      assert.ok(afterData.data.partners.some((x) => x.id === partnerId));
      assert.ok(!JSON.stringify(afterData).includes("evidenceUrl"), "private review evidence leaked");
      const enquiry = await post("/api/guidance-enquiries", {
        kind: "PUJA_ENQUIRY", topic: "SPIRITUAL_PRACTICE", partnerId,
        message: "I am looking for the traditional meaning of a Ganesh Puja ceremony."
      }, userCookie);
      assert.equal(enquiry.status, 201, await enquiry.text());
      const suspended = await post(endpoint, {
        partnerId, decision: "SUSPENDED",
        note: "Disable the test partner from the public catalogue."
      }, adminCookie, "PATCH");
      assert.equal(suspended.status, 200, await suspended.text());
      const hidden = await req("/api/puja/partners");
      const hiddenData = await hidden.json();
      assert.ok(!hiddenData.data.partners.some((x) => x.id === partnerId));
    } finally {
      await prisma.pujaPartner.delete({ where: { id: partnerId } });
    }
  });

  await check("authenticated Shop and Puja enquiries persist in real support queue without payments", async () => {
    const created = [];
    try {
      const unauth = await post("/api/commerce/enquiries", {
        kind: "SHOP", itemId: "shri-yantra", quantity: 1,
        message: "Can you confirm authenticity and delivery options?"
      });
      assert.equal(unauth.status, 401);
      const rejected = await post("/api/commerce/enquiries", {
        kind: "SHOP", itemId: "shri-yantra", quantity: 0,
        message: "Please provide your best price and supplier details."
      }, userCookie);
      assert.equal(rejected.status, 422);
      const priceInjection = await post("/api/commerce/enquiries", {
        kind: "SHOP", itemId: "shri-yantra", quantity: 1, amount: 1,
        paymentStatus: "PAID", message: "Please reserve and deliver two yantras."
      }, userCookie);
      assert.equal(priceInjection.status, 422);
      const shop = await post("/api/commerce/enquiries", {
        kind: "SHOP", itemId: "shri-yantra", quantity: 2,
        message: "Please verify the actual physical item, stock and price."
      }, userCookie);
      const shopBody = await shop.json();
      assert.equal(shop.status, 201, JSON.stringify(shopBody));
      assert.equal(shopBody.data.paymentRequired, false);
      assert.equal(shopBody.data.orderCreated, false);
      assert.equal(shopBody.data.bookingCreated, false);
      assert.equal(shopBody.data.trackingPath, "/support");
      created.push(shopBody.data.ticket.id);
      const ticket = await prisma.supportTicket.findUniqueOrThrow({ where: { id: shopBody.data.ticket.id } });
      assert.equal(ticket.userId, userId);
      assert.match(ticket.subject, /^\[SHOP ENQUIRY\]/);
      assert.ok(JSON.stringify(ticket.messages).includes("Quantity requested: 2"));
      const feed = await req("/api/puja/calendar");
      assert.equal(feed.status, 200);
      const first = (await feed.json()).data.events[0];
      assert.ok(first?.id);
      const puja = await post("/api/commerce/enquiries", {
        kind: "PUJA", itemId: first.id, city: "Bhopal",
        message: "Please advise about local Panchang and pandit availability."
      }, userCookie);
      const pujaBody = await puja.json();
      assert.equal(puja.status, 201, JSON.stringify(pujaBody));
      assert.equal(pujaBody.data.fulfillmentConfirmed, false);
      created.push(pujaBody.data.ticket.id);
      const pujaTicket = await prisma.supportTicket.findUniqueOrThrow({ where: { id: pujaBody.data.ticket.id } });
      assert.equal(pujaTicket.userId, userId);
      assert.match(pujaTicket.subject, /^\[PUJA DATE ENQUIRY\]/);
      assert.ok(JSON.stringify(pujaTicket.messages).includes("Local tithi/muhurat: NOT VERIFIED"));
      const ritual = await post("/api/commerce/enquiries", {
        kind: "PUJA", itemId: "ritual:rudrabhishek", city: "Bhopal",
        message: "Please explain possible traditional arrangement requirements."
      }, userCookie);
      const ritualBody = await ritual.json();
      assert.equal(ritual.status, 201, JSON.stringify(ritualBody));
      assert.equal(ritualBody.data.bookingCreated, false);
      assert.equal(ritualBody.data.paymentRequired, false);
      created.push(ritualBody.data.ticket.id);
      const ritualTicket = await prisma.supportTicket.findUniqueOrThrow({
        where: { id: ritualBody.data.ticket.id }
      });
      assert.match(ritualTicket.subject, /^\[PUJA TOPIC ENQUIRY\]/);
      assert.ok(JSON.stringify(ritualTicket.messages).includes("Traditional Puja: Rudrabhishek"));
      const forgedRitual = await post("/api/commerce/enquiries", {
        kind: "PUJA", itemId: "ritual:invented-paid-ritual", city: "Bhopal",
        message: "Please do not allow me to book invented ceremonies."
      }, userCookie);
      assert.equal(forgedRitual.status, 422);
      const invalidCalendar = await post("/api/commerce/enquiries", {
        kind: "PUJA", itemId: "2029-invented-ceremony", city: "Bhopal",
        message: "This event should not be available for booking."
      }, userCookie);
      assert.equal(invalidCalendar.status, 422);
    } finally {
      await prisma.supportTicket.deleteMany({ where: { id: { in: created } } });
    }
  });

  await check("Puja owner price editor restricts roles and publishes only approved fees", async () => {
    const url="/api/admin/puja-offerings";
    const anonymous=await req(url);assert.equal(anonymous.status,403);
    const userDenied=await req(url,{headers:{cookie:userCookie}});assert.equal(userDenied.status,403);
    const baseline=await req(url,{headers:{cookie:adminCookie}});
    assert.equal(baseline.status,200,await baseline.text());
    const input={topicId:"rudrabhishek",pricePaise:199900,durationMinutes:90,available:true,note:"CI synthetic fee, not a genuine customer quote"};
    const invalid=await post(url,{...input,topicId:"invented-temple-ceremony"},adminCookie,"PUT");
    assert.equal(invalid.status,422);
    const missingFee=await post(url,{...input,pricePaise:null},adminCookie,"PUT");
    assert.equal(missingFee.status,422);
    try {
      const publish=await post(url,input,adminCookie,"PUT");
      assert.equal(publish.status,200,await publish.text());
      const updated=await req(url,{headers:{cookie:adminCookie}});
      const data=await updated.json();assert.equal(updated.status,200);
      assert.equal(data.data.offerings.find(o=>o.topicId==="rudrabhishek").pricePaise,199900);
      const detail=await req("/pujas/rudrabhishek");
      assert.equal(detail.status,200);
      assert.match(await detail.text(),/₹1,999/);
      const directory=await req("/pujas");
      assert.equal(directory.status,200);
      assert.match(await directory.text(),/₹1,999/);
      const stop=await post(url,{...input,available:false},adminCookie,"PUT");
      assert.equal(stop.status,200,await stop.text());
      const unpublished=await req("/pujas/rudrabhishek");
      assert.equal(unpublished.status,200);
      assert.doesNotMatch(await unpublished.text(),/₹1,999/);
    } finally {
      // CI localhost database only, never production. Clean the synthetic offer record.
      await prisma.pujaOffering.deleteMany({where:{topicId:"rudrabhishek"}});
    }
  });

  await check("Shop catalogue admin-only persistence and public deactivation", async () => {
    const anon = await req("/api/admin/shop-catalogue");
    assert.equal(anon.status, 403);
    const userDenied = await req("/api/admin/shop-catalogue", { headers: { cookie: userCookie } });
    assert.equal(userDenied.status, 403);
    const initial = await req("/api/admin/shop-catalogue", { headers: { cookie: adminCookie } });
    const initialBody = await initial.json();
    assert.equal(initial.status, 200, JSON.stringify(initialBody));
    assert.equal(initialBody.data.version, 0);
    const original = initialBody.data.products;
    assert.ok(original.length > 2);
    const unlicensed = original.map((p) => p.id === original[0].id
      ? { ...p, imageUrl: "https://vendor.example.test/borrowed-photo.jpg" } : p);
    const refusedPhoto = await post("/api/admin/shop-catalogue",
      { expectedVersion: 0, products: unlicensed }, adminCookie, "PUT");
    assert.equal(refusedPhoto.status, 422, "Unlicensed third-party product photo was published");
    const target = original[0];
    const headingMarker = ">" + target.name.en + "</a></h2>"; // product heading now contains a linked detail-page title
    const beforePage = await req("/shop");
    assert.equal(beforePage.status, 200);
    assert.ok((await beforePage.text()).includes(headingMarker), "active product must render as a real Shop heading");
    const updated = original.map((p) => p.id === target.id ? { ...p, status: "inactive" } : p);
    const write = await post("/api/admin/shop-catalogue", { expectedVersion: 0, products: updated }, adminCookie, "PUT");
    const result = await write.json();
    assert.equal(write.status, 200, JSON.stringify(result));
    assert.equal(result.data.version, 1);
    const publicPage = await req("/shop");
    assert.equal(publicPage.status, 200);
    assert.ok(!(await publicPage.text()).includes(headingMarker), "deactivated product still rendered as a visible Shop heading");
    const adminRead = await req("/api/admin/shop-catalogue", { headers: { cookie: adminCookie } });
    const saved = await adminRead.json();
    assert.equal(saved.data.version, 1);
    assert.equal(saved.data.products.find((p) => p.id === target.id).status, "inactive");
    const race = await post("/api/admin/shop-catalogue", { expectedVersion: 0, products: original }, adminCookie, "PUT");
    assert.equal(race.status, 409, "concurrent stale edit must reject");
    const restore = await post("/api/admin/shop-catalogue", { expectedVersion: 1, products: original }, adminCookie, "PUT");
    assert.equal(restore.status, 200, await restore.text());
  });

  await check("real Shop order request, server-calculated subtotal, role gate and owner dispatch tracking", async () => {
    const catalogueUrl="/api/admin/shop-catalogue";
    const savedResponse=await req(catalogueUrl,{headers:{cookie:adminCookie}});
    const saved=(await savedResponse.json()).data;
    assert.equal(savedResponse.status,200);
    const sku=saved.products.find(p=>p.id==="shri-yantra");assert.ok(sku);
    const original=saved.products;
    const priced=original.map(p=>p.id===sku.id?{...p,unitPricePaise:129900}:p);
    let orderId;
    const extraOrderIds=[];
    try {
      const setPrice=await post(catalogueUrl,{expectedVersion:saved.version,products:priced},adminCookie,"PUT");
      assert.equal(setPrice.status,200,await setPrice.text());
      const input={items:[{productId:sku.id,quantity:2}],customerName:"QA Customer",
        customerPhone:"+91 9876543210",deliveryAddress:"House 40, Test Lane, Example Ward, Madhya Pradesh",
        deliveryCity:"Indore",deliveryState:"Madhya Pradesh",postalCode:"452001",customerNote:"Test only, no real shipment"};
      const anon=await post("/api/commerce/orders",input);assert.equal(anon.status,401);
      const forged=await post("/api/commerce/orders",{...input,paymentStatus:"PAID",amount:1},userCookie);
      assert.equal(forged.status,422);
      const created=await post("/api/commerce/orders",input,userCookie);
      const body=await created.json();assert.equal(created.status,201,JSON.stringify(body));
      orderId=body.data.order.id;assert.equal(body.data.order.subtotalPaise,259800);
      assert.equal(body.data.order.paymentStatus,"UNPAID");
      assert.equal(body.data.charged,false);
      // Verify real persisted 24-hour quota using a disposable CI database.
      for(let n=0;n<4;n++){
        const extra=await post("/api/commerce/orders",input,userCookie);
        assert.equal(extra.status,201,"Shop request "+(n+2)+" should fit quota");
        extraOrderIds.push((await extra.json()).data.order.id);
      }
      const overLimit=await post("/api/commerce/orders",input,userCookie);
      assert.equal(overLimit.status,429,"Sixth Shop request must be denied without a write");
      const userOrders=await req("/api/commerce/orders",{headers:{cookie:userCookie}});
      assert.ok((await userOrders.json()).data.orders.some(o=>o.id===orderId));
      const adminRead=await req("/api/admin/shop-orders",{headers:{cookie:adminCookie}});
      const adminRows=(await adminRead.json()).data.orders;
      const row=adminRows.find(o=>o.id===orderId);assert.ok(row&&row.status==="REQUESTED");
      const patch={id:orderId,expectedVersion:row.version,status:"CONFIRMED",shippingPaise:0,taxPaise:0,
        trackingReference:null,adminNote:"Verified QA-only owner acknowledgement"};
      const denied=await post("/api/admin/shop-orders",patch,userCookie,"PATCH");assert.equal(denied.status,403);
      const confirmed=await post("/api/admin/shop-orders",patch,adminCookie,"PATCH");
      const confirmedBody=await confirmed.json();assert.equal(confirmed.status,200,JSON.stringify(confirmedBody));
      assert.equal(confirmedBody.data.order.totalPaise,259800);
      assert.equal(confirmedBody.data.order.paymentStatus,"UNPAID");
      const stale=await post("/api/admin/shop-orders",patch,adminCookie,"PATCH");assert.equal(stale.status,409);
      const dispatchWithoutTracking=await post("/api/admin/shop-orders",
        {...patch,expectedVersion:2,status:"DISPATCHED"},adminCookie,"PATCH");
      assert.equal(dispatchWithoutTracking.status,422);
    } finally {
      if(orderId||extraOrderIds.length)await prisma.shopOrder.deleteMany({where:{id:{in:[...(orderId?[orderId]:[]),...extraOrderIds]}}});
      const stateRes=await req(catalogueUrl,{headers:{cookie:adminCookie}});
      const state=(await stateRes.json()).data;
      const reset=await post(catalogueUrl,{expectedVersion:state.version,products:original},adminCookie,"PUT");
      assert.equal(reset.status,200,await reset.text());
    }
  });

  await check("real Puja booking requires published price and verified priest, supports private tracking", async () => {
    const topicId="rudrabhishek",offerUrl="/api/admin/puja-offerings";
    const offerInput={topicId,pricePaise:199900,durationMinutes:90,available:true,note:"Disposable CI-only service offering"};
    const request={topicId,preferredDate:new Date(Date.now()+5*86400000).toISOString().slice(0,10),
      city:"Indore",devoteeName:"QA Devotee",gotra:null,
      sankalpNote:"This is a synthetic Puja test. No ceremony to be performed.",customerPhone:"+91 9876543210"};
    let bookingId,partnerId;
    const extraBookingIds=[];
    try {
      const anon=await post("/api/puja/bookings",request);assert.equal(anon.status,401);
      const unopened=await post("/api/puja/bookings",request,userCookie);assert.equal(unopened.status,422);
      const approved=await post(offerUrl,offerInput,adminCookie,"PUT");assert.equal(approved.status,200,await approved.text());
      const injected=await post("/api/puja/bookings",{...request,paymentStatus:"PAID"},userCookie);
      assert.equal(injected.status,422);
      const created=await post("/api/puja/bookings",request,userCookie);
      const body=await created.json();assert.equal(created.status,201,JSON.stringify(body));
      bookingId=body.data.booking.id;
      assert.equal(body.data.confirmed,false);assert.equal(body.data.panditAssigned,false);
      assert.equal(body.data.booking.quotedPricePaise,199900);
      for(let n=0;n<3;n++){
        const extra=await post("/api/puja/bookings",request,userCookie);
        assert.equal(extra.status,201,"Puja request "+(n+2)+" should fit quota");
        extraBookingIds.push((await extra.json()).data.booking.id);
      }
      const overLimit=await post("/api/puja/bookings",request,userCookie);
      assert.equal(overLimit.status,429,"Fifth Puja request must be denied without a write");
      const ownerList=await req("/api/puja/bookings",{headers:{cookie:userCookie}});
      assert.ok((await ownerList.json()).data.bookings.some(p=>p.id===bookingId));
      const adminList=await req("/api/admin/puja-bookings",{headers:{cookie:adminCookie}});
      const row=(await adminList.json()).data.bookings.find(p=>p.id===bookingId);
      assert.ok(row && row.status==="REQUESTED");
      const patch={id:bookingId,expectedVersion:row.version,status:"CONFIRMED",partnerId:null,
        scheduledAt:null,adminNote:"CI synthetic verification only",evidenceUrl:null};
      const unauthorized=await post("/api/admin/puja-bookings",patch,userCookie,"PATCH");assert.equal(unauthorized.status,403);
      const noPartner=await post("/api/admin/puja-bookings",patch,adminCookie,"PATCH");assert.equal(noPartner.status,422);
      const partner=await prisma.pujaPartner.create({data:{
        name:"QA disposable verified priest",region:"Indore",traditions:["Shiva"],reviewStatus:"VERIFIED"
      }});
      partnerId=partner.id;
      const approvedBooking=await post("/api/admin/puja-bookings",{...patch,partnerId},adminCookie,"PATCH");
      const confirmed=(await approvedBooking.json());assert.equal(approvedBooking.status,200,JSON.stringify(confirmed));
      assert.equal(confirmed.data.booking.status,"CONFIRMED");
      const stale=await post("/api/admin/puja-bookings",{...patch,partnerId},adminCookie,"PATCH");
      assert.equal(stale.status,409);
      const scheduled=await post("/api/admin/puja-bookings",
        {...patch,partnerId,expectedVersion:2,status:"SCHEDULED",
          scheduledAt:new Date(Date.now()+5*86400000).toISOString()},adminCookie,"PATCH");
      assert.equal(scheduled.status,200,await scheduled.text());
      const latest=await prisma.pujaBookingRequest.findUniqueOrThrow({where:{id:bookingId}});
      assert.equal(latest.status,"SCHEDULED");assert.ok(latest.scheduledAt);
    } finally {
      if(bookingId||extraBookingIds.length)await prisma.pujaBookingRequest.deleteMany({where:{id:{in:[...(bookingId?[bookingId]:[]),...extraBookingIds]}}});
      if(partnerId)await prisma.pujaPartner.deleteMany({where:{id:partnerId}});
      await prisma.pujaOffering.deleteMany({where:{topicId}});
    }
  });

  await check("manual report fee publication preserves gateway amounts and can be unpublished", async () => {
    const endpoint="/api/admin/manual-report-offerings";
    assert.equal((await req(endpoint)).status,403);
    assert.equal((await req(endpoint,{headers:{cookie:userCookie}})).status,403);
    const offer={reportSlug:"love-report",pricePaise:159900,available:true,deliveryDays:5,
      note:"Synthetic manual specialist report rate; does not accept online payment"};
    const blocked=await post(endpoint,{...offer,reportSlug:"premium-kundli"},adminCookie,"PUT");
    assert.equal(blocked.status,422);
    const missing=await post(endpoint,{...offer,pricePaise:null},adminCookie,"PUT");
    assert.equal(missing.status,422);
    try{
      const publish=await post(endpoint,offer,adminCookie,"PUT");
      assert.equal(publish.status,200,await publish.text());
      const reportPage=await req("/reports");
      assert.equal(reportPage.status,200);
      assert.match(await reportPage.text(),/₹1,599/);
      const remove=await post(endpoint,{...offer,available:false},adminCookie,"PUT");
      assert.equal(remove.status,200,await remove.text());
      const after=await req("/reports");assert.equal(after.status,200);
      assert.doesNotMatch(await after.text(),/₹1,599/);
    }finally{
      await prisma.manualReportOffering.deleteMany({where:{reportSlug:"love-report"}});
    }
  });

  await check("unpaid paid-report request blocks PDF generation and email delivery", async () => {
    const report = await prisma.reportRequest.create({ data: {
      userId, planType: "PREMIUM", paymentStatus: "PENDING", status: "PENDING_REVIEW",
      reportSlug: "premium-kundli", deliveryEmail: email, fullName: "QA User",
      dateOfBirth: "1990-01-15", timeOfBirth: "10:30", birthPlace: "Delhi",
      latitude: 28.6139, longitude: 77.209, timezone: 5.5, language: "en"
    }});
    reportId = report.id;
    const pdf = await post("/api/admin/report-requests/" + reportId + "/generate-pdf", {}, adminCookie);
    assert.equal(pdf.status, 409, await pdf.text());
    const delivery = await post("/api/admin/report-requests/" + reportId + "/deliver", {}, adminCookie);
    assert.equal(delivery.status, 409, await delivery.text());
  });
  await check("synthetic paid-state fixture creates real PDF with owner-only download", async () => {
    await prisma.reportRequest.update({ where: { id: reportId }, data: { paymentStatus: "PAID" } });
    const pdf = await post("/api/admin/report-requests/" + reportId + "/generate-pdf", {}, adminCookie);
    const result = await pdf.json();
    assert.equal(pdf.status, 200, JSON.stringify(result).slice(0, 600));
    assert.ok(result.data.byteLength > 500, "PDF bytes unexpectedly small");
    const row = await prisma.reportRequest.findUniqueOrThrow({ where: { id: reportId } });
    assert.ok(row.generatedPdfSize > 500 && row.generatedPdfChecksum);
    const owned = await req("/api/report-requests/" + reportId + "/download", { headers: { cookie: userCookie } });
    assert.equal(owned.status, 200, "owner PDF unavailable");
    assert.equal(owned.headers.get("content-type"), "application/pdf");
    const magic = Buffer.from(await owned.arrayBuffer()).subarray(0, 5).toString("ascii");
    assert.equal(magic, "%PDF-");
    const anon = await req("/api/report-requests/" + reportId + "/download");
    assert.equal(anon.status, 401);
  });

} finally {
  try {
    if (adminId) await prisma.adminActionLog.deleteMany({ where: { adminId } });
    if (reportId) {
      await prisma.auditLog.deleteMany({ where: { targetId: reportId } });
      await prisma.reportRequest.delete({ where: { id: reportId } }).catch(() => {});
    }
    for (const id of usersToClean) await prisma.user.delete({ where: { id } }).catch(() => {});
  } finally { await prisma.$disconnect(); }
}
console.log("NAKSHARIX_AUTH_ROLE_E2E=" + passed + "/" + (passed + failed) + "_PASS;FAILED=" + failed);
if (failed) process.exit(1);
