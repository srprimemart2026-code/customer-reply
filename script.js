/* ===== TAB 1: PRICE QUOTATION ===== */
(function(){
var $=function(i){return document.getElementById(i)},items=[{n:"",p:"",q:1}];
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function num(v){var n=parseFloat(v);return isNaN(n)?0:n}
function tk(n){return "Tk "+(Math.round(n*100)/100).toLocaleString("en-US")}
function rows(){
 var h="";
 items.forEach(function(it,i){h+='<tr><td class="n"><input data-i="'+i+'" data-f="n" value="'+esc(it.n)+'" aria-label="Product Name"></td><td class="p"><input type="number" inputmode="decimal" min="0" data-i="'+i+'" data-f="p" value="'+esc(it.p)+'" aria-label="Price"></td><td class="q"><input type="number" inputmode="numeric" min="1" data-i="'+i+'" data-f="q" value="'+esc(it.q)+'" aria-label="Quantity"></td><td class="t" id="t'+i+'"></td><td><button class="x" data-rm="'+i+'" aria-label="Remove">✕</button></td></tr>'});
 $("rows").innerHTML=h;up();
}
function up(){
 var s=0;
 items.forEach(function(it,i){var l=num(it.p)*num(it.q);s+=l;$("t"+i).textContent=tk(l)});
 var c=ZN[+$("zs").value][3];$("dc").textContent=tk(c);$("tot").textContent=tk(s+c);
}
function qtext(){
 var D="━━━━━━━━━━━━━━",L=["Price Quotation:",D],n=0,s=0;
 items.forEach(function(it){if(it.n.trim()){n++;var l=num(it.p)*num(it.q);s+=l;if(n>1)L.push("");L.push("Product: "+it.n.trim(),"Price: "+tk(num(it.p))+" × "+num(it.q)+(num(it.q)===1?" Pc":" Pcs")+" = "+tk(l))}});
 if(!n)return "";
 var z=ZN[+$("zs").value];L.push(D,"Delivery Charge: "+tk(z[3]),"Total Payment: "+tk(s+z[3]),"Full Cash on Delivery ✅",D,"Facebook Page: S.R. PRIME MART","Contact: 01600-445389 (WhatsApp)","","Delivery Date: "+dtxt(z));
 return L.join("\n");
}
function flash(m){var b=$("cpy"),o="Copy Price Quotation";b.textContent=m;setTimeout(function(){b.textContent=o},1800)}
function fallback(t){var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}document.body.removeChild(a);flash(ok?"Copied ✓":"Copy failed")}
$("cpy").onclick=function(){var t=qtext();if(!t){flash("Add a product first");return}
 try{navigator.clipboard.writeText(t).then(function(){flash("Copied ✓")},function(){fallback(t)})}catch(e){fallback(t)}};
var ZN=[["Inside Dhaka",1,2,70],["Dhaka sub areas",2,3,110],["Outside Dhaka",2,3,130]];
function fdt(k){var d=new Date();d.setDate(d.getDate()+k);return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}
function dtxt(z){return z[1]+"-"+z[2]+" days ("+fdt(z[1])+" to "+fdt(z[2])+")"}
function fillDel(){var z=ZN[+$("zs").value];$("dn").textContent=z[0];$("d0").textContent=dtxt(z)}
fillDel();
$("zs").onchange=function(){fillDel();up()};
function cpTxt(t,b,o){function f(m){b.textContent=m;setTimeout(function(){b.textContent=o},1800)}
 function fb(){var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}document.body.removeChild(a);f(ok?"Copied ✓":"Copy failed")}
 try{navigator.clipboard.writeText(t).then(function(){f("Copied ✓")},fb)}catch(e){fb()}}
$("ofb").onclick=function(){cpTxt(["অর্ডার করার জন্য নিচের তথ্যগুলো দিন: ","","১. আপনার নাম: ","২. মোবাইল নম্বর: ","৩. সম্পূর্ণ ঠিকানা:"].join("\n"),this,"Copy Order Form")};
$("fbb").onclick=function(){cpTxt(["🛍️ আমাদের ফেসবুক পেজ: (Follow)","https://www.facebook.com/SRPRIMEMART","S.R. Prime Mart-এর পাশে থাকার জন্য ধন্যবাদ।"].join("\n"),this,"Copy Facebook Page Message")};
$("add").onclick=function(){items.push({n:"",p:"",q:1});rows()};
$("rows").oninput=function(e){var i=e.target.getAttribute("data-i"),f=e.target.getAttribute("data-f");if(i!==null){items[i][f]=e.target.value;up()}};
$("rows").onclick=function(e){var r=e.target.getAttribute("data-rm");if(r!==null){items.splice(r,1);if(!items.length)items.push({n:"",p:"",q:1});rows()}};
rows();
})();

/* ===== TAB 2: REPLY HELPER ===== */
(function(){
var T=[
{id:"greet",t:"Greeting",k:/salam|সালাম|hello|হ্যালো|হাই|\bhi\b/,x:"আসসালামু আলাইকুম ভাইয়া! {shop}-এ স্বাগতম 😊 কোন প্রোডাক্টটা লাগবে বলুন।"},
{id:"price",t:"Price",k:/dam|দাম|price|koto|কত|দর|rate/,x:"ভাইয়া, {product} এর দাম {price} টাকা। অর্ডার করতে চাইলে জানাবেন 😊"},
{id:"avail",t:"In stock",k:/ache|আছে|available|stock|স্টক|\base\b/,x:"জি ভাইয়া, {product} স্টকে আছে ✅ দাম {price} টাকা। অর্ডার করবেন?"},
{id:"delivery",t:"Delivery time and charge",k:/delivery|ডেলিভারি|kobe|কবে|koy din|কয়দিন|কতদিন|charge|চার্জ/,x:"ডেলিভারি সময়: ঢাকার ভেতরে ১-২ দিন, ঢাকার আশেপাশে ২-৩ দিন, ঢাকার বাইরে ২-৩ দিন। ডেলিভারি চার্জ: {charge}।"},
{id:"cod",t:"Cash on delivery (charge in advance)",k:/\bcod\b|cash|ক্যাশ|হাতে পেয়ে|taka dibo|টাকা দিব/,x:"জি ভাইয়া, শুধু ডেলিভারি চার্জ ({charge}) আগে দিতে হবে। পণ্যের দাম পণ্য হাতে পেয়ে চেক করে দেবেন 😊"},
{id:"fixed",t:"Fixed price",k:/last|কম|komano|কমান|discount|ডিসকাউন্ট|offer|অফার/,x:"ভাইয়া, আমাদের দাম ফিক্সড 🙏 কোয়ালিটি নিয়ে নিশ্চিন্ত থাকতে পারেন।"},
{id:"info",t:"Ask for order details",k:/order|অর্ডার|nibo|নিব|lagbe|লাগবে|nite chai|নিতে চাই/,x:"অর্ডার কনফার্ম করতে দয়া করে দিন:\n১. আপনার নাম\n২. মোবাইল নম্বর\n৩. পুরো ঠিকানা"},
{id:"advance",t:"Advance delivery charge",k:/advance|অ্যাডভান্স|এডভান্স|agei taka|আগে টাকা|bkash|বিকাশ|nagad|নগদ/,x:"অর্ডার কনফার্ম করতে ডেলিভারি চার্জ {charge} আগে পাঠাতে হবে। ফেক অর্ডারে অনেক পার্সেল ফেরত আসে বলে এই নিয়ম 🙏\nপেমেন্ট: {pay}\nপাঠানোর পর স্ক্রিনশট বা ট্রানজেকশন আইডি জানাবেন। পণ্যের দাম পণ্য হাতে পেয়ে দেবেন।"},
{id:"confirm",t:"Order confirmed",k:null,x:"ধন্যবাদ ভাইয়া! আপনার {product} অর্ডারটি কনফার্ম হয়েছে ✅ পণ্যের দাম {price} টাকা, পণ্য হাতে পেয়ে দেবেন (ডেলিভারি চার্জ আগেই পেয়েছি)। শীঘ্রই পেয়ে যাবেন।"},
{id:"out",t:"Out of stock",k:null,x:"দুঃখিত ভাইয়া, এটা এখন স্টকে নেই 🙏 চাইলে অন্য ডিজাইন দেখাতে পারি।"},
{id:"follow",t:"Follow-up",k:null,x:"ভাইয়া, অর্ডারটা কি কনফার্ম করবেন? 😊 জানালে এখনই প্রসেস করে দিই।"},
{id:"trust",t:"Customer trust",k:/trust|bishwash|বিশ্বাস|vorosa|ভরসা|fake|ফেক|original|অরিজিনাল|review|রিভিউ|scam|প্রতারণা/,x:"ভাইয়া, দ্বিধার কিছু নেই 😊 আগের কাস্টমারদের রিভিউ ও ছবি এখানে দেখতে পারবেন: {review}\nফেক অর্ডারে অনেক পার্সেল ফেরত আসে, তাই আমরা শুধু ডেলিভারি চার্জ আগে নিই। পণ্যের দাম পণ্য হাতে পেয়ে চেক করে দেবেন 🙏\n{policy}"},
{id:"thanks",t:"Thanks",k:null,x:"ধন্যবাদ ভাইয়া! আমাদের সাথে থাকার জন্য 🙏 কোনো প্রয়োজনে জানাবেন।"}
];
var $=function(i){return document.getElementById(i)};
var S={shop:"S.R. Prime Mart",charge:"",plist:""};
try{var s=JSON.parse(localStorage.getItem("rh_settings")||"null");if(s){S=s}}catch(e){}
if(S.review===undefined)S.review="https://www.facebook.com/share/p/1UYhXZzukX/";
if(S.policy===undefined)S.policy="পণ্যে কোনো সমস্যা থাকলে ডেলিভারির সময়ই আমাদের জানাবেন, আমরা সমাধানের চেষ্টা করব 🙏";
function save(){try{localStorage.setItem("rh_settings",JSON.stringify(S))}catch(e){}}

function splitLine(l){
  var i;
  if(l.indexOf("\t")>-1){var a=l.split("\t");return[a[0],a[1]||""]}
  if(l.indexOf("|")>-1){var b=l.split("|");return[b[0],b[1]||""]}
  i=l.lastIndexOf(",");
  if(i>-1)return[l.slice(0,i),l.slice(i+1)];
  return[l,""];
}
function clean(s){return(s||"").replace(/^\s*"|"\s*$/g,"").trim()}
function products(){
  return S.plist.split(/\r?\n/).map(function(l){var p=splitLine(l);return{n:clean(p[0]),p:clean(p[1])}})
    .filter(function(x){return x.n&&!/^(name|product|প্রোডাক্ট|নাম)$/i.test(x.n)});
}
function fillSelect(){
  var cur=$("prod").value,ps=products(),h='<option value="">— select product —</option>';
  ps.forEach(function(p,i){h+='<option value="'+i+'">'+esc(p.n)+(p.p?" — "+esc(p.p):"")+'</option>'});
  $("prod").innerHTML=h;
  if(cur&&ps[cur])$("prod").value=cur;
}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fill(x){
  var ps=products(),p=ps[$("prod").value];
  return x.replace(/\{product\}/g,p?p.n:"[product]")
          .replace(/\{price\}/g,p&&p.p?p.p:"[price]")
          .replace(/\{shop\}/g,S.shop||"[shop]")
          .replace(/\{charge\}/g,S.charge||"[charge]")
          .replace(/\{review\}/g,S.review||"[review link]")
          .replace(/\{pay\}/g,S.pay||"[bKash/Nagad number]")
          .replace(/\{policy\}/g,S.policy||"[return policy]");
}
function detect(){
  var m=$("msg").value.toLowerCase();
  return m?T.filter(function(t){return t.k&&t.k.test(m)}).map(function(t){return t.id}):[];
}
function render(){
  var hits=detect();
  $("chips").innerHTML=hits.map(function(id){var t=T.filter(function(a){return a.id===id})[0];return'<span class="chip">'+t.t+'</span>'}).join("")||
    '<span class="hint">Suggested replies appear here and move to the top.</span>';
  var ids=T.map(function(t){return t.id}).filter(function(id){return hits.indexOf(id)>-1&&!(id==="price"&&hits.indexOf("avail")>-1)});
  $("t_best").value=ids.map(function(id){return fill(T.filter(function(t){return t.id===id})[0].x)}).join("\n\n");
  var order=T.slice().sort(function(a,b){return(hits.indexOf(b.id)>-1)-(hits.indexOf(a.id)>-1)});
  $("list").innerHTML=order.map(function(t){
    var hit=hits.indexOf(t.id)>-1;
    return'<div class="card'+(hit?' hit':'')+'"><div class="top"><span><b>'+t.t+'</b>'+(hit?'<span class="tag">Suggested</span>':'')+
      '</span><button type="button" data-c="'+t.id+'">Copy</button></div><textarea id="t_'+t.id+'" aria-label="'+t.t+'">'+esc(fill(t.x))+'</textarea></div>';
  }).join("");
}
function copy(id,btn){
  var el=$("t_"+id);
  var ot=btn.textContent,oc=btn.className;
  function ok(){btn.textContent="Copied";btn.className="done";setTimeout(function(){btn.textContent=ot;btn.className=oc},1400)}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(el.value).then(ok,fb)}else fb();
  function fb(){el.select();try{document.execCommand("copy");ok()}catch(e){}}
}
$("list").addEventListener("click",function(e){var c=e.target.getAttribute("data-c");if(c)copy(c,e.target)});
function autoProduct(){
  var m=$("msg").value.toLowerCase(),ps=products(),best=-1,score=0,tie=false;
  if(!m)return;
  ps.forEach(function(p,i){
    var n=p.n.toLowerCase(),sc=m.indexOf(n)>-1?5:0;
    n.split(/\s+/).forEach(function(w){if(w.length>=3&&m.indexOf(w)>-1)sc++});
    if(sc>score){score=sc;best=i;tie=false}else if(sc===score&&sc>0){tie=true}
  });
  if(best>-1&&!tie)$("prod").value=String(best);
}
function onMsg(){autoProduct();render()}
$("msg").addEventListener("input",onMsg);
$("msg").addEventListener("paste",function(){
  setTimeout(function(){
    onMsg();
    var b=$("t_best"),bc=$("bestcopy");
    if(!b.value)return;
    b.select();
    var ok=false;try{ok=document.execCommand("copy")}catch(e){}
    b.setSelectionRange(0,0);
    if(ok){bc.textContent="Reply copied";bc.className="done";setTimeout(function(){bc.textContent="Copy best reply";bc.className=""},2500)}
  },0);
});
$("bestcopy").addEventListener("click",function(){copy("best",this)});
$("prod").addEventListener("change",render);
$("clear").addEventListener("click",function(){$("msg").value="";render();$("msg").focus()});
$("shop").addEventListener("input",function(){S.shop=this.value;save();render()});
$("charge").addEventListener("input",function(){S.charge=this.value;save();render()});
$("review").addEventListener("input",function(){S.review=this.value;save();render()});
$("pay").addEventListener("input",function(){S.pay=this.value;save();render()});
$("policy").addEventListener("input",function(){S.policy=this.value;save();render()});
$("plist").addEventListener("input",function(){S.plist=this.value;save();fillSelect();render()});
$("imp").addEventListener("click",function(){$("file").click()});
$("file").addEventListener("change",function(){
  var f=this.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){
    S.plist=String(r.result).replace(/^\uFEFF/,"");save();
    $("plist").value=S.plist;fillSelect();render();
  };
  r.readAsText(f,"utf-8");this.value="";
});
$("shop").value=S.shop;$("charge").value=S.charge;$("review").value=S.review;$("pay").value=S.pay||"";$("policy").value=S.policy||"";$("plist").value=S.plist;
if(!S.plist)$("settings").open=true;
fillSelect();render();
})();

/* ===== TAB SWITCHER ===== */
(function(){
var btns=document.querySelectorAll("#tabs button");
btns.forEach(function(b){b.addEventListener("click",function(){
 btns.forEach(function(x){var on=x===b;x.className=on?"on":"";document.getElementById("pane-"+x.getAttribute("data-tab")).hidden=!on});
 window.scrollTo(0,0);
})});
})();
