// Shared script for every page.
// Part 1: CSRF token helpers (the server needs this token on every POST).
// Part 2: UI helpers (navigation, admin sidebar, icons, toasts, loading buttons,
//         confirm dialog, inline form validation).
// Everything that shows student data uses textContent, never innerHTML.

function getCsrfToken() {
    var match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
}

// For fetch(): headers: csrfHeaders({ "Content-Type": "application/x-www-form-urlencoded" })
function csrfHeaders(extraHeaders) {
    var headers = Object.assign({}, extraHeaders || {});
    var token = getCsrfToken();
    if (token) {
        headers["X-XSRF-TOKEN"] = token;
    }
    return headers;
}

/* ---------- UI helpers ---------- */

// Fixed, trusted icon shapes (24x24 outline icons, Lucide style).
var ICONS = {
    cap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    add: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    edit: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    dash: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    bad: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
};

function icon(name) {
    return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + '</svg>';
}

function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    return e;
}

// Create an element that starts with an icon, then optional text
function withIcon(tag, cls, iconName, text) {
    var e = el(tag, cls);
    e.insertAdjacentHTML("afterbegin", icon(iconName));
    if (text) { e.append(text); }
    return e;
}

// Show a message in a <p id="message" class="msg"> element. type: "ok" or "err"
function showMsg(target, text, type) {
    target.className = "msg" + (text && type ? " " + type : "");
    target.textContent = text || "";
}

// Spinner + disable a button while a request is running
function setLoading(btn, on) {
    if (!btn) { return; }
    btn.disabled = !!on;
    btn.classList.toggle("loading", !!on);
}

// Small notification that slides in and fades out
function toast(text, type) {
    var box = document.querySelector(".toasts");
    if (!box) {
        box = el("div", "toasts");
        box.setAttribute("role", "status");
        document.body.appendChild(box);
    }
    var t = withIcon("div", "toast" + (type === "err" ? " err" : ""), type === "err" ? "bad" : "ok");
    t.append(el("span", null, text));
    box.appendChild(t);
    setTimeout(function () {
        t.classList.add("out");
        setTimeout(function () { t.remove(); }, 260);
    }, 3500);
}

// Confirmation dialog. Returns a Promise<boolean>.
function confirmDialog(title, text, confirmLabel) {
    return new Promise(function (resolve) {
        var previous = document.activeElement;
        var modal = el("div", "modal"), card = el("div", "dialog"), row = el("div", "dialog-actions");
        var tile = el("span", "ic lg danger");
        var no = el("button", "btn ghost", "Cancel"), yes = el("button", "btn danger", confirmLabel || "Confirm");
        var heading = el("h2", null, title);
        heading.id = "dialogTitle";
        tile.insertAdjacentHTML("afterbegin", icon("warn"));
        no.type = yes.type = "button";
        card.setAttribute("role", "alertdialog");
        card.setAttribute("aria-modal", "true");
        card.setAttribute("aria-labelledby", "dialogTitle");
        card.append(tile, heading, el("p", null, text), row);
        row.append(no, yes);
        modal.appendChild(card);
        function done(result) {
            document.removeEventListener("keydown", onKey);
            modal.remove();
            if (previous && previous.focus) { previous.focus(); }
            resolve(result);
        }
        function onKey(e) {
            if (e.key === "Escape") { done(false); }
            if (e.key === "Tab") {   // keep keyboard focus inside the dialog
                var first = no, last = yes;
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
        no.onclick = function () { done(false); };
        yes.onclick = function () { done(true); };
        modal.onclick = function (e) { if (e.target === modal) { done(false); } };
        document.addEventListener("keydown", onKey);
        document.body.appendChild(modal);
        no.focus();
    });
}

// Ends the admin session on the server, then goes to the login page
function logout() {
    fetch("/adminlogout", { method: "POST", headers: csrfHeaders() })
        .then(function () { window.location.href = "/adimin-login.html"; })
        .catch(function () { window.location.href = "/adimin-login.html"; });
}

// Small coloured initials badge for a student
function avatar(name, id) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    var letters = parts.length === 0 ? "?" :
        Array.from(parts[0])[0] + (parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : "");
    var a = el("span", "avatar av-" + (Math.abs(parseInt(id, 10) || 0) % 5), letters.toUpperCase());
    a.setAttribute("aria-hidden", "true");
    return a;
}

// Avatar + name + email, used by the student tables
function personCell(s) {
    var box = el("div", "person"), text = el("div", "person-text");
    text.append(el("span", "person-name", s.name || "Unnamed"), el("span", "person-sub", s.email || ""));
    box.append(avatar(s.name, s.id), text);
    return box;
}

/* ---------- Page chrome ---------- */

function currentPage() {
    return document.body.dataset.page || location.pathname.split("/").pop() || "index.html";
}

function buildBrand(extraClass) {
    var brand = el("a", "brand" + (extraClass ? " " + extraClass : ""));
    var mark = el("span", "brand-mark");
    mark.insertAdjacentHTML("afterbegin", icon("cap"));
    brand.href = "index.html";
    brand.append(mark, "Student Manager");
    return brand;
}

// Public pages: sticky top navigation + footer
function buildPublicChrome() {
    var current = currentPage();
    var header = el("header", "nav"), inner = el("div", "nav-in"), links = el("nav", "nav-links");
    var burger = el("button", "icon-btn burger");
    burger.type = "button";
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "navLinks");
    burger.insertAdjacentHTML("afterbegin", icon("menu"));
    links.id = "navLinks";
    links.setAttribute("aria-label", "Main");

    [["index.html", "Home"], ["searchstudent.html", "Find a student"], ["admin.html", "Admin portal"]].forEach(function (it) {
        var a = el("a", "nav-link", it[1]);
        a.href = it[0];
        if (it[0] === current) { a.classList.add("on"); a.setAttribute("aria-current", "page"); }
        links.appendChild(a);
    });
    links.appendChild(el("span", "nav-sep"));
    var cta = el("a", "btn sm nav-cta", "Get started");
    cta.href = "admin-register.html";
    links.appendChild(cta);

    burger.onclick = function () {
        var open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open);
    };
    inner.append(buildBrand(), links, burger);
    header.appendChild(inner);
    document.body.prepend(header);

    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Footer
    var footer = el("footer", "footer"), cols = el("div", "footer-in");
    var about = el("div");
    about.append(buildBrand(), el("p", "footer-about", "A simple, secure place to keep student records. Administrators manage the register; anyone can look up a student by ID."));
    function column(title, items) {
        var box = el("div"), list = el("ul");
        items.forEach(function (it) {
            var li = el("li"), a = el("a", null, it[1]);
            a.href = it[0];
            li.appendChild(a);
            list.appendChild(li);
        });
        box.append(el("h4", null, title), list);
        return box;
    }
    cols.append(
        about,
        column("Explore", [["index.html", "Home"], ["searchstudent.html", "Find a student"]]),
        column("Administrators", [["adimin-login.html", "Log in"], ["admin-register.html", "Create an account"]])
    );
    var line = el("div", "footer-line"), base = el("div", null, "\u00A9 " + new Date().getFullYear() + " Student Manager. All rights reserved.");
    line.appendChild(base);
    footer.append(cols, line);
    document.body.appendChild(footer);
}

// Admin pages: sidebar + topbar
function buildAdminChrome() {
    var current = currentPage();
    var groups = [
        ["Overview", [["admin.html", "dash", "Dashboard"]]],
        ["Students", [["viewstudents.html", "users", "All students"], ["addstudent.html", "add", "Add student"],
                      ["updatestudent.html", "edit", "Update student"], ["deletestudent.html", "trash", "Delete student"],
                      ["searchstudent.html", "search", "Search"]]]
    ];
    var sidebar = el("aside", "sidebar"), nav = el("nav", "sb-nav"), scrim = el("div", "scrim");
    var section = "Admin", pageLabel = "Dashboard";
    sidebar.id = "sidebar";
    nav.setAttribute("aria-label", "Admin");

    groups.forEach(function (g) {
        nav.appendChild(el("div", "sb-label", g[0]));
        g[1].forEach(function (it) {
            var a = withIcon("a", "sb-link", it[1], it[2]);
            a.href = it[0];
            if (it[0] === current) {
                a.classList.add("on");
                a.setAttribute("aria-current", "page");
                section = g[0];
                pageLabel = it[2];
            }
            nav.appendChild(a);
        });
    });

    var foot = el("div", "sb-foot");
    var site = withIcon("a", "sb-link", "home", "Public site");
    site.href = "index.html";
    var out = withIcon("button", "sb-link", "logout", "Log out");
    out.type = "button";
    out.onclick = logout;
    foot.append(site, out);

    var brandBox = el("div", "sb-brand");
    brandBox.appendChild(buildBrand());
    sidebar.append(brandBox, nav, foot);

    // Topbar
    var top = el("header", "topbar"), burger = el("button", "icon-btn burger");
    burger.type = "button";
    burger.setAttribute("aria-label", "Open navigation");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "sidebar");
    burger.insertAdjacentHTML("afterbegin", icon("menu"));
    var crumbs = el("nav", "crumbs");
    crumbs.setAttribute("aria-label", "Breadcrumb");
    crumbs.append(el("span", null, section));
    crumbs.insertAdjacentHTML("beforeend", icon("chevron"));
    crumbs.append(el("b", null, pageLabel));
    var chip = el("span", "chip"), chipAv = el("span", "chip-av");
    chipAv.insertAdjacentHTML("afterbegin", icon("shield"));
    chip.append(chipAv, el("span", null, "Administrator"));
    top.append(burger, crumbs, chip);

    function setDrawer(open) {
        sidebar.classList.toggle("open", open);
        scrim.classList.toggle("show", open);
        burger.setAttribute("aria-expanded", open);
    }
    burger.onclick = function () { setDrawer(!sidebar.classList.contains("open")); };
    scrim.onclick = function () { setDrawer(false); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setDrawer(false); } });

    document.body.prepend(top);
    document.body.prepend(scrim);
    document.body.prepend(sidebar);
}

function buildNav() {
    var area = document.body.dataset.area;
    if (area === "admin") { buildAdminChrome(); }
    else if (area === "public") { buildPublicChrome(); }
    // "auth" pages (login / register) bring their own split layout
}

/* ---------- Inline validation ---------- */

function showFieldError(input) {
    var field = input.closest(".field");
    if (!field) { return; }
    var err = field.querySelector(".field-error");
    if (!err) {
        err = el("p", "field-error");
        err.id = (input.id || input.name || "field") + "-error";
        field.appendChild(err);
    }
    err.replaceChildren();
    err.insertAdjacentHTML("afterbegin", icon("bad"));
    err.append(input.validationMessage || "Please check this field.");
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", err.id);
}

function clearFieldError(input) {
    var field = input.closest(".field");
    var err = field && field.querySelector(".field-error");
    if (err) { err.remove(); }
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
}

function initValidation(form) {
    // Replace the browser's pop-up bubble with a message under the field
    form.addEventListener("invalid", function (e) {
        e.preventDefault();
        showFieldError(e.target);
        if (!form.dataset.focused) {
            form.dataset.focused = "1";
            e.target.focus();
            setTimeout(function () { delete form.dataset.focused; }, 0);
        }
    }, true);
    form.addEventListener("input", function (e) {
        if (e.target.matches("input") && e.target.getAttribute("aria-invalid") && e.target.validity.valid) {
            clearFieldError(e.target);
        }
    });
    // Errors are shown on submit (not on blur): an error appearing on blur would shift the
    // layout between mouse-down and mouse-up and could swallow the click on "Submit".
    // They disappear as soon as the field becomes valid.
}

// Show / hide button for password fields
function initPasswordToggle(input) {
    var wrap = el("div", "input-wrap has-toggle"), btn = el("button", "toggle");
    btn.type = "button";
    btn.setAttribute("aria-label", "Show password");
    btn.insertAdjacentHTML("afterbegin", icon("eye"));
    input.parentNode.insertBefore(wrap, input);
    wrap.append(input, btn);
    btn.onclick = function () {
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.replaceChildren();
        btn.insertAdjacentHTML("afterbegin", icon(show ? "eyeoff" : "eye"));
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    };
}

function initUI() {
    buildNav();

    // data-icon="name" placeholders become icons
    document.querySelectorAll("[data-icon]").forEach(function (e) {
        e.insertAdjacentHTML("afterbegin", icon(e.dataset.icon));
    });
    document.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
    document.querySelectorAll(".field input[type='password']").forEach(initPasswordToggle);

    var token = getCsrfToken();
    document.querySelectorAll("form").forEach(function (form) {
        // Normal POST forms get the CSRF token as a hidden field
        if (token && (form.getAttribute("method") || "").toLowerCase() === "post" && !form.querySelector("input[name='_csrf']")) {
            var input = el("input");
            input.type = "hidden";
            input.name = "_csrf";
            input.value = token;
            form.appendChild(input);
        }
        initValidation(form);
        // Forms marked data-loading: block double submits and show a spinner
        if (form.hasAttribute("data-loading")) {
            form.addEventListener("submit", function (e) {
                if (form.dataset.busy) { e.preventDefault(); return; }
                form.dataset.busy = "1";
                setLoading(form.querySelector("[type=submit]"), true);
            });
        }
    });
}

// This script sits at the end of <body>, so the page is already parsed and the
// chrome can be built straight away (no flash of an empty page).
if (document.body) { initUI(); }
else { document.addEventListener("DOMContentLoaded", initUI); }

// Coming back with the browser Back button: un-freeze buttons
window.addEventListener("pageshow", function () {
    document.querySelectorAll("form[data-loading]").forEach(function (f) {
        delete f.dataset.busy;
        setLoading(f.querySelector("[type=submit]"), false);
    });
});
