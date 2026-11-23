/* ===== TAB SWITCHER ===== */
(function(){
  var btns = document.querySelectorAll("#tabs button");
  function activate(tabName){
    btns.forEach(function(b){
      var on = b.getAttribute("data-tab") === tabName;
      b.classList.toggle("on", on);
      var pane = document.getElementById("pane-" + b.getAttribute("data-tab"));
      if(pane) pane.hidden = !on;
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  btns.forEach(function(b){
    b.addEventListener("click", function(){
      activate(b.getAttribute("data-tab"));
    });
  });
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

  function up(){
    var sub = 0;
    items.forEach(function(it, i){
      var lineTotal = num(it.p) * qty(it.q);
      sub += lineTotal;
      var cell = $("t" + i);
      if(cell) cell.textContent = tk(lineTotal);
    });
    var z = ZN[+$("zs").value] || ZN[0];
    $("sub").textContent = tk(sub);
    $("dc").textContent = tk(z[3]);
    $("tot").textContent = tk(sub + z[3]);
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
    var D = "━━━━━━━━━━━━━━", L = ["Price Quotation:", D], count = 0, sub = 0;
    items.forEach(function(it){
      var name = String(it.n || "").trim();
      if(name){
        count++;
        var qv = qty(it.q), pv = num(it.p), lineTotal = pv * qv;
        sub += lineTotal;
        if(count > 1) L.push("");
        L.push(
          "Product: " + name,
          "Price: " + tk(pv) + " × " + qv + (qv === 1 ? " Pc" : " Pcs") + " = " + tk(lineTotal)
        );
      }
    });
    if(!count) return "";
    var z = ZN[+$("zs").value] || ZN[0];
    L.push(
      D,
      "Delivery Charge: " + tk(z[3]),
      "Total Payment: " + tk(sub + z[3]),
      "Full Cash on Delivery ✅",
      D,
      "Facebook Page: S.R. PRIME MART",
      "Contact: 01600-445389 (WhatsApp)",
      "",
      "Delivery Date: " + dtxt(z)
    );
    return L.join("\n");
  }

  function cpTxt(text, btn, origLabel){
    function flash(msg){
      btn.textContent = msg;
      setTimeout(function(){ btn.textContent = origLabel; }, 1800);
    }
    function fallback(){
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try{ ok = document.execCommand("copy"); }catch(e){}
      document.body.removeChild(ta);
      flash(ok ? "Copied ✓" : "Copy failed");
    }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){ flash("Copied ✓"); }, fallback);
    }else{
      fallback();
    }
  }

  $("cpy").onclick = function(){
    var t = qtext();
    if(!t){
      var b = this;
      b.textContent = "Add a product first";
      setTimeout(function(){ b.textContent = "Copy Price Quotation"; }, 1800);
      return;
    }
    cpTxt(t, this, "Copy Price Quotation");
  };

  $("ofb").onclick = function(){
    cpTxt(["অর্ডার করার জন্য নিচের তথ্যগুলো দিন:", "", "১. আপনার নাম:", "২. মোবাইল নম্বর:", "৩. সম্পূর্ণ ঠিকানা:"].join("\n"), this, "Copy Order Form");
  };

  $("fbb").onclick = function(){
    cpTxt(["🛍️ আমাদের ফেসবুক পেজ: (Follow)", "https://www.facebook.com/SRPRIMEMART", "S.R. Prime Mart-এর পাশে থাকার জন্য ধন্যবাদ।"].join("\n"), this, "Copy Facebook Page Message");
  };

  $("clear-quote").onclick = function(){
    items = [{ n: "", p: "", q: 1 }];
    rows();
  };

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

/* ===== TAB 2: REPLY HELPER ===== */
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
  var S = { shop: "S.R. Prime Mart", charge: "", plist: "" };

  try{
    var s = JSON.parse(localStorage.getItem("rh_settings") || "null");
    if(s) S = Object.assign(S, s);
  }catch(e){}

  if(S.review === undefined) S.review = "https://www.facebook.com/share/p/1UYhXZzukX/";
  if(S.policy === undefined) S.policy = "পণ্যে কোনো সমস্যা থাকলে ডেলিভারির সময়ই আমাদের জানাবেন, আমরা সমাধানের চেষ্টা করব 🙏";

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
    if(!el) return;
    var orig = btn.textContent;
    function ok(){
      btn.textContent = "Copied";
      btn.classList.add("done");
      setTimeout(function(){ btn.textContent = orig; btn.classList.remove("done"); }, 1400);
    }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(el.value).then(ok, fb);
    }else{
      fb();
    }
    function fb(){
      el.select();
      try{ document.execCommand("copy"); ok(); }catch(e){}
    }
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
      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(b.value).then(function(){
          bc.textContent = "Reply copied";
          bc.classList.add("done");
          setTimeout(function(){ bc.textContent = "Copy best reply"; bc.classList.remove("done"); }, 2200);
        }, function(){});
      }
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
  if(!S.plist) $("settings").open = true;

  fillSelect();
  render();
})();

/* ===== TAB 3: ORDER DESK ===== */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var orders = [];

  try{
    var saved = JSON.parse(localStorage.getItem("sr_orders_list") || "null");
    if(Array.isArray(saved)) orders = saved;
  }catch(e){}

  function saveOrders(){
    try{ localStorage.setItem("sr_orders_list", JSON.stringify(orders)); }catch(e){}
  }

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderOrders(){
    $("order-count").textContent = String(orders.length);
    if(!orders.length){
      $("order-rows").innerHTML = '<tr><td colspan="6" style="color:var(--mute);padding:12px 6px">কোনো অর্ডার সেভ করা নেই।</td></tr>';
      return;
    }
    $("order-rows").innerHTML = orders.map(function(o, i){
      return '<tr>' +
        '<td>' + esc(o.name) + '</td>' +
        '<td>' + esc(o.phone) + '</td>' +
        '<td>' + esc(o.addr) + '</td>' +
        '<td>' + esc(o.prod) + '</td>' +
        '<td>Tk ' + esc(o.total || "0") + '</td>' +
        '<td><button type="button" class="x" data-odel="' + i + '" aria-label="Delete order">✕</button></td>' +
      '</tr>';
    }).join("");
  }

  $("order-form").addEventListener("submit", function(e){
    e.preventDefault();
    orders.unshift({
      name: $("o-name").value.trim(),
      phone: $("o-phone").value.trim(),
      addr: $("o-addr").value.trim(),
      prod: $("o-prod").value.trim(),
      total: $("o-total").value.trim() || "0"
    });
    saveOrders();
    renderOrders();
    this.reset();
  });

  $("order-rows").addEventListener("click", function(e){
    var idx = e.target.getAttribute("data-odel");
    if(idx !== null){
      orders.splice(+idx, 1);
      saveOrders();
      renderOrders();
    }
  });

  $("clear-orders").addEventListener("click", function(){
    orders = [];
    saveOrders();
    renderOrders();
  });

  $("export-csv").addEventListener("click", function(){
    if(!orders.length) return;
    var csvRows = ["Customer Name,Mobile,Address,Product,Total (Tk)"];
    orders.forEach(function(o){
      var line = [o.name, o.phone, o.addr, o.prod, o.total].map(function(v){
        return '"' + String(v || "").replace(/"/g, '""') + '"';
      }).join(",");
      csvRows.push(line);
    });
    var blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "sr-prime-mart-orders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  renderOrders();
})();
