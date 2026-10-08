(() => {
 const preview=new URLSearchParams(location.search).get('notice_preview')==='1';
 document.querySelectorAll('.poster-notice').forEach(card=>{
  const key='random-korea.poster.'+card.dataset.notice+'.hideUntil';
  try{if(!preview && Number(localStorage.getItem(key))>Date.now())card.hidden=true;}catch{}
  card.querySelector('button').addEventListener('click',()=>{
   if(card.querySelector('input').checked&&!preview){try{localStorage.setItem(key,String(Date.now()+86400000));}catch{}}
   card.hidden=true;update();
  });
 });
 function update(){document.querySelector('.poster-notices').classList.toggle('no-notices',!Array.from(document.querySelectorAll('.poster-notice')).some(x=>!x.hidden));}
 update();
})();
