/* ==========================================================================
   个人生活助理 · 交互逻辑
   ========================================================================== */

(function () {
  "use strict";

  var C = window.CONTENT;
  var S = window.Store;

  var contentEl = document.getElementById("content");
  var RENDER = {};
  var navEl = document.getElementById("nav");
  var titleEl = document.getElementById("pageTitle");
  var subEl = document.getElementById("pageSub");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  var modal = document.getElementById("modal");
  var modalForm = document.getElementById("modalForm");
  var modalTitle = document.getElementById("modalTitle");
  var toastEl = document.getElementById("toast");

  /* ------------------------------------------------------------ 基础工具 */

  function $(sel, root) { return (root || document).querySelector(sel); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function num(v) { var x = parseFloat(v); return isNaN(x) ? 0 : x; }

  var LS = "lifeassistant:";
  function lsGet(k) { try { return localStorage.getItem(LS + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(LS + k, v); } catch (e) { } }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function todayStr() { return S.ymd(new Date()); }

  function greet() {
    var h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 9) return "早上好";
    if (h < 12) return "上午好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    if (h < 23) return "晚上好";
    return "夜深了";
  }

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
    dumbbell: '<path d="M6.5 6.5v11"/><path d="M3.5 9v6"/><path d="M17.5 6.5v11"/><path d="M20.5 9v6"/><path d="M6.5 12h11"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 20.5z"/><path d="M8.5 6.5h7"/>',
    mountain: '<path d="M2.5 19.5h19L14 5.5l-4 7.2-2.2-2.9z"/>',
    plane: '<path d="M2.5 13.5 21 4l-6.5 17-3-6.5z"/><path d="M21 4 11.5 14.5"/>',
    sparkles: '<path d="M11.5 3l1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5-4.5-1.7 4.5-1.7z"/><path d="M18 15.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
    db: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    bell: '<path d="M18 9.5a6 6 0 1 0-12 0c0 4.5-2 5.5-2 5.5h16s-2-1-2-5.5"/><path d="M10.2 19a2 2 0 0 0 3.6 0"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
    upload: '<path d="M12 20V8"/><path d="m7 13 5-5 5 5"/><path d="M4 4h16"/>',
    check: '<path d="m5 13 4.5 4.5L19 7"/>'
  };

  function icon(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || "") + "</svg>";
  }

  /* ------------------------------------------------------------ 通用组件 */

  function checklist(items, key) {
    var html = '<div class="check-list">';
    items.forEach(function (it, i) {
      var t = typeof it === "string" ? { text: it } : it;
      html += '<label class="check">' +
        '<input type="checkbox" data-key="' + esc(key) + '" data-idx="' + i + '">' +
        '<span class="box">✓</span>' +
        '<span class="ct">' + esc(t.text) + (t.sub ? '<span class="sub">' + esc(t.sub) + "</span>" : "") + "</span>" +
        "</label>";
    });
    return html + "</div>";
  }

  function panel(title, desc, a, b, extra) {
    var topRight = (b != null) ? a : "";
    var inner = (b != null) ? b : a;
    return '<section class="card ' + (extra || "") + '">' +
      '<div class="card-head"><h2>' + esc(title) + "</h2>" +
      (desc ? '<span class="card-desc">' + esc(desc) + "</span>" : "") +
      '<span class="spacer"></span>' + (topRight || "") +
      "</div>" + (inner || "") + "</section>";
  }

  function sectionTitle(text, desc) {
    return '<div class="section-title"><h2>' + esc(text) + "</h2>" +
      (desc ? '<span class="card-desc">' + esc(desc) + "</span>" : "") +
      '<span class="line"></span></div>';
  }

  function headBtn(label, action, kind) {
    return '<button class="btn ' + (kind || "primary") + ' sm" data-action="' + action + '">' +
      icon("plus") + "<span>" + esc(label) + "</span></button>";
  }

  function table(head, rows) {
    var html = '<div class="table-wrap"><table><thead><tr>';
    head.forEach(function (h) { html += "<th>" + esc(h) + "</th>"; });
    html += "</tr></thead><tbody>";
    if (!rows.length) {
      html += '<tr><td colspan="' + head.length + '" class="empty-cell">还没有记录</td></tr>';
    }
    rows.forEach(function (r) {
      html += "<tr>" + r.map(function (c) {
        var v = (typeof c === "object" && c !== null) ? c : { html: esc(c) };
        return '<td' + (v.cls ? ' class="' + v.cls + '"' : "") + ">" + (v.html != null ? v.html : esc(v.text)) + "</td>";
      }).join("") + "</tr>";
    });
    return html + "</tbody></table></div>";
  }

  function delBtn(kind, id) {
    return '<button class="icon-btn" data-del="' + esc(kind) + '" data-id="' + esc(id) + '" title="删除">' + icon("trash") + "</button>";
  }

  function progressRows(items) {
    return '<div class="rows">' + items.map(function (it) {
      return '<div class="row-item">' +
        '<div class="ri-head"><span class="ri-name">' + esc(it.name) + "</span>" +
        (it.current != null ? '<span class="ri-num">' + esc(it.current) + (it.target ? " / " + esc(it.target) : "") + "</span>" : "") +
        "</div>" +
        '<div class="bar ' + (it.tone || "") + '"><i style="width:' + Math.max(0, Math.min(100, it.pct || 0)) + '%"></i></div>' +
        (it.note ? '<div class="ri-note">' + esc(it.note) + "</div>" : "") +
        "</div>";
    }).join("") + "</div>";
  }

  function dotList(items) {
    return '<ul class="dot-list">' + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  function emptyBox(text) {
    return '<div class="empty">' + esc(text) + "</div>";
  }

  /* ------------------------------------------------------------ 图片压缩 */

  function compressImage(file, maxSide, quality, cb) {
    try {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          var scale = Math.min(1, maxSide / Math.max(w, h));
          var cv = document.createElement("canvas");
          cv.width = Math.round(w * scale);
          cv.height = Math.round(h * scale);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          cb(cv.toDataURL("image/jpeg", quality));
        };
        img.onerror = function () { cb(""); };
        img.src = String(fr.result);
      };
      fr.onerror = function () { cb(""); };
      fr.readAsDataURL(file);
    } catch (e) { cb(""); }
  }

  /* --------------------------------------------------------- 浮层：灯箱/地图 */

  function openOverlay(inner, cls) {
    closeOverlay();
    var ov = document.createElement("div");
    ov.className = "overlay show" + (cls ? " " + cls : "");
    ov.id = "ov-layer";
    ov.innerHTML = '<div class="ov-box">' +
      '<button class="ov-close" data-ovclose>✕</button>' + inner + "</div>";
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest && e.target.closest("[data-ovclose]")) closeOverlay();
    });
    return ov;
  }
  function closeOverlay() {
    var ov = document.getElementById("ov-layer");
    if (ov) ov.parentNode.removeChild(ov);
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlay(); });

  /* ---------------------------------------------------------- 图表：体重 */

  function weightChart() {
    var asc = S.all("weight").slice().reverse();
    if (asc.length < 2) return emptyBox("至少记录 2 次体重，这里就会出曲线。");
    var vals = asc.map(function (r) { return num(r.jin); });
    var min = Math.min.apply(null, vals.concat([135]));
    var max = Math.max.apply(null, vals.concat([135]));
    if (max - min < 2) { max += 1; min -= 1; }
    var W = 620, H = 170, padL = 34, padR = 14, padT = 14, padB = 24;
    var X = function (i) { return padL + i * (W - padL - padR) / (asc.length - 1); };
    var Y = function (v) { return padT + (1 - (v - min) / (max - min)) * (H - padT - padB); };

    var line = asc.map(function (r, i) { return X(i).toFixed(1) + "," + Y(num(r.jin)).toFixed(1); }).join(" ");
    var area = "M" + X(0).toFixed(1) + "," + Y(num(asc[0].jin)).toFixed(1) + " " +
      asc.map(function (r, i) { return "L" + X(i).toFixed(1) + "," + Y(num(r.jin)).toFixed(1); }).join(" ") +
      " L" + X(asc.length - 1).toFixed(1) + "," + (H - padB) + " L" + X(0).toFixed(1) + "," + (H - padB) + " Z";
    var goalY = Y(135).toFixed(1);

    return '<div class="chart-wrap"><svg class="chart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet">' +
      '<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.28"/>' +
      '<stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>' +
      '<line class="chart-goal" x1="' + padL + '" y1="' + goalY + '" x2="' + (W - padR) + '" y2="' + goalY + '"/>' +
      '<text class="chart-label" x="' + (W - padR) + '" y="' + (Y(135) - 6).toFixed(1) + '" text-anchor="end">目标 135 斤</text>' +
      '<path class="chart-area" d="' + area + '" fill="url(#wg)"/>' +
      '<polyline class="chart-line" points="' + line + '"/>' +
      asc.map(function (r, i) {
        return '<circle class="chart-dot" cx="' + X(i).toFixed(1) + '" cy="' + Y(num(r.jin)).toFixed(1) + '" r="3.4"/>';
      }).join("") +
      '<text class="chart-label" x="' + padL + '" y="' + (H - 6) + '">' + esc(asc[0].date) + "</text>" +
      '<text class="chart-label" x="' + (W - padR) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(asc[asc.length - 1].date) + "</text>" +
      "</svg></div>";
  }

  /* -------------------------------------------------------- 图表：路线剖面 */

  function profileChart(profile) {
    var W = 300, H = 66, padX = 4, padT = 8, padB = 6;
    var n = profile.length;
    var X = function (i) { return padX + i * (W - padX * 2) / (n - 1); };
    var Y = function (v) { return H - padB - v * (H - padT - padB); };
    var line = profile.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
    var area = "M" + X(0).toFixed(1) + "," + Y(profile[0]).toFixed(1) + " " +
      profile.map(function (v, i) { return "L" + X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") +
      " L" + X(n - 1).toFixed(1) + "," + (H - padB) + " L" + X(0).toFixed(1) + "," + (H - padB) + " Z";
    return '<svg class="profile" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">' +
      '<path class="pf-area" d="' + area + '"/>' +
      '<polyline class="pf-line" points="' + line + '"/>' +
      "</svg>";
  }

  /* ------------------------------------------------------------ 弹窗表单 */

  function fieldHtml(f) {
    var v = f.value == null ? "" : f.value;
    var inner;
    if (f.type === "select") {
      inner = '<select name="' + f.name + '">' + f.options.map(function (o) {
        var val = typeof o === "string" ? o : o.value;
        var lab = typeof o === "string" ? o : o.label;
        return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(lab) + "</option>";
      }).join("") + "</select>";
    } else     if (f.type === "textarea") {
      inner = '<textarea name="' + f.name + '" rows="3" placeholder="' + esc(f.placeholder || "") + '">' + esc(v) + "</textarea>";
    } else if (f.type === "file") {
      inner = '<input name="' + f.name + '" type="file" accept="image/*"' + (f.placeholder ? ' data-label="' + esc(f.placeholder) + '"' : "") + ">";
    } else {
      inner = '<input name="' + f.name + '" type="' + (f.type || "text") + '" value="' + esc(v) +
        '" placeholder="' + esc(f.placeholder || "") + '"' + (f.step ? ' step="' + f.step + '"' : "") +
        (f.min != null ? ' min="' + f.min + '"' : "") + (f.required ? " required" : "") + ">";
    }
    return '<label class="field"><span>' + esc(f.label) + "</span>" + inner +
      (f.hint ? '<em class="hint">' + esc(f.hint) + "</em>" : "") + "</label>";
  }

  var onFormSubmit = null;

  function openForm(title, fields, onSubmit) {
    modalTitle.textContent = title;
    modalForm.innerHTML = fields.map(fieldHtml).join("") +
      '<div class="form-actions">' +
      '<button type="button" class="btn ghost" data-cancel>取消</button>' +
      '<button type="submit" class="btn primary">保存</button></div>';
    onFormSubmit = function () {
      var rec = {};
      fields.forEach(function (f) {
        rec[f.name] = f.type === "file" ? "" : modalForm.elements[f.name].value.trim();
      });
      var fileInput = modalForm.querySelector('input[type="file"]');
      var file = fileInput && fileInput.files && fileInput.files[0];
      if (file) {
        compressImage(file, 1100, 0.72, function (dataUrl) {
          rec.photo = dataUrl;
          onSubmit(rec);
        });
      } else {
        onSubmit(rec);
      }
    };
    modal.hidden = false;
    modal.classList.add("show");
    var first = modalForm.querySelector("input,select,textarea");
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function closeModal() { modal.classList.remove("show"); modal.hidden = true; }

  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-cancel]")) closeModal();
  });

  modalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (onFormSubmit) onFormSubmit();
    closeModal();
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  /* ------------------------------------------------------------ 表单定义 */

  function formWorkout() {
    openForm("记录一次训练", [
      { name: "date", label: "日期", type: "date", value: todayStr(), required: true },
      {
        name: "type", label: "类型", type: "select", options: [
          "哑铃循环 A", "哑铃循环 B", "哑铃循环 A 或 B", "慢跑", "快走", "爬山", "其他"
        ]
      },
      { name: "minutes", label: "时长（分钟）", type: "number", min: 0, placeholder: "30" },
      { name: "moves", label: "做了什么", placeholder: "弯举 15×3 / 推举 12×3 / 深蹲 15×3", hint: "随便写，方便以后回看" },
      { name: "note", label: "备注", type: "textarea", placeholder: "状态、感受、哪里卡住了" }
    ], function (rec) {
      S.add("workouts", rec);
      toast("训练已记录");
      render();
    });
  }

  function formWeight() {
    var latest = S.all("weight")[0];
    openForm("记录体重", [
      { name: "date", label: "日期", type: "date", value: todayStr(), required: true },
      {
        name: "jin", label: "体重（斤）", type: "number", step: "0.1", min: 0, required: true,
        value: latest ? latest.jin : "", placeholder: "145.7", hint: "建议早上空腹、同一条件称"
      },
      { name: "note", label: "备注", placeholder: "比如：昨晚吃咸了 / 这周跑了 3 次" }
    ], function (rec) {
      S.add("weight", rec);
      toast("体重已记录");
      render();
    });
  }

  function formStudy() {
    openForm("记录学习", [
      { name: "date", label: "日期", type: "date", value: todayStr(), required: true },
      { name: "minutes", label: "时长（分钟）", type: "number", min: 0, value: 25, required: true },
      { name: "tag", label: "方向", type: "select", options: ["DPDK", "OVS", "其他"] },
      { name: "topic", label: "学了什么", placeholder: "比如：mempool 的 per-lcore cache" },
      { name: "note", label: "结论 / 没懂的", type: "textarea", placeholder: "一句结论 + 一个疑问" }
    ], function (rec) {
      S.add("study", rec);
      toast("学习已记录");
      render();
    });
  }

  function formHike(route) {
    openForm("爬山打卡", [
      { name: "date", label: "日期", type: "date", value: todayStr(), required: true },
      { name: "route", label: "路线", value: route || "", required: true, placeholder: "八卦田 — 玉皇山 — 万松书院" },
      { name: "minutes", label: "用时（分钟）", type: "number", min: 0, placeholder: "180" },
      { name: "photo", label: "记录截图（可选）", type: "file", placeholder: "比如 Apple Watch 运动记录截图，会压缩后保存" },
      { name: "note", label: "感受", type: "textarea", placeholder: "路况、天气、体力情况" }
    ], function (rec) {
      S.add("hikes", rec);
      toast("打卡成功");
      render();
    });
  }

  function formNote(kind, title, extraFields, bucket) {
    openForm(title, extraFields.concat([
      { name: "note", label: "备注", type: "textarea" }
    ]), function (rec) {
      S.add(bucket || kind, rec);
      toast("已添加");
      render();
    });
  }

  /* --------------------------------------------------------- 渲染：日历 */

  var calRef = new Date();
  var calSel = todayStr();

  var KIND_META = {
    workouts: { label: "训练", tone: "b-primary", icon: "dumbbell" },
    study: { label: "学习", tone: "b-accent", icon: "book" },
    hikes: { label: "爬山", tone: "b-ok", icon: "mountain" },
    meals: { label: "饮食", tone: "b-warn", icon: "sparkles" },
    weight: { label: "体重", tone: "b-warn", icon: "target" },
    events: { label: "活动", tone: "b-accent", icon: "bell" }
  };

  function dayItems(date) {
    var out = [];
    var push = function (kind, text) {
      var m = KIND_META[kind];
      out.push({ kind: kind, label: m.label, tone: m.tone, text: text });
    };
    S.all("workouts").forEach(function (r) { if (r.date === date) push("workouts", r.type + (r.minutes ? " · " + r.minutes + " 分" : "") + (r.moves ? " · " + r.moves : "")); });
    S.all("study").forEach(function (r) { if (r.date === date) push("study", (r.tag || "学习") + " · " + r.minutes + " 分" + (r.topic ? " · " + r.topic : "")); });
    S.all("hikes").forEach(function (r) { if (r.date === date) push("hikes", r.route + (r.minutes ? " · " + r.minutes + " 分" : "")); });
    S.all("meals").forEach(function (r) { if (r.date === date) push("meals", r.type + " · " + r.total + " 大卡"); });
    S.all("weight").forEach(function (r) { if (r.date === date) push("weight", r.jin + " 斤"); });
    S.all("events").forEach(function (r) { if (r.date === date) push("events", r.title + (r.note ? " · " + r.note : "")); });
    return out;
  }

  function dayKinds(date) {
    var set = {};
    dayItems(date).forEach(function (it) { set[it.kind] = 1; });
    return Object.keys(set);
  }

  RENDER.calendar = function () {
    var y = calRef.getFullYear(), m = calRef.getMonth();
    var first = new Date(y, m, 1);
    var startPad = first.getDay();               // 周日=0
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var today = todayStr();
    var html = "";

    html += panel("月视图", "点任意一天看当天记录",
      '<div class="cal-nav">' +
      '<button class="btn ghost sm" data-action="cal-prev">‹ 上月</button>' +
      '<span class="cal-title">' + y + " 年 " + (m + 1) + " 月</span>" +
      '<button class="btn ghost sm" data-action="cal-next">下月 ›</button>' +
      "</div>",
      '<div class="cal-grid">' +
      ["日", "一", "二", "三", "四", "五", "六"].map(function (w) {
        return '<div class="cal-wd">' + w + "</div>";
      }).join("") +
      Array(startPad).fill('<div class="cal-day blank"></div>').join("") +
      (function () {
        var s = "";
        for (var d = 1; d <= daysInMonth; d++) {
          var ds = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
          var kinds = dayKinds(ds);
          var cls = "cal-day" + (ds === today ? " today" : "") + (ds === calSel ? " sel" : "");
          s += '<button class="' + cls + '" data-cal="' + ds + '"><span class="cal-num">' + d + "</span>" +
            '<span class="cal-dots">' + kinds.map(function (k) {
              var tone = (KIND_META[k].tone || "b-primary").replace("b-", "dot-");
              return '<i class="' + tone + '"></i>';
            }).join("") + "</span></button>";
        }
        return s;
      })() +
      "</div>");

    var items = dayItems(calSel);
    var dayDetail =
      '<div class="cal-detail-head"><h3>' + esc(calSel) + "</h3>" +
      '<button class="btn primary sm" data-action="add-event">' + icon("plus") + "<span>添加活动</span></button></div>" +
      (items.length
        ? '<div class="check-list">' + items.map(function (it) {
            return '<div class="note-item"><span class="badge ' + it.tone + '">' + esc(it.label) + "</span>" +
              '<span class="note-txt">' + esc(it.text) + "</span>" +
              (it.kind === "events"
                ? (function () {
                    var ev = S.all("events").filter(function (r) { return r.date === calSel && r.title + (r.note ? " · " + r.note : "") === it.text; })[0];
                    return ev ? delBtn("events", ev.id) : "";
                  })()
                : "") +
              "</div>";
          }).join("") + "</div>"
        : emptyBox("这天还没有记录。点右上角「添加活动」加一条，或从各栏目打卡。"));

    html += panel("当天做了什么", "日历上点哪天，这里就显示哪天", "", dayDetail);

    html += '<div class="cal-legend">' +
      Object.keys(KIND_META).map(function (k) {
        var tone = (KIND_META[k].tone || "b-primary").replace("b-", "dot-");
        return '<span><i class="' + tone + '"></i>' + esc(KIND_META[k].label) + "</span>";
      }).join("") + "</div>";

    return html;
  };

  /* --------------------------------------------------------- 渲染：热量 */

  var UNIT_GRAMS = { "鸡蛋": 50, "香蕉": 120, "牛奶": 250, "酸奶": 200, "可乐": 330, "啤酒": 330, "奶茶": 500, "豆浆": 250, "拿铁": 350, "玉米": 200, "苹果": 200, "汉堡": 1, "包子": 1, "馒头": 1 };

  function parseFoods(text) {
    var items = [], unmatched = [];
    String(text || "").split(/[\n;；]+/).forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var m = line.match(/^(.+?)[\s:：]*(\d+(?:\.\d+)?)\s*(克|g|G|ml|毫升|个|碗|杯|份|根|块|瓶|罐)?$/);
      if (!m) { unmatched.push(line); return; }
      var name = m[1].trim().replace(/[，,、]$/, "");
      var qty = parseFloat(m[2]);
      var unit = (m[3] || "").toLowerCase();
      var grams = qty;
      if (["个", "根", "块", "碗", "杯", "份", "瓶", "罐"].indexOf(m[3] || "") >= 0) {
        grams = (UNIT_GRAMS[name] || 100) * qty;
      }
      var hit = null;
      for (var i = 0; i < C.foodDb.length; i++) {
        if (name.indexOf(C.foodDb[i].n) >= 0 || C.foodDb[i].n.indexOf(name) >= 0) { hit = C.foodDb[i]; break; }
      }
      if (hit) items.push({ name: name, grams: Math.round(grams), kcal: Math.round(hit.k / 100 * grams) });
      else unmatched.push(line);
    });
    return { items: items, unmatched: unmatched };
  }

  function dietTargets() {
    var p = C.profile, s = S.settings();
    var st = S.stats();
    var kg = (st.weightLatest || p.weightJin) / 2;
    var bmr = 10 * kg + 6.25 * p.height - 5 * (s.age || 30) + (s.sex === "female" ? -161 : 5);
    var factor = { sedentary: 1.2, light: 1.375, moderate: 1.55 }[s.activity] || 1.375;
    var tdee = Math.round(bmr * factor);
    return { bmr: Math.round(bmr), tdee: tdee, target: Math.max(1200, tdee - 500) };
  }

  function kcalOn(date) {
    return S.all("meals").filter(function (r) { return r.date === date; })
      .reduce(function (a, r) { return a + (num(r.total) || 0); }, 0);
  }

  function formMeal() {
    openForm("记一餐", [
      { name: "date", label: "日期", type: "date", value: todayStr(), required: true },
      { name: "type", label: "餐次", type: "select", options: ["早餐", "午餐", "晚餐", "加餐"] },
      { name: "foods", label: "吃了什么", type: "textarea", placeholder: "每行一条：食物 克数（或个数）\n例：米饭 200\n鸡胸肉 150\n鸡蛋 1", hint: "食物名会自动匹配热量库；库里没有的行会被标出，热量算不进" },
      { name: "photo", label: "拍照存档（可选）", type: "file", placeholder: "照片仅作记录，页面不识图，热量靠上面的文字算" }
    ], function (rec) {
      var parsed = parseFoods(rec.foods);
      var total = parsed.items.reduce(function (a, b) { return a + b.kcal; }, 0);
      S.add("meals", {
        date: rec.date, type: rec.type,
        items: parsed.items, unmatched: parsed.unmatched,
        photo: rec.photo || "", total: total, note: rec.foods
      });
      toast("已记录，本餐约 " + total + " 大卡" + (parsed.unmatched.length ? "（有 " + parsed.unmatched.length + " 行没匹配到，未计入）" : ""));
      render();
    });
  }

  function photoThumb(rec, kind, id) {
    if (!rec.photo) return "";
    return '<img class="meal-thumb" src="' + esc(rec.photo) + '" alt="记录照片" data-photo="' + esc(kind) + ":" + esc(id) + '">';
  }

  function findPhoto(kind, id) {
    var arr = S.all(kind);
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i].photo || "";
    return "";
  }

  /* ------------------------------------------------------------- 地图 */

  function loadTMap(key, cb) {
    if (window.TMap) return cb();
    var sc = document.createElement("script");
    sc.src = "https://map.qq.com/api/gljs?v=1.exp&key=" + encodeURIComponent(key);
    sc.onload = function () { cb(); };
    sc.onerror = function () { toast("腾讯地图 SDK 加载失败，检查 key 和网络"); };
    document.head.appendChild(sc);
  }

  function showRouteMap(route) {
    var key = S.settings().mapKey;
    var pathHint = '<div class="map-hint">路线为示意路径（关键节点连线），精确导航请用地图 App。</div>';
    if (!key) {
      openOverlay("<h3>" + esc(route.name) + " · 路线图</h3>" +
        '<div class="note warn">还没填腾讯地图 Key，真实地图显示不了。</div>' +
        '<div class="sub-title">怎么拿 Key（免费，两分钟）</div>' +
        dotList([
          "打开 lbs.qq.com，用 QQ/微信登录，进「控制台」",
          "创建应用 → 添加 Key，类型选「WebServiceAPI」或「WebGL」",
          "在 Key 设置里把域名白名单加上：xiuyuansun0212.github.io 和 life-assistant-27600.app.workbuddy.host",
          "把 Key 填到「数据」页 → 个人设置里保存"
        ]) + pathHint, "map-guide");
      return;
    }
    var ov = openOverlay("<h3>" + esc(route.name) + " · 路线图</h3>" +
      '<div id="routeMap" class="route-map"></div>' + pathHint, "map-modal");
    loadTMap(key, function () {
      var box = document.getElementById("routeMap");
      if (!box || !window.TMap) return;
      try {
        var path = route.path.map(function (p) { return new TMap.LatLng(p[0], p[1]); });
        var map = new TMap.Map(box, {
          zoom: 13,
          center: path[Math.floor(path.length / 2)],
          viewMode: "2D"
        });
        new TMap.MultiPolyline({
          map: map,
          styles: {
            route: new TMap.PolylineStyle({
              color: "#37c08a", width: 5,
              lineCap: "round", lineJoin: "round"
            })
          },
          geometries: [{ id: "r", styleId: "route", paths: path }]
        });
        var mid = path[Math.floor(path.length / 2)];
        new TMap.MultiLabel({
          map: map,
          styles: {
            pl: new TMap.LabelStyle({ color: "#ffffff", bgColor: "rgba(20,40,32,0.85)", borderRadius: 6, fontSize: 12, padding: { top: 4, right: 8, bottom: 4, left: 8 } })
          },
          geometries: route.ptNames.map(function (n, i) {
            return { id: "p" + i, styleId: "pl", position: path[i], content: n };
          }).concat([
            { id: "pe", styleId: "pl", position: mid, content: "" }
          ])
        });
      } catch (err) {
        toast("地图初始化失败：" + err.message);
      }
    });
  }


  RENDER.overview = function () {
    var st = S.stats();
    var wd = C.fitness.weekly[(new Date().getDay() + 6) % 7];
    var html = "";

    html += '<section class="hero"><div class="hero-inner">' +
      "<h2>" + greet() + "，" + esc(C.profile.name) + "</h2>" +
      '<p class="hero-sub">' + esc(C.profile.city) + " · " + esc(C.profile.job) + "</p>" +
      '<div class="hero-meta">' +
      '<span class="hero-chip">近 7 天训练 <b>' + st.workouts7 + "</b> 次</span>" +
      '<span class="hero-chip">近 7 天学习 <b>' + st.study7 + "</b> 分钟</span>" +
      '<span class="hero-chip">连续打卡 <b>' + st.streak + "</b> 天</span>" +
      "</div></div></section>";

    html += '<div class="grid g4">' +
      statCard("dumbbell", "近 7 天训练", st.workouts7, "次", st.workoutMin7 ? "共 " + st.workoutMin7 + " 分钟" : "还没开始，记第一笔", Math.min(100, st.workouts7 / 4 * 100)) +
      statCard("book", "近 7 天学习", st.study7, "分钟", "目标 150 分钟（30×5）", Math.min(100, st.study7 / 150 * 100)) +
      statCard("mountain", "爬山完成", st.hikesDone, "条", st.hikeMin ? "累计 " + Math.round(st.hikeMin / 60) + " 小时" : "去打卡一条路线", Math.min(100, st.hikesDone / 6 * 100)) +
      statCard("target", "当前体重", st.weightLatest || "—", "斤", st.weightLatest ? (st.weightDelta <= 0 ? "比首次 ↓" + Math.abs(st.weightDelta) : "比首次 ↑" + st.weightDelta) + " 斤" : "记一次体重开始追踪", st.weightLatest ? Math.max(0, Math.min(100, (145.7 - st.weightLatest) / (145.7 - 135) * 100)) : 0) +
      "</div>";

    html += '<div class="grid g3">' +
      panel("快速记录", "点一下就能加",
        '<div class="quick">' +
        quickBtn("记一次训练", "add-workout") +
        quickBtn("记录体重", "add-weight") +
        quickBtn("学习打卡", "add-study") +
        quickBtn("爬山打卡", "add-hike") +
        "</div>") +
      panel("今天练什么", "按周计划自动取当天",
        '<div class="today"><div class="today-day">' + esc(wd.day) + "</div>" +
        '<div class="today-focus">' + esc(wd.focus) + "</div>" +
        '<div class="today-detail">' + esc(wd.detail) + "</div></div>") +
      panel("减脂怎么走", "一句话版本",
        '<p class="plain">' + esc(C.fitness.strategy) + "</p>" +
        '<div class="note" style="margin-top:12px">' + esc(C.fitness.intake) + "</div>") +
      "</div>";

    html += panel("最近记录", "所有栏目一起看",
      '<button class="btn ghost sm" data-action="goto-data">数据管理</button>',
      recentTable(8));

    return html;
  };

  function statCard(ic, label, value, unit, foot, pct) {
    return '<div class="stat"><div class="st-top"><span class="st-icon">' + icon(ic) + "</span>" +
      '<span class="st-label">' + esc(label) + "</span></div>" +
      '<div class="st-value">' + esc(value) + "<span>" + esc(unit) + "</span></div>" +
      '<div class="bar"><i style="width:' + (pct || 0) + '%"></i></div>' +
      '<div class="st-foot">' + esc(foot) + "</div></div>";
  }

  function quickBtn(label, action) {
    return '<button class="quick-btn" data-action="' + action + '"><span class="qb-plus">+</span>' + esc(label) + "</button>";
  }

  function recentTable(n) {
    var rows = [];
    S.all("workouts").forEach(function (r) {
      rows.push({ d: r.date, tag: "训练", text: r.type + (r.minutes ? " · " + r.minutes + " 分钟" : "") + (r.moves ? " · " + r.moves : ""), kind: "workouts", id: r.id, tone: "b-primary" });
    });
    S.all("study").forEach(function (r) {
      rows.push({ d: r.date, tag: "学习", text: (r.tag || "学习") + " · " + r.minutes + " 分钟" + (r.topic ? " · " + r.topic : ""), kind: "study", id: r.id, tone: "b-accent" });
    });
    S.all("hikes").forEach(function (r) {
      rows.push({ d: r.date, tag: "爬山", text: r.route + (r.minutes ? " · " + r.minutes + " 分钟" : ""), kind: "hikes", id: r.id, tone: "b-ok" });
    });
    S.all("weight").forEach(function (r) {
      rows.push({ d: r.date, tag: "体重", text: r.jin + " 斤" + (r.note ? " · " + r.note : ""), kind: "weight", id: r.id, tone: "b-warn" });
    });
    rows.sort(function (a, b) { return a.d < b.d ? 1 : -1; });
    rows = rows.slice(0, n);
    if (!rows.length) return emptyBox("还没有任何记录。上面点「快速记录」开始。");
    return table(["日期", "类型", "内容", ""], rows.map(function (r) {
      return [
        { text: r.d, cls: "num nowrap" },
        { html: '<span class="badge ' + r.tone + '">' + esc(r.tag) + "</span>", cls: "nowrap" },
        r.text,
        { html: delBtn(r.kind, r.id), cls: "nowrap right" }
      ];
    }));
  }

  /* --------------------------------------------------------- 渲染：健身 */

  RENDER.fitness = function () {
    var f = C.fitness, p = C.profile, st = S.stats();
    var latest = st.weightLatest || p.weightJin;
    var bmi = +(latest / 2 / Math.pow(p.height / 100, 2)).toFixed(1);
    var start = 145.7, goal = 135;
    var done = Math.max(0, Math.min(100, (start - latest) / (start - goal) * 100));
    var html = "";

    html += '<div class="grid g2">' +
      panel("我的档案", "目标减脂",
        '<div class="kv">' +
        kvRow("身高", p.height + " cm") +
        kvRow("当前体重", latest + " 斤（" + (latest / 2).toFixed(1) + " kg）") +
        kvRow("BMI", bmi + (bmi >= 24 ? " · 偏重" : bmi >= 18.5 ? " · 正常范围" : "")) +
        kvRow("器械", esc(f.gear)) +
        kvRow("身体情况", esc(f.constraint)) +
        kvRow("目标", esc(f.goalDetail)) +
        "</div>") +
      panel("目标进度", "从 145.7 斤到 135 斤",
        progressRows([{ name: "减重进度", current: (start - latest).toFixed(1), target: (start - goal).toFixed(1) + " 斤", pct: done }]) +
        '<div class="met-row">' +
        metBox("已减", (start - latest).toFixed(1), "斤") +
        metBox("还剩", Math.max(0, latest - goal).toFixed(1), "斤") +
        metBox("称重次数", st.weightRecords, "次") +
        "</div>" +
        '<div class="note" style="margin-top:12px">' + esc(C.fitness.weighTips) + "</div>") +
      "</div>";

    html += panel("训练记录", "近 30 天共 " + st.workouts30 + " 次",
      headBtn("记一次训练", "add-workout"),
      table(["日期", "类型", "时长", "内容 / 备注", ""],
        S.all("workouts").map(function (r) {
          return [
            { text: r.date, cls: "num nowrap" },
            { text: r.type, cls: "strong nowrap" },
            { text: r.minutes ? r.minutes + " 分" : "—", cls: "num nowrap" },
            (r.moves || "") + (r.note ? '<span class="dim"> · ' + esc(r.note) + "</span>" : ""),
            { html: delBtn("workouts", r.id), cls: "nowrap right" }
          ];
        })));

    html += panel("体重曲线", st.weightRecords + " 次记录",
      headBtn("记录体重", "add-weight"),
      weightChart());

    /* ---- 热量预算与饮食 ---- */
    var dt = dietTargets();
    var eaten = kcalOn(todayStr());
    var remain = dt.target - eaten;
    var eatenPct = Math.max(0, Math.min(100, eaten / dt.target * 100));
    var mealRows = S.all("meals").map(function (r) {
      return [
        { text: r.date, cls: "num nowrap" },
        { text: r.type, cls: "nowrap" },
        { html: (r.items || []).map(function (it) { return esc(it.name + " " + it.grams + "g"); }).join("、") +
          (r.unmatched && r.unmatched.length ? '<span class="dim"> · 没匹配到：' + esc(r.unmatched.join("、")) + "</span>" : "") +
          photoThumb(r, "meals", r.id), cls: "" },
        { text: r.total + " 大卡", cls: "num nowrap strong" },
        { html: delBtn("meals", r.id), cls: "nowrap right" }
      ];
    });

    html += '<div class="grid g2">' +
      panel("每日热量预算", "按你的身高体重和活动水平算",
        '<button class="btn ghost sm" data-action="open-settings">改个人参数</button>',
        '<div class="met-row">' +
        metBox("基础代谢", dt.bmr, "大卡") +
        metBox("日常消耗 TDEE", dt.tdee, "大卡") +
        metBox("减脂目标摄入", dt.target, "大卡") +
        "</div>" +
        '<div class="row-item" style="margin-top:12px"><div class="ri-head"><span class="ri-name">今天已摄入</span>' +
        '<span class="ri-num">' + eaten + " / " + dt.target + " 大卡</span></div>" +
        '<div class="bar ' + (eaten > dt.target ? "warn" : "") + '"><i style="width:' + eatenPct + '%"></i></div>' +
        '<div class="ri-note">' + (remain >= 0 ? "还能吃约 " + remain + " 大卡，缺口达标（TDEE − 500）" : "今天已超 " + (-remain) + " 大卡，明天补回来就行") + "</div></div>" +
        '<div class="note" style="margin-top:12px">缺口逻辑：每天比消耗少 500 大卡 ≈ 每周减 0.5kg 纯脂肪。热量按食物库估算，不用精确到个位数，趋势对就行。别低于 1200。</div>') +
      panel("饮食记录", "记一餐，自动算热量",
        headBtn("记一餐", "add-meal"),
        table(["日期", "餐次", "吃了什么", "热量", ""], mealRows)) +
      "</div>";

    html += '<div class="grid g2">' +
      panel("每周安排", "力量 3 次 + 跑步 2 次 + 休息 2 天",
        table(["日", "内容", "具体做什么", "强度"], f.weekly.map(function (r) {
          return [
            { text: r.day, cls: "strong nowrap" },
            { text: r.focus, cls: "nowrap" },
            r.detail,
            { html: '<span class="badge ' + (r.load === "中" ? "b-primary" : "") + '">' + esc(r.load) + "</span>", cls: "nowrap" }
          ];
        }))) +
      panel("循环训练怎么练", "5kg 哑铃的核心用法",
        '<p class="plain">' + esc(f.circuitRule) + "</p>" +
        '<div class="note ok" style="margin-top:12px"><b>为什么高次数：</b>5kg 加到 20 次也不吃力，说明重量只能练耐力。那就顺势走循环——心率上去、总做功够，减脂效率比硬加重量高。</div>' +
        dotList(["每次训练前热身 5 分钟：开合跳、肩绕环、深蹲 10 次", "训练后拉伸 5 分钟，重点是腿后侧和肩", "同一天不要既跑长距离又做循环，容易过量"]) +
        panel("饮食一句话", "", "", '<p class="plain">' + esc(f.intake) + "</p>")) +
      "</div>";

    html += sectionTitle("动作库", "真实现场动图 · 点开有分步教程");
    html += '<div class="grid g-auto moves">' + f.moves.map(function (m, i) {
      var fig = m.gif
        ? '<img class="move-gif" loading="lazy" src="' + esc(m.gif) + '" alt="' + esc(m.name) + '">'
        : '<div class="move-fig">' + (m.anim || '<div class="move-noanim">' + icon("dumbbell") + "</div>") + "</div>";
      return '<article class="move card tight">' +
        '<div class="move-fig move-fig--gif">' + fig + "</div>" +
        '<div class="move-head"><h3>' + esc(m.name) + "</h3>" +
        '<span class="badge b-primary">' + esc(m.part) + "</span></div>" +
        '<div class="move-dose">' + esc(m.dose) + "</div>" +
        '<ul class="move-cues">' + m.cues.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
        (m.steps && m.steps.length
          ? '<details class="move-steps"><summary>分步教程</summary><ol>' +
            m.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
            (m.src ? '<a class="ext-link" target="_blank" rel="noopener" href="' + esc(m.src) + '">来源页 ↗</a>' : "") +
            "</details>"
          : "") +
        (m.wrong ? '<div class="move-wrong">' + esc(m.wrong) + "</div>" : "") +
        "</article>";
    }).join("") + "</div>";
    html += '<p class="dim attrib">' + esc(C.attrib.moves) + "</p>";

    return html;
  };

  function kvRow(k, v) {
    return '<div class="kv-item"><span class="k">' + esc(k) + '</span><span class="v">' + v + "</span></div>";
  }

  function metBox(label, value, unit) {
    return '<div class="met"><div class="met-v">' + esc(value) + "<span>" + esc(unit) + "</span></div>" +
      '<div class="met-l">' + esc(label) + "</div></div>";
  }

  /* --------------------------------------------------------- 渲染：学习 */

  var studyFilter = "全部";

  RENDER.study = function () {
    var s = C.study, st = S.stats();
    var html = "";

    html += '<div class="grid g3">' +
      statCard("book", "累计学习", st.studyTotal, "分钟", st.studySessions + " 次记录", Math.min(100, st.studyTotal / 600 * 100)) +
      statCard("target", "近 7 天", st.study7, "分钟", "目标 150 分钟", Math.min(100, st.study7 / 150 * 100)) +
      statCard("bell", "连续打卡", st.streak, "天", "训练、学习、爬山、体重任一条都算", Math.min(100, st.streak / 21 * 100)) +
      "</div>";

    html += panel("学习记录", s.goal, headBtn("记一次学习", "add-study"),
      table(["日期", "方向", "时长", "学了什么 / 结论", ""],
        S.all("study").map(function (r) {
          return [
            { text: r.date, cls: "num nowrap" },
            { html: '<span class="badge b-accent">' + esc(r.tag || "其他") + "</span>", cls: "nowrap" },
            { text: r.minutes + " 分", cls: "num nowrap" },
            (r.topic || "") + (r.note ? '<span class="dim"> · ' + esc(r.note) + "</span>" : ""),
            { html: delBtn("study", r.id), cls: "nowrap right" }
          ];
        })));

    html += '<div class="grid g2">' +
      panel("每天 20–30 分钟怎么用", "三段式，不用长时间",
        '<div class="rhythm">' + s.rhythm.map(function (r) {
          return '<div class="rhythm-item"><span class="rhythm-t">' + esc(r.t) + "</span><span>" + esc(r.d) + "</span></div>";
        }).join("") + "</div>" +
        '<div class="note" style="margin-top:12px">' + esc(s.note) + "</div>") +
      panel("知识卡筛选", "点标签过滤",
        '<div class="tag-row" id="studyTags">' +
        ["全部", "DPDK", "OVS"].map(function (t) {
          return '<button class="chip' + (t === studyFilter ? " on" : "") + '" data-tag="' + t + '">' + t + "</button>";
        }).join("") + "</div>" +
        '<p class="plain" style="margin-top:12px">共 ' + s.cards.length + " 张卡，当前显示 " +
        (studyFilter === "全部" ? s.cards.length : s.cards.filter(function (c) { return c.tag === studyFilter; }).length) + " 张。</p>") +
      "</div>";

    var cards = studyFilter === "全部" ? s.cards : s.cards.filter(function (c) { return c.tag === studyFilter; });
    html += '<div class="grid g-auto kcards">' + cards.map(function (c, i) {
      return '<article class="kcard">' +
        '<div class="kcard-top"><span class="badge ' + (c.tag === "OVS" ? "b-warn" : "b-primary") + '">' + esc(c.tag) + "</span>" +
        '<span class="kcard-idx">' + String(i + 1).padStart(2, "0") + "</span></div>" +
        "<h3>" + esc(c.title) + "</h3>" +
        "<p>" + esc(c.body) + "</p></article>";
    }).join("") + "</div>";

    html += sectionTitle("系统学习", "中长文，一周读一篇刚刚好");
    html += s.articles.map(function (a, i) {
      return '<details class="article card tight">' +
        '<summary><span class="badge b-accent">' + esc(a.tag) + "</span>" +
        '<span class="art-title">' + esc(a.title) + "</span>" +
        '<span class="dim num">' + esc(a.minutes) + "</span></summary>" +
        '<p class="plain art-summary">' + esc(a.summary) + "</p>" +
        a.body.map(function (sec) {
          return "<h4>" + esc(sec.h) + "</h4>" +
            '<ul class="dot-list">' + sec.ps.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>";
        }).join("") +
        '<div class="sub-title">相关链接</div>' +
        '<div class="link-row">' + a.links.map(function (l) {
          return '<a class="ext-link" target="_blank" rel="noopener" href="' + esc(l.u) + '">' + esc(l.t) + " ↗</a>";
        }).join("") + "</div></details>";
    }).join("");

    return html;
  };

  /* --------------------------------------------------------- 渲染：爬山 */

  RENDER.hikes = function () {
    var h = C.hikes, st = S.stats();
    var done = S.all("hikes");
    var custom = S.all("routes");
    var html = "";

    html += panel("爬山", h.goal,
      '<div class="met-row">' +
      metBox("已完成", st.hikesDone, "条") +
      metBox("累计用时", Math.round(st.hikeMin / 60), "小时") +
      metBox("待打卡", h.routes.length - done.length + custom.length, "条") +
      "</div>");

    html += panel("路线与打卡", h.note, headBtn("自定义路线", "add-route"), "");

    html += '<div class="grid g-auto routes">' + h.routes.map(function (r, i) {
      var rec = done.filter(function (d) { return d.route === r.name; })[0];
      return '<article class="route' + (rec ? " is-done" : "") + '">' +
        '<div class="route-top"><div><h3>' + esc(r.name) + '</h3>' +
        '<div class="route-region">' + esc(r.region) + "</div></div>" +
        '<span class="badge ' + (r.tone ? "b-" + r.tone : "") + '">' + esc(r.level) + "</span></div>" +
        profileChart(r.profile) +
        (r.path
          ? '<button class="btn ghost sm map-btn" data-action="show-map" data-idx="' + i + '">在地图上看这条线</button>'
          : "") +
        '<div class="route-nodes">' + r.nodes.map(function (n) { return '<span class="node">' + esc(n) + "</span>"; }).join('<span class="node-sep">→</span>') + "</div>" +
        '<div class="route-meta">' +
        '<div><span class="k">距离</span>' + esc(r.dist) + "</div>" +
        '<div><span class="k">爬升</span>' + esc(r.gain) + "</div>" +
        '<div><span class="k">耗时</span>' + esc(r.time) + "</div>" +
        '<div><span class="k">季节</span>' + esc(r.season) + "</div>" +
        "</div>" +
        '<div class="route-note">' + esc(r.note) + "</div>" +
        '<div class="route-foot">' +
        (rec
          ? '<span class="stamp">' + icon("check") + "已打卡 " + esc(rec.date) + "</span>" +
            photoThumb(rec, "hikes", rec.id) +
            '<button class="icon-btn" data-del="hikes" data-id="' + esc(rec.id) + '" title="取消打卡">' + icon("trash") + "</button>"
          : '<button class="btn primary sm" data-action="add-hike" data-route="' + esc(r.name) + '">' + icon("check") + "<span>打卡</span></button>") +
        "</div></article>";
    }).join("") + "</div>";

    if (custom.length) {
      html += '<div class="grid g-auto routes" style="margin-top:16px">' + custom.map(function (r) {
        var rec = done.filter(function (d) { return d.route === r.route; })[0];
        return '<article class="route' + (rec ? " is-done" : "") + '">' +
          '<div class="route-top"><div><h3>' + esc(r.route) + "</h3>" +
          '<div class="route-region">' + esc(r.region || "自定义") + "</div></div>" +
          '<span class="badge b-accent">自建</span></div>' +
          '<div class="route-meta">' +
          '<div><span class="k">距离</span>' + esc(r.dist || "—") + "</div>" +
          '<div><span class="k">爬升</span>' + esc(r.gain || "—") + "</div>" +
          '<div><span class="k">耗时</span>' + esc(r.time || "—") + "</div>" +
          '<div><span class="k">季节</span>' + esc(r.season || "—") + "</div>" +
          "</div>" +
          (r.note ? '<div class="route-note">' + esc(r.note) + "</div>" : "") +
          '<div class="route-foot">' +
          (rec
            ? '<span class="stamp">' + icon("check") + "已打卡 " + esc(rec.date) + "</span>"
            : '<button class="btn primary sm" data-action="add-hike" data-route="' + esc(r.route) + '">' + icon("check") + "<span>打卡</span></button>") +
          '<button class="icon-btn" data-del="routes" data-id="' + esc(r.id) + '" title="删除路线">' + icon("trash") + "</button>" +
          "</div></article>";
      }).join("") + "</div>";
    }

    html += '<div class="grid g2">' +
      panel("装备清单", "勾选自动保存", checklist(h.gear, "hike-gear")) +
      panel("安全提醒", "看清楚再去", dotList(h.safety) +
        '<div class="note warn" style="margin-top:12px">路线数据都是我按经验给的大致值，真正出发前我再帮你核实当天的路况、开放情况和交通。</div>') +
      "</div>";

    return html;
  };

  /* --------------------------------------------------------- 渲染：旅游 */

  RENDER.travel = function () {
    var t = C.travel, wish = S.all("wishlist");
    var html = "";

    html += '<div class="grid g2">' +
      travelCard(t.short, "短期目标") +
      travelCard(t.long, "长期目标") +
      "</div>";

    html += panel("心愿清单", wish.length + " 个目的地", headBtn("添加目的地", "add-wish"),
      wish.length
        ? '<div class="grid g-auto">' + wish.map(function (w) {
            return '<article class="wish"><div class="wish-top"><h3>' + esc(w.place) + "</h3>" +
              '<span class="badge b-accent">' + esc(w.when || "想去") + "</span></div>" +
              (w.why ? '<div class="wish-why">' + esc(w.why) + "</div>" : "") +
              '<div class="wish-foot"><span class="dim num">' + esc(w.date || "") + "</span>" +
              delBtn("wishlist", w.id) + "</div></article>";
          }).join("") + "</div>"
        : emptyBox("清单是空的。把想去的地方都扔进来，我来补交通、季节和预算。"));

    return html;
  };

  function travelCard(d, badgeText) {
    return panel(d.name, badgeText,
      cityBanner(d) +
      '<div class="route-region">' + esc(d.region) + "</div>" +
      '<p class="plain" style="margin-top:10px">' + esc(d.note) + "</p>" +
      '<div class="phase-list">' + d.plan.map(function (p, i) {
        return '<div class="phase"><div class="phase-idx">' + (i + 1) + '</div><div class="phase-body"><h4>' + esc(p) + "</h4></div></div>";
      }).join("") + "</div>" +
      '<div class="sub-title">准备清单</div>' +
      checklist(d.checklist, "trip-" + d.name));
  }

  function cityBanner(d) {
    var sky = {
      hengdian: {
        g: "linear-gradient(180deg,#3b2a20 0%,#7a4a2b 55%,#c98a4b 100%)",
        s: '<path d="M0 70 0 46 10 46 10 34 22 34 22 46 34 46 34 22 46 10 58 22 58 46 74 46 74 30 88 30 88 46 100 46 100 38 112 38 112 46 120 46 120 70Z"/>'
      },
      japan: {
        g: "linear-gradient(180deg,#28324e 0%,#5d6f9e 55%,#e8b7a0 100%)",
        s: '<path d="M0 70 0 52 8 52 22 34 36 52 44 52 44 40 60 26 76 40 76 52 88 52 102 38 112 46 120 46 120 70Z"/><circle cx="96" cy="16" r="7" fill="rgba(255,255,255,0.75)" stroke="none"/>'
      }
    }[d.theme] || { g: "linear-gradient(180deg,#2c3e50,#4b6cb7)", s: '<path d="M0 70 0 50 15 50 15 30 30 44 45 20 60 40 75 24 90 46 105 34 120 50 120 70Z"/>' };
    var photos = { hengdian: "assets/img/travel/hengdian.png", japan: "assets/img/travel/japan.png" };
    var photo = photos[d.theme];
    return '<div class="city-banner" style="background:' + sky.g + '">' +
      '<svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path fill="rgba(0,0,0,0.35)" d="' + sky.s + '"/></svg>' +
      (photo ? '<img class="city-photo" src="' + photo + '" alt="' + esc(d.name) + '" onerror="this.remove()">' : "") +
      '<span class="city-name">' + esc(d.name) + "</span></div>";
  }

  /* --------------------------------------------------------- 渲染：娱乐 */

  RENDER.fun = function () {
    var html = "";
    html += panel("在看 / 在玩", "只登记，不打扰", "");
    html += '<div class="grid g-auto">' + C.fun.map(function (f) {
      return '<article class="fun-card"><div class="fun-top">' +
        '<span class="badge b-accent">' + esc(f.status) + "</span>" +
        '<span class="fun-type">' + esc(f.type) + "</span></div>" +
        "<h3>" + esc(f.name) + "</h3>" +
        '<p class="dim">' + esc(f.note) + "</p></article>";
    }).join("") + "</div>";

    var notes = S.all("notes");
    html += panel("还想看的 / 想玩的", "随手加，我帮你记着", headBtn("添加一条", "add-note"),
      notes.length
        ? '<div class="check-list">' + notes.map(function (n) {
            return '<div class="note-item"><span class="note-txt">' + esc(n.note) + "</span>" +
              '<span class="dim num">' + esc(n.date) + "</span>" + delBtn("notes", n.id) + "</div>";
          }).join("") + "</div>"
        : emptyBox("这里留给你自由填，比如下一部想追的剧、想补的游戏。"));

    return html;
  };

  /* --------------------------------------------------------- 渲染：数据 */

  RENDER.data = function () {
    var st = S.stats();
    var counts = [
      ["训练记录", S.all("workouts").length],
      ["学习记录", S.all("study").length],
      ["体重记录", S.all("weight").length],
      ["爬山打卡", S.all("hikes").length],
      ["自建路线", S.all("routes").length],
      ["心愿目的地", S.all("wishlist").length]
    ];
    var html = "";

    html += panel("个人设置", "热量计算、地图都用得到",
      '<button class="btn primary sm" data-action="open-settings">打开设置</button>',
      (function () {
        var s = S.settings();
        return '<div class="kv">' +
          kvRow("年龄 / 性别", s.age + " · " + (s.sex === "female" ? "女" : "男")) +
          kvRow("活动水平", { sedentary: "久坐", light: "轻度（每周动 1–3 次）", moderate: "中度（每周动 3–5 次）" }[s.activity] || s.activity) +
          kvRow("腾讯地图 Key", s.mapKey ? '<span class="ok-text">已设置</span>' : '<span class="dim">未设置，地图页会提示怎么申请</span>') +
          "</div>";
      })());

    html += panel("数据都在浏览器本地", "换设备或清缓存会丢，所以记得导出备份",
      '<div class="met-row">' + counts.map(function (c) { return metBox(c[0], c[1], "条"); }).join("") + "</div>" +
      '<div class="note" style="margin-top:14px">这份工作台是纯静态网页，没有服务器。你录入的数据保存在当前浏览器里，' +
      "部署到公网后也一样——每台设备、每个浏览器各自独立。想跨设备统一，就用下面的导出 / 导入。</div>");

    html += panel("导出 / 导入", "导出是一个 JSON 文件",
      '<div class="btn-row">' +
      '<button class="btn primary" data-action="export-json">' + icon("download") + "<span>导出 JSON</span></button>" +
      '<button class="btn ghost" data-action="copy-json">复制到剪贴板</button>' +
      '<label class="btn ghost file-btn">' + icon("upload") + "<span>选择文件导入</span>" +
      '<input type="file" id="importFile" accept="application/json,.json" hidden></label>' +
      "</div>" +
      '<div class="sub-title">导入 / 导出内容（也可以直接粘贴）</div>' +
      '<textarea id="dataBox" class="data-box" rows="8" spellcheck="false" placeholder="导出的 JSON 会出现在这里，粘贴 JSON 后点下面「从文本框导入」即可恢复。"></textarea>' +
      '<div class="btn-row" style="margin-top:10px">' +
      '<button class="btn ghost" data-action="import-text">从文本框导入</button>' +
      "</div>");

    html += panel("清空", "不可撤销，先导出再清",
      '<button class="btn danger" data-action="clear-all">' + icon("trash") + "<span>清空全部记录</span></button>");

    return html;
  };

  /* ---------------------------------------------------------------- 导航 */

  var SECTIONS = [
    { id: "overview", label: "总览", icon: "home", group: "工作台", sub: "今天该做什么，记录到哪里了" },
    { id: "calendar", label: "日历", icon: "bell", group: "工作台", sub: "哪天干了什么，一眼看清" },
    { id: "fitness", label: "健身", icon: "dumbbell", group: "生活板块", sub: "减脂 · 5kg 哑铃循环 + 跑步 + 热量" },
    { id: "study", label: "学习", icon: "book", group: "生活板块", sub: "DPDK / OVS · 卡片 + 系统长文" },
    { id: "hikes", label: "爬山", icon: "mountain", group: "生活板块", sub: "杭州路线打底，向周边长线扩展" },
    { id: "travel", label: "旅游", icon: "plane", group: "生活板块", sub: "短期横店，长期日本" },
    { id: "fun", label: "娱乐", icon: "sparkles", group: "生活板块", sub: "《莲花楼》·《鬼武者》" },
    { id: "data", label: "数据", icon: "db", group: "我的记录", sub: "设置 · 导出 / 导入 / 清空" }
  ];

  function buildNav() {
    var html = "", group = "";
    SECTIONS.forEach(function (s) {
      if (s.group !== group) { group = s.group; html += '<div class="nav-group">' + esc(group) + "</div>"; }
      html += '<button class="nav-item" data-id="' + s.id + '" type="button">' +
        '<span class="ni-icon">' + icon(s.icon) + "</span><span>" + esc(s.label) + "</span></button>";
    });
    navEl.innerHTML = html;
  }

  function currentId() {
    var h = (location.hash || "").replace("#", "");
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === h) return h;
    return "overview";
  }

  function render() {
    var id = currentId(), sec = null;
    SECTIONS.forEach(function (s) { if (s.id === id) sec = s; });
    titleEl.textContent = sec.label;
    subEl.textContent = C.profile.name + " · " + sec.sub;
    contentEl.innerHTML = (RENDER[id] || RENDER.overview)();
    document.title = sec.label + " · 个人生活助理";
    Array.prototype.forEach.call(navEl.querySelectorAll(".nav-item"), function (b) {
      b.classList.toggle("active", b.dataset.id === id);
    });
    syncChecks();
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function go(id) { location.hash = id; }

  /* ------------------------------------------------------------ 勾选缓存 */

  function syncChecks() {
    Array.prototype.forEach.call(contentEl.querySelectorAll('input[type="checkbox"][data-key]'), function (cb) {
      var on = lsGet("chk:" + cb.dataset.key + ":" + cb.dataset.idx) === "1";
      cb.checked = on;
      var lab = cb.closest(".check");
      if (lab) lab.classList.toggle("done", on);
    });
  }

  contentEl.addEventListener("change", function (e) {
    var cb = e.target;
    if (cb && cb.matches && cb.matches('input[type="checkbox"][data-key]')) {
      lsSet("chk:" + cb.dataset.key + ":" + cb.dataset.idx, cb.checked ? "1" : "0");
      var lab = cb.closest(".check");
      if (lab) lab.classList.toggle("done", cb.checked);
      return;
    }
    if (cb && cb.id === "importFile" && cb.files && cb.files[0]) {
      var fr = new FileReader();
      fr.onload = function () {
        try { S.importText(String(fr.result)); toast("导入成功"); render(); }
        catch (err) { toast("文件格式不对，导入失败"); }
      };
      fr.readAsText(cb.files[0]);
    }
  });

  /* ------------------------------------------------------------ 事件委托 */

  contentEl.addEventListener("click", function (e) {
    var del = e.target.closest ? e.target.closest("[data-del]") : null;
    if (del) {
      S.remove(del.dataset.del, del.dataset.id);
      toast("已删除");
      render();
      return;
    }

    var tagBtn = e.target.closest ? e.target.closest("[data-tag]") : null;
    if (tagBtn) { studyFilter = tagBtn.dataset.tag; render(); return; }

    var calDay = e.target.closest ? e.target.closest("[data-cal]") : null;
    if (calDay) { calSel = calDay.dataset.cal; render(); return; }

    var photo = e.target.closest ? e.target.closest("[data-photo]") : null;
    if (photo) {
      var pr = photo.dataset.photo.split(":");
      var src = findPhoto(pr[0], pr[1]);
      if (src) openOverlay('<img class="lightbox-img" src="' + esc(src) + '">');
      return;
    }

    var act = e.target.closest ? e.target.closest("[data-action]") : null;
    if (!act) return;
    var a = act.dataset.action;
    var route = act.dataset.route;

    if (a === "add-workout") formWorkout();
    else if (a === "add-weight") formWeight();
    else if (a === "add-study") formStudy();
    else if (a === "add-hike") formHike(route);
    else if (a === "add-meal") formMeal();
    else if (a === "cal-prev") { calRef = new Date(calRef.getFullYear(), calRef.getMonth() - 1, 1); render(); }
    else if (a === "cal-next") { calRef = new Date(calRef.getFullYear(), calRef.getMonth() + 1, 1); render(); }
    else if (a === "add-event") {
      openForm("添加活动", [
        { name: "date", label: "日期", type: "date", value: calSel, required: true },
        { name: "title", label: "活动名称", required: true, placeholder: "比如：加练 20 分钟核心 / 牙医 / 朋友聚餐" },
        { name: "note", label: "备注", placeholder: "时间、地点、注意事项" }
      ], function (rec) { S.add("events", rec); toast("已添加到日历"); render(); });
    } else if (a === "show-map") {
      var idx = parseInt(act.dataset.idx, 10);
      if (!isNaN(idx) && C.hikes.routes[idx]) showRouteMap(C.hikes.routes[idx]);
    } else if (a === "open-settings") {
      var st0 = S.settings();
      openForm("个人设置", [
        { name: "age", label: "年龄", type: "number", min: 10, max: 90, value: st0.age, required: true, hint: "用于算基础代谢" },
        { name: "sex", label: "性别", type: "select", options: [{ value: "male", label: "男" }, { value: "female", label: "女" }], value: st0.sex },
        { name: "activity", label: "日常活动水平", type: "select", options: [{ value: "sedentary", label: "久坐" }, { value: "light", label: "轻度（每周动 1–3 次）" }, { value: "moderate", label: "中度（每周动 3–5 次）" }], value: st0.activity },
        { name: "mapKey", label: "腾讯地图 Key（可选）", value: st0.mapKey, placeholder: "lbs.qq.com 申请，填了才能看路线地图", hint: "申请方法在爬山页点「在地图上看这条线」能看到" }
      ], function (rec) {
        S.setSetting("age", num(rec.age) || 30);
        S.setSetting("sex", rec.sex);
        S.setSetting("activity", rec.activity);
        S.setSetting("mapKey", rec.mapKey.trim());
        toast("设置已保存");
        render();
      });
    } else if (a === "add-route") {
      openForm("自定义路线", [
        { name: "route", label: "路线名称", required: true, placeholder: "比如：湘湖 — 越王城山" },
        { name: "region", label: "区域", placeholder: "杭州 · 萧山" },
        { name: "dist", label: "距离", placeholder: "约 7 km" },
        { name: "gain", label: "爬升", placeholder: "约 200 m" },
        { name: "time", label: "耗时", placeholder: "3 小时" },
        { name: "season", label: "季节", placeholder: "春 / 秋" },
        { name: "note", label: "备注", type: "textarea" }
      ], function (rec) { S.add("routes", rec); toast("路线已添加"); render(); });
    } else if (a === "add-wish") {
      openForm("添加心愿目的地", [
        { name: "place", label: "目的地", required: true, placeholder: "比如：北海道" },
        { name: "when", label: "优先级", type: "select", options: ["想去", "今年想去", "短期", "长期"] },
        { name: "why", label: "为什么想去", type: "textarea" }
      ], function (rec) { S.add("wishlist", rec); toast("已加入清单"); render(); });
    } else if (a === "add-note") {
      openForm("添加一条", [
        { name: "note", label: "内容", required: true, placeholder: "比如：下一部想追的剧" }
      ], function (rec) { S.add("notes", rec); toast("已记录"); render(); });
    } else if (a === "goto-data") {
      go("data");
    } else if (a === "export-json") {
      var box = document.getElementById("dataBox");
      if (box) box.value = S.exportText();
      var blob = new Blob([S.exportText()], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a2 = document.createElement("a");
      a2.href = url;
      a2.download = "life-assistant-" + todayStr() + ".json";
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("已导出");
    } else if (a === "copy-json") {
      var txt = S.exportText();
      var box2 = document.getElementById("dataBox");
      if (box2) box2.value = txt;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () { toast("已复制"); },
          function () { toast("复制失败，可以直接从文本框里手动复制"); });
      } else toast("可以直接从文本框里手动复制");
    } else if (a === "import-text") {
      var box3 = document.getElementById("dataBox");
      if (!box3 || !box3.value.trim()) { toast("文本框是空的"); return; }
      try { S.importText(box3.value); toast("导入成功"); render(); }
      catch (err) { toast("JSON 解析失败，检查一下格式"); }
    } else if (a === "clear-all") {
      if (window.confirm("确定清空全部记录？建议先导出备份。")) {
        S.clearAll();
        toast("已清空");
        render();
      }
    }
  });

  /* ------------------------------------------------------------ 主题 / 时钟 */

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.getElementById("ttIcon").textContent = t === "dark" ? "☀" : "☾";
    document.getElementById("ttLabel").textContent = t === "dark" ? "切换浅色" : "切换深色";
  }

  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    lsSet("theme", next);
    applyTheme(next);
  });

  function tick() {
    var d = new Date();
    var wd = "日一二三四五六".charAt(d.getDay());
    var p = function (n) { return String(n).padStart(2, "0"); };
    document.getElementById("clock").textContent =
      (d.getMonth() + 1) + "月" + d.getDate() + "日 周" + wd + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* ---------------------------------------------------------------- 菜单 */

  function openMenu() { sidebar.classList.add("open"); scrim.classList.add("show"); }
  function closeMenu() { sidebar.classList.remove("open"); scrim.classList.remove("show"); }

  document.getElementById("menuBtn").addEventListener("click", openMenu);
  scrim.addEventListener("click", closeMenu);

  navEl.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".nav-item") : null;
    if (btn) go(btn.dataset.id);
  });

  window.addEventListener("hashchange", render);

  /* ---------------------------------------------------------------- 启动 */

  buildNav();
  applyTheme(lsGet("theme") === "dark" ? "dark" : "light");
  document.getElementById("sideNote").innerHTML =
    "<b>本地数据</b><br>记录存在这台设备上<br>记得定期导出备份";
  tick();
  setInterval(tick, 20000);
  render();
})();
