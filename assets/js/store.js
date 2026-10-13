/* ==========================================================================
   个人生活助理 · 数据层
   --------------------------------------------------------------------------
   你录入的所有记录都存这里，落在浏览器 localStorage。
   换浏览器 / 清缓存会丢，所以提供导出 JSON 备份，也支持导入恢复。
   ========================================================================== */

window.Store = (function () {
  "use strict";

  var KEY = "lifeassistant:data:v3";
  var OLD_KEY = "lifeassistant:data:v2";
  var KINDS = ["weight", "workouts", "study", "hikes", "meals", "events", "notes", "routes", "wishlist"];

  function blank() {
    return {
      version: 3,
      weight: [], workouts: [], study: [], hikes: [],
      meals: [], events: [],
      notes: [], routes: [], wishlist: [],
      settings: { age: 30, sex: "male", activity: "light", mapKey: "" }
    };
  }

  /* 初始只有一条：玉皇山路线，日期固定为 2026-10-11（实际爬山那天） */
  function seed() {
    var d = blank();
    d.hikes.push({
      id: uid(),
      date: "2026-10-11",
      route: "八卦田 — 玉皇山 — 万松书院",
      minutes: 180,
      note: "已完成，作为体能基准线"
    });
    return d;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return ymd(d);
  }

  function ymd(d) {
    var p = function (x) { return String(x).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  var data = null;

  function load() {
    if (data) return data;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        data = blank();
        KINDS.forEach(function (k) {
          if (Array.isArray(parsed[k])) data[k] = parsed[k];
        });
        if (parsed.settings) {
          Object.keys(data.settings).forEach(function (k) {
            if (parsed.settings[k] != null) data.settings[k] = parsed.settings[k];
          });
        }
        migrate(data);
        save();
      } catch (e) {
        data = seed();
        save();
      }
    } else {
      /* 兼容 v2：旧键存在就直接升版，避免用户丢数据 */
      var oldRaw = null;
      try { oldRaw = localStorage.getItem(OLD_KEY); } catch (e2) { oldRaw = null; }
      if (oldRaw) {
        try {
          var oldParsed = JSON.parse(oldRaw);
          data = blank();
          KINDS.forEach(function (k) {
            if (Array.isArray(oldParsed[k])) data[k] = oldParsed[k];
          });
          if (oldParsed.settings) {
            Object.keys(data.settings).forEach(function (k) {
              if (oldParsed.settings[k] != null) data.settings[k] = oldParsed.settings[k];
            });
          }
          migrate(data);
          save();
          return data;
        } catch (e3) { /* 掉到 seed */ }
      }
      data = seed();
      save();
    }
    return data;
  }

  /* 版本迁移：把玉皇山预置打卡的日期修正为实际爬山日 2026-10-11 */
  function migrate(d) {
    (d.hikes || []).forEach(function (h) {
      if (h.route && h.route.indexOf("玉皇山") >= 0 && h.date !== "2026-10-11" &&
          h.note && h.note.indexOf("基准线") >= 0) {
        h.date = "2026-10-11";
      }
    });
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 超配额就放弃 */ }
  }

  function all(kind) {
    load();
    var arr = data[kind] || [];
    return arr.slice().sort(function (a, b) {
      if (a.date === b.date) return (b.id > a.id ? 1 : -1);
      return a.date < b.date ? 1 : -1;   // 新的在前
    });
  }

  function settings() {
    load();
    return data.settings;
  }

  function setSetting(k, v) {
    load();
    data.settings[k] = v;
    save();
  }

  function add(kind, rec) {
    load();
    if (KINDS.indexOf(kind) < 0) return null;
    rec.id = rec.id || uid();
    if (!rec.date) rec.date = ymd(new Date());
    data[kind].push(rec);
    save();
    return rec;
  }

  function remove(kind, id) {
    load();
    if (!data[kind]) return;
    data[kind] = data[kind].filter(function (r) { return r.id !== id; });
    save();
  }

  function clearAll() {
    data = blank();
    save();
  }

  function exportText() {
    load();
    return JSON.stringify(data, null, 2);
  }

  function importText(txt) {
    var parsed = JSON.parse(txt);
    var next = blank();
    KINDS.forEach(function (k) {
      if (Array.isArray(parsed[k])) next[k] = parsed[k];
    });
    data = next;
    save();
  }

  /* ---------------------------------------------------------- 统计口径 */

  function withinDays(dateStr, n) {
    var d = new Date(dateStr + "T00:00:00");
    var now = new Date();
    var diff = (now - d) / 86400000;
    return diff >= 0 && diff < n;
  }

  function num(v) {
    var x = parseFloat(v);
    return isNaN(x) ? 0 : x;
  }

  function sum(list, f) {
    return list.reduce(function (a, b) { return a + num(f(b)); }, 0);
  }

  function stats() {
    load();
    var w = all("workouts");
    var s = all("study");
    var h = all("hikes");
    var wt = all("weight");

    var w7 = w.filter(function (r) { return withinDays(r.date, 7); });
    var w30 = w.filter(function (r) { return withinDays(r.date, 30); });
    var s7 = s.filter(function (r) { return withinDays(r.date, 7); });

    var latest = wt.length ? num(wt[0].jin) : 0;
    var first = wt.length ? num(wt[wt.length - 1].jin) : 0;

    /* 连续打卡天数：训练 / 学习 / 爬山 / 体重 / 饮食，任一种有记录就算 */
    var dayset = {};
    ["workouts", "study", "hikes", "weight", "meals"].forEach(function (k) {
      all(k).forEach(function (r) { dayset[r.date] = 1; });
    });
    var streak = 0;
    for (var i = 0; i < 400; i++) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      var key = ymd(d);
      if (dayset[key]) streak++;
      else if (i > 0) break;     // 今天还没记不算断
    }

    return {
      workouts7: w7.length,
      workouts30: w30.length,
      workoutMin7: sum(w7, function (r) { return r.minutes; }),
      study7: sum(s7, function (r) { return r.minutes; }),
      studyTotal: sum(s, function (r) { return r.minutes; }),
      studySessions: s.length,
      hikesDone: h.length,
      hikeMin: sum(h, function (r) { return r.minutes; }),
      weightLatest: latest,
      weightFirst: first,
      weightDelta: latest && first ? +(latest - first).toFixed(1) : 0,
      weightRecords: wt.length,
      streak: streak,
      bmi: latest ? +(latest / 2 / Math.pow(1.70, 2)).toFixed(1) : 0
    };
  }

  return {
    blank: blank,
    load: load,
    save: save,
    all: all,
    add: add,
    remove: remove,
    settings: settings,
    setSetting: setSetting,
    clearAll: clearAll,
    exportText: exportText,
    importText: importText,
    stats: stats,
    ymd: ymd
  };
})();
