
(function(){
  var TITLES=["Governor","Senator","Mayor","Sheriff","Commissioner","Ambassador","Admiral","Chancellor","Judge","Treasurer","Delegate","Councilor","Speaker","Marshal","Consul","Envoy"],NAMES=["Abigail","Bartholomew","Cornelius","Dolly","Ezekiel","Florence","Gus","Hattie","Ignatius","Josephine","Kit","Lulu","Mortimer","Nell","Otis","Prudence","Quincy","Rosalind","Silas","Tabitha","Ulysses","Vera","Winifred","Xavier","Yolanda","Zebulon","Barnaby","Clementine","Delbert","Eugenia"],PLACES=["New Ohio","Moon Kansas","Mars Vermont","Ceres Texas","Lunar Maine","Venus Nevada","Titan Oregon","Pluto Dakota","Io Iowa","Europa Utah","Saturn Idaho","Nebula Montana","Orion Georgia","Vega Virginia","Comet Carolina","Galaxy Alabama","Quasar Florida","Andromeda Arizona","Ganymede Delaware","Callisto Colorado"],
      PARTY=["Nap","Pie","Both-Sides","Money","Hat","Beige","Fireworks","Eagle","Snack","Recount","Filibuster","Moon","Pothole","Brunch","Glitter","Meh","Yard Sign","Confetti","Bald Eagle","Casserole"],SLOGANS=["Vote for me. Or don't. I'm flexible.","A pie in every oven, a flag on every pie.","I have a plan. It's in my other pants.","Tough on crime, soft on pastries.","Four more years of whatever this is.","Make lunch great again.","Read my lips: more naps.","I approve this message. Mostly.","Standing firmly on both sides.","Yes we can (probably).","Bigger yard signs. Fewer promises.","The buck stops somewhere near here.","Ask not what your country can do for you. Ask for snacks.","I'm not a crook, I'm a hook. On catchy slogans.","Experience you can mostly trust.","Fireworks on weekdays. It's time."],FACES=["washington","teddy","lincoln","jefferson","reagan","nixon","ike","jfk","hamilton","fdr","cleveland","carter","hoover","lbj","ford","harding","polk","tyler","mckinley","truman","monroe","madison","taft","grant","wilson","clonewash","jackson","coolidge","jqadams","vanburen","arthur","hayes","bharrison","fillmore","ztaylor","admin","jadams","whharrison","pierce","buchanan","ajohnson","garfield","mirrorwash","altlincoln","kidpres","auntsam","franklin","ross","revere","sousa","liberty","samjr","cand_snooze","cand_flip","cand_fat","cand_hat","rival_duke","rival_king","unclesam"];
  function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(a){return function(){a=(a+0x6D2B79F5)>>>0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  function pick(r,l){return l[Math.floor(r()*l.length)];}
  window.SSTName=function(input){
    var seed=input&&input.trim()?hash(input.trim().toLowerCase()):Math.floor(Math.random()*4294967296),r=rng(seed);
    return {name:pick(r,TITLES)+' '+pick(r,NAMES)+' of '+pick(r,PLACES),party:'The '+pick(r,PARTY)+' Party',slogan:pick(r,SLOGANS),face:pick(r,FACES),seed:seed};
  };
  function card(g){
    // 1080x1350 share image
    return new Promise(function(res){
      var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
      var gr=x.createLinearGradient(0,0,0,1350);gr.addColorStop(0,'#1f3a93');gr.addColorStop(1,'#070b1f');x.fillStyle=gr;x.fillRect(0,0,1080,1350);
      for(var i=0;i<18;i++){x.fillStyle=i%2?'#fff':'#c8102e';x.fillRect(i*60,0,60,16);}
      var img=new Image();img.onload=function(){
        x.drawImage(img,290,150,500,500);
        x.fillStyle='#f5c518';x.font='900 44px -apple-system,system-ui,sans-serif';x.textAlign='center';x.fillText('MY PARODY POLITICIAN NAME IS',540,740);
        x.fillStyle='#fff';var fs=84;x.font='900 '+fs+'px -apple-system,system-ui,sans-serif';while(x.measureText(g.name).width>1000&&fs>40){fs-=4;x.font='900 '+fs+'px -apple-system,system-ui,sans-serif';}
        x.fillText(g.name,540,850);x.fillStyle='#ff5a6e';x.font='800 52px -apple-system,system-ui,sans-serif';x.fillText(g.party,540,940);
        x.fillStyle='#dfe4f2';x.font='italic 40px Georgia,serif';x.fillText('“'+g.slogan+'”',540,1030,1000);
        x.fillStyle='#f5c518';x.font='900 46px -apple-system,system-ui,sans-serif';x.fillText('What\'s yours? Star-Spangled Tycoon',540,1200);
        x.fillStyle='#fff';x.font='700 34px -apple-system,system-ui,sans-serif';x.fillText('rogerstheboss12-coder.github.io/name',540,1260);
        c.toBlob(res,'image/png');
      };
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(Portraits.portrait(g.face,{uid:'share',bg:'#c8102e'}));
    });
  }
  window.SSTShare=function(blob,text,file){
    var f=new File([blob],file,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]}))return navigator.share({files:[f],text:text}).catch(function(){});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file;a.click();
  };
  window.SSTNameMount=function(root){
    var inp=root.querySelector('input'),out=root.querySelector('.gen-out'),last=null;
    function go(){var g=window.SSTName(inp.value);last=g;
      out.innerHTML=Portraits.portrait(g.face,{uid:'g'+g.seed,bg:'#c8102e',talking:true})+'<div><div class="nm"></div><div class="pt"></div><div class="muted sl"></div><p style="margin:.6em 0 0"><button class="btn gold sh">Share my card</button></p></div>';
      out.querySelector('.nm').textContent=g.name;out.querySelector('.pt').textContent=g.party;out.querySelector('.sl').textContent='“'+g.slogan+'”';
      out.querySelector('.sh').onclick=function(){card(last).then(function(b){window.SSTShare(b,'My parody politician name is '+last.name+', '+last.party+'! What\'s yours? https://rogerstheboss12-coder.github.io/name/','politician-name.png');});};
    }
    root.querySelector('.go').onclick=go;inp.addEventListener('keydown',function(e){if(e.key==='Enter')go();});
  };
  document.querySelectorAll('[data-sst-name]').forEach(window.SSTNameMount);
})();