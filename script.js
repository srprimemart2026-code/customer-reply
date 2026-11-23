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
