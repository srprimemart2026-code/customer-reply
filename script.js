/* ===== GLOBAL TOAST, CLIPBOARD & THEME ===== */
function srToast(msg){
  var el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(srToast._t);
  srToast._t = setTimeout(function(){ el.classList.remove("show"); }, 2200);
}

function srCopyText(text, onSuccess, onFail){
  function fallback(){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try{ ok = document.execCommand("copy"); }catch(e){ ok = false; }
    document.body.removeChild(ta);
    if(ok){ if(onSuccess) onSuccess(); }
    else if(onFail){ onFail(); }
  }
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(function(){
      if(onSuccess) onSuccess();
    }, fallback);
  }else{
    fallback();
  }
}

function srNormalizePhone(p){
  var clean = String(p || "").replace(/[^\d]/g, "");
  if(clean.indexOf("8801") === 0) clean = clean.slice(2);
  return clean;
}

(function(){
  var root = document.documentElement;
  var savedTheme = null;
  try{ savedTheme = localStorage.getItem("sr_theme"); }catch(e){}
  if(savedTheme === "dark" || savedTheme === "light"){
    root.setAttribute("data-theme", savedTheme);
  }
  var btn = document.getElementById("theme-toggle");
  if(btn){
    btn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try{ localStorage.setItem("sr_theme", next); }catch(e){}
      srToast(next === "dark" ? "Dark Mode Enabled" : "Light Mode Enabled");
    });
  }
})();

/* ===== TAB SWITCHER ===== */
function srSwitchTab(tabName){
  var btns = document.querySelectorAll("#tabs button");
  btns.forEach(function(b){
    var on = b.getAttribute("data-tab") === tabName;
    b.classList.toggle("on", on);
    var pane = document.getElementById("pane-" + b.getAttribute("data-tab"));
    if(pane) pane.hidden = !on;
  });
}

(function(){
  var btns = document.querySelectorAll("#tabs button");
  btns.forEach(function(b){
    b.addEventListener("click", function(){
      srSwitchTab(b.getAttribute("data-tab"));
    });
  });
})();

/* ===== WEBSITE CLOUD SYNC (GOOGLE SHEETS / WEB APP) ===== */
var srCloud = (function(){
  function getUrl(){
    try{ return (localStorage.getItem("sr_cloud_url") || "").trim(); }catch(e){ return ""; }
  }
  function setUrl(u){
    try{ localStorage.setItem("sr_cloud_url", String(u || "").trim()); }catch(e){}
    updateIndicator();
  }
  function updateIndicator(customText){
    var el = document.getElementById("cloud-status-text");
    if(!el) return;
    if(customText){ el.textContent = customText; return; }
    var url = getUrl();
    el.textContent = url ? "🟢 Cloud Connected" : "⚪ Local Storage Mode";
  }
  function buildPayload(){
    return {
      updatedAt: new Date().toISOString(),
      rh_settings: JSON.parse(localStorage.getItem("rh_settings") || "null"),
      sr_quote_items: JSON.parse(localStorage.getItem("sr_quote_items") || "null"),
      srpm_orders_v1: JSON.parse(localStorage.getItem("srpm_orders_v1") || "null"),
      sr_customers_list: JSON.parse(localStorage.getItem("sr_customers_list") || "null")
    };
  }
  function push(silent){
    var url = getUrl();
    if(!url){
      if(!silent) srToast("Settings থেকে Cloud URL যুক্ত করুন");
      return;
    }
    updateIndicator("🟡 Syncing to Cloud...");
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "save", payload: buildPayload() })
    })
    .then(function(res){ return res.json(); })
    .then(function(data){
      if(data && data.ok){
        updateIndicator("🟢 Cloud Synced");
        if(!silent) srToast("সব ডেটা ওয়েবসাইট ক্লাউডে সেভ হয়েছে ✓");
      }else{
        updateIndicator("🔴 Sync Error");
        if(!silent) srToast("Cloud sync failed");
      }
    })
    .catch(function(){
      updateIndicator("🔴 Offline / Sync Error");
      if(!silent) srToast("Cloud connection failed");
    });
  }
  function pull(silent){
    var url = getUrl();
    if(!url){
      if(!silent) srToast("Settings থেকে Cloud URL যুক্ত করুন");
      return;
    }
    updateIndicator("🟡 Loading Cloud Data...");
    fetch(url + (url.indexOf("?") > -1 ? "&" : "?") + "action=load")
    .then(function(res){ return res.json(); })
    .then(function(res){
      var data = res && res.payload ? res.payload : res;
      if(data && (data.srpm_orders_v1 || data.sr_customers_list || data.rh_settings)){
        if(data.rh_settings) localStorage.setItem("rh_settings", JSON.stringify(data.rh_settings));
        if(data.sr_quote_items) localStorage.setItem("sr_quote_items", JSON.stringify(data.sr_quote_items));
        if(data.srpm_orders_v1) localStorage.setItem("srpm_orders_v1", JSON.stringify(data.srpm_orders_v1));
        if(data.sr_customers_list) localStorage.setItem("sr_customers_list", JSON.stringify(data.sr_customers_list));
        updateIndicator("🟢 Cloud Synced");
        srToast("Cloud থেকে ডেটা লোড হয়েছে! Reloading...");
        setTimeout(function(){ location.reload(); }, 600);
      }else{
        updateIndicator("🟢 Cloud Ready (Empty)");
        if(!silent) srToast("Cloud-এ কোনো আগের ডেটা পাওয়া যায়নি");
      }
    })
    .catch(function(){
      updateIndicator("🔴 Load Error");
      if(!silent) srToast("Cloud থেকে ডেটা আনা যায়নি");
    });
  }
  return { getUrl: getUrl, setUrl: setUrl, updateIndicator: updateIndicator, push: push, pull: pull };
})();

(function(){
  srCloud.updateIndicator();
  var pushBtn = document.getElementById("btn-cloud-push");
  var pullBtn = document.getElementById("btn-cloud-pull");
  if(pushBtn) pushBtn.addEventListener("click", function(){ srCloud.push(false); });
  if(pullBtn) pullBtn.addEventListener("click", function(){ srCloud.pull(false); });
})();

/* ===== SHARED PRODUCT PARSER ===== */
function srParseProducts(rawList){
  if(!rawList) return [];
  return String(rawList).split(/\r?\n/).map(function(line){
    var parts;
    if(line.indexOf("\t") > -1){ parts = line.split("\t"); }
    else if(line.indexOf("|") > -1){ parts = line.split("|"); }
    else {
      var idx = line.lastIndexOf(",");
      parts = idx > -1 ? [line.slice(0, idx), line.slice(idx + 1)] : [line, ""];
    }
    var name = String(parts[0] || "").replace(/^\s*"|"\s*$/g, "").trim();
    var price = String(parts[1] || "").replace(/^\s*"|"\s*$/g, "").trim();
    return { n: name, p: price };
  }).filter(function(item){
    return item.n && !/^(name|product|প্রোডাক্ট|নাম)$/i.test(item.n);
  });
}

function srGetSyncedProducts(){
  try{
    var s = JSON.parse(localStorage.getItem("rh_settings") || "null");
    return s && s.plist ? srParseProducts(s.plist) : [];
  }catch(e){
    return [];
  }
}

/* ===== TAB 1: PRICE QUOTATION ===== */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var ZN = [
    ["Inside Dhaka", 1, 2, 70],
    ["Dhaka sub areas", 2, 3, 110],
    ["Outside Dhaka", 2, 3, 130]
  ];
  var items = [{ n: "", p: "", q: 1 }];

  try{
    var saved = JSON.parse(localStorage.getItem("sr_quote_items") || "null");
    if(Array.isArray(saved) && saved.length) items = saved;
  }catch(e){}

  function saveItems(){
    try{ localStorage.setItem("sr_quote_items", JSON.stringify(items)); }catch(e){}
  }

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function num(v){ var n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; }
  function qty(v){ var n = parseInt(v, 10); return isNaN(n) || n < 1 ? 1 : n; }
  function tk(n){ return "Tk " + (Math.round(n * 100) / 100).toLocaleString("en-US"); }

  function ensureDatalist(){
    var sp = srGetSyncedProducts();
    var dl = $("sr_dl_products");
    if(!dl){
      dl = document.createElement("datalist");
      dl.id = "sr_dl_products";
      document.body.appendChild(dl);
    }
    dl.innerHTML = sp.map(function(p){ return '<option value="' + esc(p.n) + '">'; }).join("");
  }

  function rows(){
    ensureDatalist();
    var h = "";
    items.forEach(function(it, i){
      h += '<tr>' +
        '<td class="n"><input list="sr_dl_products" data-i="' + i + '" data-f="n" value="' + esc(it.n) + '" placeholder="Product name" aria-label="Product Name"></td>' +
        '<td class="p"><input type="number" inputmode="decimal" min="0" step="any" data-i="' + i + '" data-f="p" value="' + esc(it.p) + '" placeholder="0" aria-label="Price"></td>' +
        '<td class="q"><input type="number" inputmode="numeric" min="1" data-i="' + i + '" data-f="q" value="' + qty(it.q) + '" aria-label="Quantity"></td>' +
        '<td class="t" id="t' + i + '"></td>' +
        '<td><button type="button" class="x" data-rm="' + i + '" aria-label="Remove">✕</button></td>' +
      '</tr>';
    });
    $("rows").innerHTML = h;
    up();
  }

  function getTotals(){
    var sub = 0;
    items.forEach(function(it, i){
      var lineTotal = num(it.p) * qty(it.q);
      sub += lineTotal;
      var cell = $("t" + i);
      if(cell) cell.textContent = tk(lineTotal);
    });
    var z = ZN[+$("zs").value] || ZN[0];
    var dc = z[3];
    var disc = num($("q-disc").value);
    var adv = num($("q-adv").value);
    var grand = Math.max(0, sub + dc - disc);
    var due = Math.max(0, grand - adv);
    return { sub: sub, dc: dc, disc: disc, adv: adv, grand: grand, due: due, z: z };
  }

  function up(){
    var t = getTotals();
    $("sub").textContent = tk(t.sub);
    $("dc").textContent = tk(t.dc);
    $("tot").textContent = tk(t.grand);

    $("disc-row").hidden = t.disc <= 0;
    $("disc-val").textContent = "- " + tk(t.disc);

    $("adv-row").hidden = t.adv <= 0;
    $("adv-val").textContent = "- " + tk(t.adv);

    $("due-row").hidden = t.adv <= 0;
    $("due-val").textContent = tk(t.due);

    $("pay-method-label").textContent = t.adv > 0
      ? "Advance Paid (" + tk(t.adv) + ") + COD"
      : "Full Cash on Delivery";

    var preview = $("quote-live-preview");
    if(preview) preview.value = qtext();

    saveItems();
  }

  function fdt(k){
    var d = new Date();
    d.setDate(d.getDate() + k);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  function dtxt(z){ return z[1] + "-" + z[2] + " days (" + fdt(z[1]) + " to " + fdt(z[2]) + ")"; }
  function fillDel(){ var z = ZN[+$("zs").value] || ZN[0]; $("dn").textContent = z[0]; $("d0").textContent = dtxt(z); }

  function qtext(){
    var D = "━━━━━━━━━━━━━━", L = ["Price Quotation:", D], count = 0;
    items.forEach(function(it){
      var name = String(it.n || "").trim();
      if(name){
        count++;
        var qv = qty(it.q), pv = num(it.p), lineTotal = pv * qv;
        if(count > 1) L.push("");
        L.push(
          "Product: " + name,
          "Price: " + tk(pv) + " × " + qv + (qv === 1 ? " Pc" : " Pcs") + " = " + tk(lineTotal)
        );
      }
    });
    if(!count) return "";
    var t = getTotals();
    L.push(D, "Delivery Charge: " + tk(t.dc));
    if(t.disc > 0) L.push("Discount: -" + tk(t.disc));
    L.push("Total Payment: " + tk(t.grand));
    if(t.adv > 0){
      L.push("Advance Paid: -" + tk(t.adv), "Due on Delivery: " + tk(t.due) + " ✅");
    }else{
      L.push("Full Cash on Delivery ✅");
    }
    L.push(
      D,
      "Facebook Page: S.R. PRIME MART",
      "Contact: 01600-445389 (WhatsApp)",
      "",
      "Delivery Date: " + dtxt(t.z)
    );
    return L.join("\n");
  }

  function cpTxt(text, btn, origLabel){
    function flash(msg){
      btn.textContent = msg;
      srToast(msg);
      setTimeout(function(){ btn.textContent = origLabel; }, 1800);
    }
    srCopyText(text, function(){ flash("Copied ✓"); }, function(){ flash("Copy failed"); });
  }

  $("cpy").onclick = function(){
    var t = qtext();
    if(!t){ srToast("Add a product first"); return; }
    cpTxt(t, this, "Copy Price Quotation");
  };

  $("send-to-order").onclick = function(){
    var validItems = items.filter(function(it){ return String(it.n || "").trim(); });
    if(!validItems.length){ srToast("Add a product first"); return; }
    var t = getTotals();
    var prodSummary = validItems.map(function(it){
      return String(it.n).trim() + (qty(it.q) > 1 ? " ×" + qty(it.q) : "");
    }).join(", ");
    var amountToCollect = t.adv > 0 ? t.due : t.grand;
    if(window.srFillOrderFromQuote){
      window.srFillOrderFromQuote(prodSummary, amountToCollect, t.dc);
    }
    srSwitchTab("orders");
    srToast("Sent to Order Ledger");
  };

  $("ofb").onclick = function(){
    cpTxt(["অর্ডার করার জন্য নিচের তথ্যগুলো দিন:", "", "১. আপনার নাম:", "২. মোবাইল নম্বর:", "৩. সম্পূর্ণ ঠিকানা:"].join("\n"), this, "Copy Order Form");
  };

  $("fbb").onclick = function(){
    cpTxt(["🛍️ আমাদের ফেসবুক পেজ: (Follow)", "https://www.facebook.com/SRPRIMEMART", "S.R. Prime Mart-এর পাশে থাকার জন্য ধন্যবাদ।"].join("\n"), this, "Copy FB Page Link");
  };

  $("clear-quote").onclick = function(){
    items = [{ n: "", p: "", q: 1 }];
    $("q-disc").value = "";
    $("q-adv").value = "";
    rows();
    srToast("Quotation reset");
  };

  $("q-disc").addEventListener("input", up);
  $("q-adv").addEventListener("input", up);
  $("zs").onchange = function(){ fillDel(); up(); };
  $("add").onclick = function(){ items.push({ n: "", p: "", q: 1 }); rows(); };

  $("rows").addEventListener("input", function(e){
    var el = e.target, i = el.getAttribute("data-i"), f = el.getAttribute("data-f");
    if(i === null || !f) return;
    var idx = +i;
    if(f === "n"){
      items[idx].n = el.value;
      var match = srGetSyncedProducts().find(function(p){
        return p.n.toLowerCase() === el.value.trim().toLowerCase();
      });
      if(match && match.p !== "" && !isNaN(parseFloat(match.p))){
        items[idx].p = parseFloat(match.p);
        var pInp = $("rows").querySelector('input[data-i="' + idx + '"][data-f="p"]');
        if(pInp) pInp.value = items[idx].p;
      }
    }else if(f === "p"){
      items[idx].p = el.value;
    }else if(f === "q"){
      items[idx].q = qty(el.value);
    }
    up();
  });

  $("rows").addEventListener("click", function(e){
    var rm = e.target.getAttribute("data-rm");
    if(rm !== null){
      items.splice(+rm, 1);
      if(!items.length) items.push({ n: "", p: "", q: 1 });
      rows();
    }
  });

  fillDel();
  rows();
  window.addEventListener("sr:products-updated", rows);
})();

/* ===== TAB 2: REPLY HELPER + BACKUP/RESTORE + CLOUD SETTINGS ===== */
(function(){
  var T = [
    { id: "greet", t: "Greeting", k: /salam|সালাম|hello|হ্যালো|হাই|\bhi\b/i, x: "আসসালামু আলাইকুম ভাইয়া! {shop}-এ স্বাগতম 😊 কোন প্রোডাক্টটা লাগবে বলুন।" },
    { id: "price", t: "Price", k: /dam|দাম|price|koto|কত|দর|rate/i, x: "ভাইয়া, {product} এর দাম {price} টাকা। অর্ডার করতে চাইলে জানাবেন 😊" },
    { id: "avail", t: "In stock", k: /ache|আছে|available|stock|স্টক|\base\b/i, x: "জি ভাইয়া, {product} স্টকে আছে ✅ দাম {price} টাকা। অর্ডার করবেন?" },
    { id: "delivery", t: "Delivery time and charge", k: /delivery|ডেলিভারি|kobe|কবে|koy din|কয়দিন|কতদিন|charge|চার্জ/i, x: "ডেলিভারি সময়: ঢাকার ভেতরে ১-২ দিন, ঢাকার আশেপাশে ২-৩ দিন, ঢাকার বাইরে ২-৩ দিন। ডেলিভারি চার্জ: {charge}।" },
    { id: "cod", t: "Cash on delivery", k: /\bcod\b|cash|ক্যাশ|হাতে পেয়ে|taka dibo|টাকা দিব/i, x: "জি ভাইয়া, শুধু ডেলিভারি চার্জ ({charge}) আগে দিতে হবে। পণ্যের দাম পণ্য হাতে পেয়ে চেক করে দেবেন 😊" },
    { id: "fixed", t: "Fixed price", k: /last|কম|komano|কমান|discount|ডিসকাউন্ট|offer|অফার/i, x: "ভাইয়া, আমাদের দাম ফিক্সড 🙏 কোয়ালিটি নিয়ে নিশ্চিন্ত থাকতে পারেন।" },
    { id: "info", t: "Ask for order details", k: /order|অর্ডার|nibo|নিব|lagbe|লাগবে|nite chai|নিতে চাই/i, x: "অর্ডার কনফার্ম করতে দয়া করে দিন:\n১. আপনার নাম\n২. মোবাইল নম্বর\n৩. পুরো ঠিকানা" },
    { id: "advance", t: "Advance delivery charge", k: /advance|অ্যাডভান্স|এডভান্স|agei taka|আগে টাকা|bkash|বিকাশ|nagad|নগদ/i, x: "অর্ডার কনফার্ম করতে ডেলিভারি চার্জ {charge} আগে পাঠাতে হবে। ফেক অর্ডারে অনেক পার্সেল ফেরত আসে বলে এই নিয়ম 🙏\nপেমেন্ট: {pay}\nপাঠানোর পর স্ক্রিনশট বা ট্রানজেকশন আইডি জানাবেন। পণ্যের দাম পণ্য হাতে পেয়ে দেবেন।" },
    { id: "confirm", t: "Order confirmed", k: null, x: "ধন্যবাদ ভাইয়া! আপনার {product} অর্ডারটি কনফার্ম হয়েছে ✅ পণ্যের দাম {price} টাকা, পণ্য হাতে পেয়ে দেবেন (ডেলিভারি চার্জ আগেই পেয়েছি)। শীঘ্রই পেয়ে যাবেন।" },
    { id: "out", t: "Out of stock", k: null, x: "দুঃখিত ভাইয়া, এটা এখন স্টকে নেই 🙏 চাইলে অন্য ডিজাইন দেখাতে পারি।" },
    { id: "follow", t: "Follow-up", k: null, x: "ভাইয়া, অর্ডারটা কি কনফার্ম করবেন? 😊 জানালে এখনই প্রসেস করে দিই।" },
    { id: "trust", t: "Customer trust", k: /trust|bishwash|বিশ্বাস|vorosa|ভরসা|fake|ফেক|original|অরিজিনাল|review|রিভিউ|scam|প্রতারণা/i, x: "ভাইয়া, দ্বিধার কিছু নেই 😊 আগের কাস্টমারদের রিভিউ ও ছবি এখানে দেখতে পারবেন: {review}\nফেক অর্ডারে অনেক পার্সেল ফেরত আসে, তাই আমরা শুধু ডেলিভারি চার্জ আগে নিই। পণ্যের দাম পণ্য হাতে পেয়ে চেক করে দেবেন 🙏\n{policy}" },
    { id: "thanks", t: "Thanks", k: null, x: "ধন্যবাদ ভাইয়া! আমাদের সাথে থাকার জন্য 🙏 কোনো প্রয়োজনে জানাবেন।" }
  ];

  var $ = function(id){ return document.getElementById(id); };
  var S = { shop: "S.R. Prime Mart", charge: "", pay: "", plist: "" };

  try{
    var s = JSON.parse(localStorage.getItem("rh_settings") || "null");
    if(s) S = Object.assign(S, s);
  }catch(e){}

  if(S.review === undefined) S.review = "https://www.facebook.com/share/p/1UYhXZzukX/";
  if(S.policy === undefined) S.policy = "পণ্যে কোনো সমস্যা থাকলে ডেলিভারির সময়ই আমাদের জানাবেন, আমরা সমাধানের চেষ্টা করব 🙏";
  if(S.pay === undefined) S.pay = "";

  function save(){
    try{ localStorage.setItem("rh_settings", JSON.stringify(S)); }catch(e){}
    window.dispatchEvent(new Event("sr:products-updated"));
  }

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function products(){ return srParseProducts(S.plist); }

  function fillSelect(){
    var cur = $("prod").value, ps = products(), h = '<option value="">— select product —</option>';
    ps.forEach(function(p, i){
      h += '<option value="' + i + '">' + esc(p.n) + (p.p ? " — " + esc(p.p) : "") + '</option>';
    });
    $("prod").innerHTML = h;
    if(cur && ps[cur]) $("prod").value = cur;
  }

  function fill(x){
    var ps = products(), p = ps[$("prod").value];
    return x
      .replace(/\{product\}/g, p ? p.n : "[product]")
      .replace(/\{price\}/g, p && p.p ? p.p : "[price]")
      .replace(/\{shop\}/g, S.shop || "[shop]")
      .replace(/\{charge\}/g, S.charge || "[charge]")
      .replace(/\{review\}/g, S.review || "[review link]")
      .replace(/\{pay\}/g, S.pay || "[bKash/Nagad number]")
      .replace(/\{policy\}/g, S.policy || "[return policy]");
  }

  function detect(){
    var m = $("msg").value.toLowerCase();
    return m ? T.filter(function(t){ return t.k && t.k.test(m); }).map(function(t){ return t.id; }) : [];
  }

  function render(){
    var hits = detect();
    $("chips").innerHTML = hits.map(function(id){
      var t = T.filter(function(a){ return a.id === id; })[0];
      return '<span class="chip">' + esc(t.t) + '</span>';
    }).join("") || '<span class="hint">Suggested replies appear here and move to the top.</span>';

    var ids = T.map(function(t){ return t.id; }).filter(function(id){
      return hits.indexOf(id) > -1 && !(id === "price" && hits.indexOf("avail") > -1);
    });
    $("t_best").value = ids.map(function(id){
      return fill(T.filter(function(t){ return t.id === id; })[0].x);
    }).join("\n\n");

    var order = T.slice().sort(function(a, b){
      return (hits.indexOf(b.id) > -1) - (hits.indexOf(a.id) > -1);
    });

    $("list").innerHTML = order.map(function(t){
      var hit = hits.indexOf(t.id) > -1;
      return '<div class="card' + (hit ? " hit" : "") + '">' +
        '<div class="top"><span><b>' + esc(t.t) + '</b>' + (hit ? '<span class="tag">Suggested</span>' : "") + '</span>' +
        '<button type="button" data-c="' + t.id + '">Copy</button></div>' +
        '<textarea id="t_' + t.id + '" aria-label="' + esc(t.t) + '"></textarea></div>';
    }).join("");

    order.forEach(function(t){
      var ta = $("t_" + t.id);
      if(ta) ta.value = fill(t.x);
    });
  }

  function copyById(id, btn){
    var el = $("t_" + id);
    if(!el || !el.value.trim()){ srToast("Nothing to copy"); return; }
    var orig = btn.textContent;
    function ok(){
      btn.textContent = "Copied";
      btn.classList.add("done");
      srToast("Reply copied");
      setTimeout(function(){ btn.textContent = orig; btn.classList.remove("done"); }, 1400);
    }
    srCopyText(el.value, ok, function(){ srToast("Copy failed"); });
  }

  $("list").addEventListener("click", function(e){
    var c = e.target.getAttribute("data-c");
    if(c) copyById(c, e.target);
  });

  function autoProduct(){
    var m = $("msg").value.toLowerCase(), ps = products(), best = -1, score = 0, tie = false;
    if(!m) return;
    ps.forEach(function(p, i){
      var n = p.n.toLowerCase(), sc = m.indexOf(n) > -1 ? 5 : 0;
      n.split(/\s+/).forEach(function(w){ if(w.length >= 3 && m.indexOf(w) > -1) sc++; });
      if(sc > score){ score = sc; best = i; tie = false; }
      else if(sc === score && sc > 0){ tie = true; }
    });
    if(best > -1 && !tie) $("prod").value = String(best);
  }

  function onMsg(){ autoProduct(); render(); }
  $("msg").addEventListener("input", onMsg);
  $("msg").addEventListener("paste", function(){
    setTimeout(function(){
      onMsg();
      var b = $("t_best"), bc = $("bestcopy");
      if(!b.value) return;
      srCopyText(b.value, function(){
        bc.textContent = "Reply copied";
        bc.classList.add("done");
        srToast("Best reply auto-copied");
        setTimeout(function(){ bc.textContent = "Copy best reply"; bc.classList.remove("done"); }, 2200);
      });
    }, 0);
  });

  $("bestcopy").addEventListener("click", function(){ copyById("best", this); });
  $("prod").addEventListener("change", render);
  $("clear").addEventListener("click", function(){ $("msg").value = ""; render(); $("msg").focus(); });

  $("shop").addEventListener("input", function(){ S.shop = this.value; save(); render(); });
  $("charge").addEventListener("input", function(){ S.charge = this.value; save(); render(); });
  $("review").addEventListener("input", function(){ S.review = this.value; save(); render(); });
  $("pay").addEventListener("input", function(){ S.pay = this.value; save(); render(); });
  $("policy").addEventListener("input", function(){ S.policy = this.value; save(); render(); });
  $("plist").addEventListener("input", function(){ S.plist = this.value; save(); fillSelect(); render(); });

  $("imp").addEventListener("click", function(){ $("file").click(); });
  $("file").addEventListener("change", function(){
    var f = this.files[0];
    if(!f) return;
    var r = new FileReader();
    r.onload = function(){
      S.plist = String(r.result).replace(/^\uFEFF/, "");
      save();
      $("plist").value = S.plist;
      fillSelect();
      render();
      srToast("Product list imported");
    };
    r.readAsText(f, "utf-8");
    this.value = "";
  });

  $("cloud-url").value = srCloud.getUrl();
  $("save-cloud-url").addEventListener("click", function(){
    srCloud.setUrl($("cloud-url").value);
    srCloud.push(false);
  });
  $("pull-cloud-settings").addEventListener("click", function(){
    srCloud.setUrl($("cloud-url").value);
    srCloud.pull(false);
  });

  function doBackup(){
    var payload = {
      exportedAt: new Date().toISOString(),
      rh_settings: JSON.parse(localStorage.getItem("rh_settings") || "null"),
      sr_quote_items: JSON.parse(localStorage.getItem("sr_quote_items") || "null"),
      srpm_orders_v1: JSON.parse(localStorage.getItem("srpm_orders_v1") || "null"),
      sr_customers_list: JSON.parse(localStorage.getItem("sr_customers_list") || "null")
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "sr-prime-mart-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    srToast("Backup downloaded");
  }

  $("backup-json").addEventListener("click", doBackup);
  $("side-backup").addEventListener("click", doBackup);

  $("restore-json").addEventListener("click", function(){ $("restore-file").click(); });
  $("side-restore").addEventListener("click", function(){ $("restore-file").click(); });

  $("restore-file").addEventListener("change", function(){
    var f = this.files[0];
    if(!f) return;
    var r = new FileReader();
    r.onload = function(){
      try{
        var data = JSON.parse(String(r.result));
        if(data.rh_settings) localStorage.setItem("rh_settings", JSON.stringify(data.rh_settings));
        if(data.sr_quote_items) localStorage.setItem("sr_quote_items", JSON.stringify(data.sr_quote_items));
        if(data.srpm_orders_v1) localStorage.setItem("srpm_orders_v1", JSON.stringify(data.srpm_orders_v1));
        if(data.sr_customers_list) localStorage.setItem("sr_customers_list", JSON.stringify(data.sr_customers_list));
        srToast("Backup restored! Reloading...");
        setTimeout(function(){ location.reload(); }, 600);
      }catch(err){
        srToast("Invalid backup JSON file");
      }
    };
    r.readAsText(f, "utf-8");
    this.value = "";
  });

  $("shop").value = S.shop;
  $("charge").value = S.charge;
  $("review").value = S.review;
  $("pay").value = S.pay || "";
  $("policy").value = S.policy || "";
  $("plist").value = S.plist;

  fillSelect();
  render();
})();

/* ===== TAB 3: CUSTOMER & ORDER LEDGER ===== */
(function(){
  var $ = function(i){ return document.getElementById(i); };
  var invTouched = false, orders = [], editId = null, ref = null, LS = "srpm_orders_v1";
  var LG = {
    "পেন্ডিং": "Pending",
    "পাঠানো হয়েছে": "Shipped",
    "ডেলিভারি হয়েছে": "Delivered",
    "ফেরত": "Returned",
    "বাকি": "Due",
    "আংশিক পরিশোধ": "Partial",
    "পরিশোধিত": "Paid"
  };

  function tk(n){ return "৳" + Math.round(n || 0).toLocaleString("en-US"); }
  function esc(s){ var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function total(o){ return (+o.price || 0) * (+o.qty || 0) - (+o.dc || 0); }
  function cls(v, t){ return t == "d" ? (v == "Delivered" ? "g" : v == "Returned" ? "r" : "o") : (v == "Paid" ? "g" : v == "Due" || v == "Loss" || v == "Scam" ? "r" : "o"); }
  function isL(o){ return o.pst == "Loss" || o.pst == "Scam"; }

  function lsLoad(){ try{ return JSON.parse(localStorage.getItem(LS) || "[]"); }catch(e){ return []; } }
  var idb = null;
  function idbOpen(){ return new Promise(function(res, rej){ var r = indexedDB.open("srpm_db", 1); r.onupgradeneeded = function(){ r.result.createObjectStore("orders", { keyPath: "id" }); }; r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); }; }); }
  function idbAll(){ return new Promise(function(res, rej){ var q = idb.transaction("orders").objectStore("orders").getAll(); q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); }; }); }
  function idbPut(o){ return new Promise(function(res, rej){ var t = idb.transaction("orders", "readwrite"); t.objectStore("orders").put(o); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
  function idbDel(id){ return new Promise(function(res, rej){ var t = idb.transaction("orders", "readwrite"); t.objectStore("orders").delete(id); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }
  function lsSave(){
    try{ localStorage.setItem(LS, JSON.stringify(orders)); }catch(e){}
    window.dispatchEvent(new Event("sr:orders-updated"));
    if(srCloud.getUrl()) srCloud.push(true);
  }

  async function init(){
    $("date").value = today();
    try{
      idb = await idbOpen();
      orders = await idbAll();
      if(!orders.length){
        var old = lsLoad();
        if(old.length){
          orders = old;
          for(var i = 0; i < old.length; i++) await idbPut(old[i]);
        }
      }
      try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){}
    }catch(e){
      idb = null;
      orders = lsLoad();
    }
    lsSave();
    render();
    try{
      if(window.claude && claude.use){
        var db = await claude.use("db"), user = await claude.use("user");
        if(db && user){
          var id = await user.id();
          ref = db.collection("data/users/" + id);
          $("mode").textContent = "Saved online";
          ref.onSnapshot(function(s){
            var a = s.docs.map(function(d){ var x = d.data(); x.id = d.id; return x; });
            if(!a.length && orders.length){
              orders.forEach(function(o){ ref.doc(o.id).set(o).catch(function(){}); });
              return;
            }
            orders = a;
            lsSave();
            render();
          }, function(){ ref = null; $("mode").textContent = "Saved in this browser"; });
          return;
        }
      }
    }catch(e){}
    $("mode").textContent = "Saved in this browser (take regular CSV backups)";
  }

  function persist(o){
    if(ref){
      ref.doc(o.id).set(o).catch(function(){ alert("Could not save, please try again"); });
    }else{
      var i = orders.findIndex(function(x){ return x.id == o.id; });
      if(i >= 0) orders[i] = o; else orders.push(o);
      if(idb) idbPut(o).catch(function(){ alert("Could not save, please try again"); });
      lsSave();
      render();
    }
  }

  function remove(id){
    if(ref){
      ref.doc(id).delete().catch(function(){});
    }else{
      orders = orders.filter(function(x){ return x.id != id; });
      if(idb) idbDel(id).catch(function(){});
      lsSave();
      render();
    }
  }

  function pl(o){ var a = total(o) - (+o.cost || 0) * (+o.qty || 0); if(o.pst == "Scam") return -Math.abs(a); if(o.pst == "Loss") return -(+o.dc || 0); if(o.pst == "Paid") return a; return null; }
  function costCell(o){ return o.cost == null ? "—" : tk((+o.cost || 0) * (+o.qty || 0)); }
  function plCell(o){ var p = pl(o); if(p == null) return "—"; if(o.dst == "Returned" && !isL(o)) return "<span class='mode'>returned</span>"; return "<b class='" + (p >= 0 ? "g" : "r") + "'>" + (p >= 0 ? "+" : "−") + tk(Math.abs(p)) + "</b>"; }
  function nextInv(){ var m = 0; orders.forEach(function(o){ var x = /(\d+)\s*$/.exec(o.inv || ""); if(x && +x[1] > m) m = +x[1]; }); return "SRPM-" + String(m + 1).padStart(4, "0"); }
  function fmt(b){ return b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(2) + " MB"; }

  function stor(){
    var el = $("stor"); if(!el) return;
    var n = orders.length, sz = 0; try{ sz = new Blob([JSON.stringify(orders)]).size; }catch(e){}
    if(ref){ el.textContent = "Storage: " + n + " orders · data size " + fmt(sz) + " · online storage limit is not shown by the platform"; }
    else{
      var base = "Storage: " + n + " orders · data " + fmt(sz);
      el.textContent = base;
      if(idb && navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function(e){ el.textContent = base + " · browser storage used " + fmt(e.usage || 0) + " of " + fmt(e.quota || 0) + " available"; }).catch(function(){});
      else{ var u = 0; try{ u = ((localStorage.getItem(LS) || "").length + LS.length) * 2; }catch(e){} el.textContent = base + " · about " + fmt(u) + " of the 5 MB browser limit"; }
    }
  }

  function render(){
    if(!editId && !invTouched && $("inv")) $("inv").value = nextInv();
    orders.forEach(function(o){ o.dst = LG[o.dst] || o.dst; o.pst = LG[o.pst] || o.pst; });
    var q = $("q").value.trim().toLowerCase(), fd = $("fd").value, fp = $("fp").value, ftp = $("ftp").value;
    var list = orders.slice().sort(function(a, b){ return (b.date || "").localeCompare(a.date || "") || (b.ts || 0) - (a.ts || 0); });
    var f = list.filter(function(o){
      if(fd && o.dst != fd) return false;
      if(fp && o.pst != fp) return false;
      if(ftp == "Reseller" && !o.rs) return false;
      if(ftp == "Own" && o.rs) return false;
      if(!q) return true;
      return [o.inv, o.name, o.phone, o.product].join(" ").toLowerCase().indexOf(q) > -1;
    });

    $("tb").innerHTML = f.length ? f.map(function(o){
      return "<tr><td>" + esc(o.inv || "—") + "</td><td>" + esc(o.date) + "</td><td>" + esc(o.name) + "</td><td>" + esc(o.phone) + "</td><td>" + esc(o.product) + "</td><td>" + (o.rs ? "<span class='tag o'>Reseller</span>" : "Own") + "</td><td>" + tk(o.price) + "</td><td>" + esc(o.qty) + "</td><td>" + tk(o.dc) + "</td><td><b>" + (o.pst == "Loss" ? "—" : tk(total(o))) + "</b></td><td>" + (o.pst == "Loss" ? "—" : costCell(o)) + "</td><td>" + plCell(o) + "</td><td><span class='tag " + cls(o.dst, "d") + "'>" + esc(o.dst) + "</span></td><td><span class='tag " + cls(o.pst, "p") + "'>" + esc(o.pst) + "</span></td><td style='white-space:nowrap'><button class='s' data-e='" + esc(o.id) + "'>Edit</button> <button class='s d' data-x='" + esc(o.id) + "'>Delete</button></td></tr>";
    }).join("") : "<tr><td colspan='15' class='empty'>No orders yet</td></tr>";

    var ph = {}, sum = 0, due = 0, pend = 0, pf = 0, ls = 0, dcs = 0;
    orders.forEach(function(o){
      ph[o.phone || o.name] = 1;
      var t = total(o);
      if(o.dst != "Returned" || isL(o)) dcs += (+o.dc || 0);
      var pp = pl(o);
      if((o.dst != "Returned" || isL(o)) && pp != null){ if(isL(o)) ls -= pp; else pf += pp; }
      if(o.dst != "Returned"){ if(!isL(o)) sum += t; if(o.pst != "Paid" && !isL(o)) due += t; }
      if(o.dst == "Pending" || o.dst == "Shipped") pend++;
    });

    $("sC").textContent = Object.keys(ph).length;
    $("sO").textContent = orders.length;
    $("sT").textContent = tk(sum);
    $("sD").textContent = tk(due);
    $("sP").textContent = pend;
    $("sDc").textContent = tk(dcs);
    $("sPf").textContent = tk(pf);
    $("sLs").textContent = tk(ls);
    var nt = pf - ls;
    $("sNt").textContent = (nt < 0 ? "−" : "") + tk(Math.abs(nt));
    $("sNt").className = nt < 0 ? "r" : "g";

    if($("hud-orders")) $("hud-orders").textContent = String(orders.length);
    if($("hud-pending")) $("hud-pending").textContent = String(pend);
    if($("hud-sales")){
      $("hud-sales").textContent = (nt < 0 ? "−" : "") + tk(Math.abs(nt));
      $("hud-sales").style.color = nt < 0 ? "var(--er)" : "var(--ok)";
    }

    function dl(id, key){ var s = {}; orders.forEach(function(o){ if(o[key]) s[o[key]] = 1; }); $(id).innerHTML = Object.keys(s).map(function(v){ return "<option value=\"" + esc(v).replace(/"/g, "&quot;") + "\">"; }).join(""); }
    stor(); dl("phones", "phone"); dl("names", "name"); dl("products", "product");
  }

  function syncPst(){ var r = $("rs").checked, v = $("pst").value; if(r && v == "Loss") v = "Scam"; if(!r && v == "Scam") v = "Loss"; if(["Due", "Paid", "Loss", "Scam"].indexOf(v) < 0) v = "Due"; $("pst").innerHTML = "<option>Due</option><option>Paid</option><option>" + (r ? "Scam" : "Loss") + "</option>"; $("pst").value = v; }
  function calcTot(){ var q = +$("qty").value || 0, dc = +$("dc").value || 0, pr = (+$("price").value || 0) * q, c = (+$("cost").value || 0) * q, ps = $("pst").value, x = ""; if(ps == "Scam"){ var sc = pr - c - dc; x = "Scam loss: " + tk(Math.abs(sc)) + "  (Price " + tk(pr) + " − Cost " + tk(c) + " − Delivery " + tk(dc) + ")"; } else if(ps == "Loss"){ x = dc ? "Loss: " + tk(dc) + " (delivery charge only)" : ""; } else if(pr){ x = "Price " + tk(pr) + " − Cost " + tk(c) + " − Delivery " + tk(dc); if(ps == "Paid"){ var p = pr - c - dc; x += " = " + (p >= 0 ? "Profit: " : "Loss: ") + tk(Math.abs(p)); } else { x += " · Profit counts after status is Paid"; } } $("tot").textContent = x; }

  function autofill(by){
    var v = $(by).value.trim(); if(!v) return;
    var m = orders.slice().sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); }).find(function(o){ return o[by] == v; });
    if(!m || editId) return;
    var other = by == "phone" ? "name" : "phone";
    if(!$(other).value) $(other).value = m[other] || "";
    var cnt = orders.filter(function(o){ return o[by] == v; }).length;
    var due = orders.filter(function(o){ return o[by] == v && o.pst != "Paid" && !isL(o) && o.dst != "Returned"; }).reduce(function(s, o){ return s + total(o); }, 0);
    $("hint").textContent = "Returning customer · Previous orders: " + cnt + (due ? " · Due: " + tk(due) : "");
  }

  function clearForm(){
    editId = null; ["phone", "name", "product", "price", "cost", "dc"].forEach(function(i){ $(i).value = ""; });
    $("qty").value = 1; $("date").value = today(); $("dst").selectedIndex = 0; $("pst").selectedIndex = 0; $("rs").checked = false; syncPst();
    invTouched = false; $("inv").value = nextInv(); $("hint").textContent = ""; $("ft").textContent = "Add new order"; $("save").textContent = "Save"; calcTot();
  }

  window.srFillOrderFromQuote = function(prodText, amount, dcVal){
    clearForm();
    $("product").value = prodText;
    if(dcVal) $("dc").value = dcVal;
    $("qty").value = 1;
    $("price").value = Math.max(0, (Number(amount) || 0) + (Number(dcVal) || 0));
    calcTot();
    $("phone").focus();
  };

  window.srStartOrderForCustomer = function(name, phone){
    clearForm();
    $("name").value = name || "";
    $("phone").value = phone || "";
    autofill("phone");
    srSwitchTab("orders");
    $("product").focus();
  };

  $("phone").addEventListener("input", function(){ autofill("phone"); });
  $("phone").addEventListener("change", function(){ autofill("phone"); });
  $("name").addEventListener("change", function(){ autofill("name"); });
  $("price").addEventListener("input", calcTot); $("qty").addEventListener("input", calcTot); $("dc").addEventListener("input", calcTot); $("cost").addEventListener("input", calcTot); $("pst").addEventListener("change", calcTot); $("rs").addEventListener("change", function(){ syncPst(); calcTot(); }); $("pst").addEventListener("change", calcTot);
  ["q", "fd", "fp", "ftp"].forEach(function(i){ $(i).addEventListener("input", render); });
  $("clear").onclick = clearForm; $("inv").addEventListener("input", function(){ invTouched = true; });

  $("save").onclick = function(){
    var name = $("name").value.trim(), phone = $("phone").value.trim();
    if(!name && !phone){ alert("Please enter a name or mobile number"); return; }
    var old = editId ? orders.find(function(x){ return x.id == editId; }) : null;
    var o = {
      inv: $("inv").value.trim() || nextInv(),
      id: editId || ("o" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      ts: old ? old.ts : Date.now(),
      name: name,
      phone: phone,
      date: $("date").value || today(),
      product: $("product").value.trim(),
      price: +$("price").value || 0,
      dc: +$("dc").value || 0,
      cost: $("cost").value === "" ? null : (+$("cost").value || 0),
      rs: $("rs").checked,
      qty: +$("qty").value || 1,
      dst: $("dst").value,
      pst: $("pst").value
    };
    if(window.srUpsertCustomerFromOrder) window.srUpsertCustomerFromOrder(o);
    persist(o); clearForm();
    $("hint").textContent = "Saved ✓"; srToast("Order saved ✓");
    setTimeout(function(){ if($("hint").textContent == "Saved ✓") $("hint").textContent = ""; }, 2500);
  };

  $("tb").addEventListener("click", function(e){
    var b = e.target.closest("button"); if(!b) return;
    if(b.dataset.x){ if(confirm("Delete this order?")) remove(b.dataset.x); return; }
    if(b.dataset.e){
      var o = orders.find(function(x){ return x.id == b.dataset.e; }); if(!o) return;
      editId = o.id; $("inv").value = o.inv || ""; $("phone").value = o.phone || ""; $("name").value = o.name || ""; $("date").value = o.date || today(); $("product").value = o.product || ""; $("price").value = o.price || ""; $("dc").value = o.dc || ""; $("cost").value = o.cost == null ? "" : o.cost; $("rs").checked = !!o.rs; $("qty").value = o.qty || 1; $("dst").value = o.dst; syncPst(); $("pst").value = o.pst;
      $("ft").textContent = "Editing order"; $("save").textContent = "Update"; $("hint").textContent = ""; calcTot();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  $("csv").onclick = async function(){
    var h = ["Invoice", "Date", "Name", "Number", "Product", "Type", "Price", "Quantity", "Delivery Charge", "Total", "Cost", "Profit/Loss", "Delivery", "Payment"];
    var rows = [h].concat(orders.slice().sort(function(a, b){ return (a.date || "").localeCompare(b.date || ""); }).map(function(o){ return [o.inv, o.date, o.name, o.phone, o.product, o.rs ? "Reseller" : "Own", o.price, o.qty, o.dc || 0, total(o), o.cost == null ? "" : (+o.cost || 0) * (+o.qty || 0), pl(o) == null ? "" : pl(o), o.dst, o.pst]; }));
    var csv = "\ufeff" + rows.map(function(r){ return r.map(function(c){ return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var tsv = rows.map(function(r){ return r.map(function(c){ return String(c == null ? "" : c).replace(/[\t\r\n]+/g, " "); }).join("\t"); }).join("\n");
    var m = $("csvmsg"); m.textContent = ""; $("cp").style.display = "none";
    var d = null; try{ d = window.claude && claude.use ? await claude.use("downloads") : null; }catch(e){}
    if(d){ try{ await d.save({ filename: "sr-prime-mart-orders.csv", data: csv }); m.textContent = "File saved ✓"; return; }catch(e){ if(e && e.code == "declined"){ m.textContent = "Download cancelled"; return; } } }
    try{ var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "sr-prime-mart-orders.csv"; a.click(); }catch(e){}
    $("cpt").value = tsv; $("cp").style.display = "block";
  };
  $("cpc").onclick = function(){ var t = $("cpt"); t.select(); var ok = false; try{ ok = document.execCommand("copy"); }catch(e){} $("csvmsg").textContent = ok ? "Copied ✓ Now paste into Excel / Google Sheets" : "Press Ctrl+C to copy the selected text"; };
  $("cpx").onclick = function(){ $("cp").style.display = "none"; };

  clearForm(); init();
})();

/* ===== TAB 4: CUSTOMER DATA (DIRECTORY & CRM) ===== */
(function(){
  var $ = function(i){ return document.getElementById(i); };
  var customers = [];

  try{
    var saved = JSON.parse(localStorage.getItem("sr_customers_list") || "null");
    if(Array.isArray(saved)) customers = saved;
  }catch(e){}

  function saveCustomers(){
    try{ localStorage.setItem("sr_customers_list", JSON.stringify(customers)); }catch(e){}
    if(srCloud.getUrl()) srCloud.push(true);
  }

  function esc(s){
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function tk(n){ return "৳" + Math.round(n || 0).toLocaleString("en-US"); }
  function totalOrderAmt(o){ return (+o.price || 0) * (+o.qty || 0) - (+o.dc || 0); }
  function isLossOrder(o){ return o.pst == "Loss" || o.pst == "Scam"; }

  function getOrders(){
    try{ return JSON.parse(localStorage.getItem("srpm_orders_v1") || "[]") || []; }catch(e){ return []; }
  }

  function computeMetrics(){
    var all = getOrders();
    var map = {};
    all.forEach(function(o){
      var key = srNormalizePhone(o.phone) || String(o.name || "").trim().toLowerCase();
      if(!key) return;
      if(!map[key]) map[key] = { count: 0, spent: 0 };
      map[key].count += 1;
      if(o.dst != "Returned" && !isLossOrder(o)){
        map[key].spent += totalOrderAmt(o);
      }
    });
    return map;
  }

  function syncFromOrders(silent){
    var all = getOrders();
    var added = 0;
    all.forEach(function(o){
      var ph = srNormalizePhone(o.phone);
      var key = ph || String(o.name || "").trim().toLowerCase();
      if(!key) return;
      var existing = customers.find(function(c){
        var cKey = srNormalizePhone(c.phone) || String(c.name || "").trim().toLowerCase();
        return cKey === key;
      });
      if(!existing){
        customers.unshift({
          name: o.name || "Customer",
          phone: ph || o.phone || "",
          addr: o.addr || "",
          tag: "Regular",
          source: "Facebook Page",
          note: ""
        });
        added++;
      }else if(!existing.name && o.name){
        existing.name = o.name;
      }
    });
    saveCustomers();
    renderCustomers();
    if(!silent) srToast(added > 0 ? added + " new customers synced" : "Customer data up to date");
  }

  window.srUpsertCustomerFromOrder = function(o){
    var ph = srNormalizePhone(o.phone);
    var key = ph || String(o.name || "").trim().toLowerCase();
    if(!key) return;
    var existing = customers.find(function(c){
      var cKey = srNormalizePhone(c.phone) || String(c.name || "").trim().toLowerCase();
      return cKey === key;
    });
    if(existing){
      existing.name = o.name || existing.name;
      if(ph) existing.phone = ph;
    }else{
      customers.unshift({
        name: o.name || "Customer",
        phone: ph || o.phone || "",
        addr: "",
        tag: "Regular",
        source: "Facebook Page",
        note: ""
      });
    }
    try{ localStorage.setItem("sr_customers_list", JSON.stringify(customers)); }catch(e){}
    renderCustomers();
  };

  function updateStats(metrics){
    var total = customers.length, repeat = 0, vip = 0, ltv = 0;
    customers.forEach(function(c){
      var key = srNormalizePhone(c.phone) || String(c.name || "").trim().toLowerCase();
      var m = metrics[key] || { count: 0, spent: 0 };
      if(m.count >= 2) repeat++;
      if(c.tag === "VIP") vip++;
      ltv += m.spent;
    });
    $("cst-total").textContent = String(total);
    $("cst-repeat").textContent = String(repeat);
    $("cst-vip").textContent = String(vip);
    $("cst-ltv").textContent = tk(ltv);
    if($("hud-customers")) $("hud-customers").textContent = String(total);
  }

  function renderCustomers(){
    var metrics = computeMetrics();
    updateStats(metrics);

    var q = ($("cust-search").value || "").trim().toLowerCase();
    var tag = $("cust-filter-tag").value;

    var list = customers.filter(function(c){
      if(tag && c.tag !== tag) return false;
      if(!q) return true;
      return [c.name, c.phone, c.addr, c.tag, c.source, c.note].join(" ").toLowerCase().indexOf(q) > -1;
    });

    if(!list.length){
      $("cust-rows").innerHTML = "<tr><td colspan='6' class='empty'>No customers yet</td></tr>";
      return;
    }

    $("cust-rows").innerHTML = list.map(function(c){
      var ph = srNormalizePhone(c.phone) || c.phone || "";
      var key = ph || String(c.name || "").trim().toLowerCase();
      var m = metrics[key] || { count: 0, spent: 0 };
      var waNum = ph.indexOf("01") === 0 ? "88" + ph : ph;
      var tCls = c.tag === "VIP" ? "g" : (c.tag === "Risk" ? "r" : "o");
      return "<tr>" +
        "<td><b>" + esc(c.name) + "</b>" + (c.note ? "<div class='mode'>" + esc(c.note) + "</div>" : "") + "</td>" +
        "<td>" + esc(ph || "—") + "<div class='mode'>" + esc(c.source || "Facebook Page") + "</div></td>" +
        "<td>" + esc(c.addr || "—") + "</td>" +
        "<td><b>" + m.count + "</b> orders <div class='mode'>" + tk(m.spent) + "</div></td>" +
        "<td><span class='tag " + tCls + "'>" + esc(c.tag || "Regular") + "</span></td>" +
        "<td style='white-space:nowrap'>" +
          (waNum ? "<a class='btn s' href='https://wa.me/" + esc(waNum) + "' target='_blank' rel='noopener'>WA</a> " : "") +
          "<button class='s' data-corder='" + esc(key) + "'>+Order</button> " +
          "<button class='s' data-cedit='" + esc(key) + "'>Edit</button> " +
          "<button class='s d' data-cdel='" + esc(key) + "'>Delete</button>" +
        "</td>" +
      "</tr>";
    }).join("");
  }

  $("customer-form").addEventListener("submit", function(e){
    e.preventDefault();
    var editKey = $("c-edit-phone").value;
    var ph = srNormalizePhone($("c-phone").value.trim()) || $("c-phone").value.trim();
    var name = $("c-name").value.trim();
    var newKey = ph || name.toLowerCase();
    var rec = {
      name: name,
      phone: ph,
      addr: $("c-addr").value.trim(),
      tag: $("c-tag").value || "Regular",
      source: $("c-source").value || "Facebook Page",
      note: $("c-note").value.trim()
    };
    var idx = customers.findIndex(function(c){
      var k = srNormalizePhone(c.phone) || String(c.name || "").trim().toLowerCase();
      return k === (editKey || newKey);
    });
    if(idx >= 0){
      customers[idx] = Object.assign(customers[idx], rec);
      srToast("Customer updated");
    }else{
      customers.unshift(rec);
      srToast("Customer saved");
    }
    saveCustomers();
    renderCustomers();
    resetCustForm();
  });

  function resetCustForm(){
    $("customer-form").reset();
    $("c-edit-phone").value = "";
    $("cust-form-title").textContent = "Add / update customer";
    $("c-save-btn").textContent = "Save Customer";
    $("c-cancel-edit").hidden = true;
  }

  $("c-cancel-edit").addEventListener("click", resetCustForm);
  $("cust-search").addEventListener("input", renderCustomers);
  $("cust-filter-tag").addEventListener("change", renderCustomers);
  $("sync-cust-from-orders").addEventListener("click", function(){ syncFromOrders(false); });

  $("cust-rows").addEventListener("click", function(e){
    var b = e.target.closest("button"); if(!b) return;
    var key = b.dataset.corder || b.dataset.cedit || b.dataset.cdel;
    if(!key) return;
    var c = customers.find(function(item){
      var k = srNormalizePhone(item.phone) || String(item.name || "").trim().toLowerCase();
      return k === key;
    });
    if(!c) return;
    if(b.dataset.corder && window.srStartOrderForCustomer){
      window.srStartOrderForCustomer(c.name, c.phone);
    }else if(b.dataset.cedit){
      $("c-edit-phone").value = key;
      $("c-name").value = c.name || "";
      $("c-phone").value = c.phone || "";
      $("c-addr").value = c.addr || "";
      $("c-tag").value = c.tag || "Regular";
      $("c-source").value = c.source || "Facebook Page";
      $("c-note").value = c.note || "";
      $("cust-form-title").textContent = "Editing: " + (c.name || "");
      $("c-save-btn").textContent = "Update";
      $("c-cancel-edit").hidden = false;
    }else if(b.dataset.cdel){
      if(confirm("Delete this customer?")){
        customers = customers.filter(function(item){
          var k = srNormalizePhone(item.phone) || String(item.name || "").trim().toLowerCase();
          return k !== key;
        });
        saveCustomers();
        renderCustomers();
        srToast("Customer removed");
      }
    }
  });

  $("export-customers-csv").addEventListener("click", function(){
    if(!customers.length){ srToast("No customers to export"); return; }
    var metrics = computeMetrics();
    var rows = [["Name", "Phone", "Address", "Tag", "Source", "Orders", "Sales (৳)", "Note"]];
    customers.forEach(function(c){
      var ph = srNormalizePhone(c.phone) || c.phone || "";
      var key = ph || String(c.name || "").trim().toLowerCase();
      var m = metrics[key] || { count: 0, spent: 0 };
      rows.push([c.name, ph, c.addr, c.tag, c.source, m.count, m.spent, c.note || ""]);
    });
    var csv = "\ufeff" + rows.map(function(r){ return r.map(function(v){ return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "sr-prime-mart-customers.csv";
    a.click();
    srToast("Customers CSV exported");
  });

  window.addEventListener("sr:orders-updated", function(){ syncFromOrders(true); });
  syncFromOrders(true);
})();
