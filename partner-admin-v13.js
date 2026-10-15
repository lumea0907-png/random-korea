(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const C = window.RKPartner;
  const STORAGE = 'rk_partner_draft_v13';
  const FORM_STORAGE = 'rk_partner_form_v13';
  const IMAGE_DB = 'rk_partner_image_db_v13';
  const IMAGE_STORE = 'images';
  const textKeys = ['name','area','district','category','title','benefit','description','image','url','booking','start','end','order'];
  const boolKeys = ['enabled','hero','directory','real'];
  const pageRegion = ['서울','경기','인천','강원','충청','전라','경상','제주'];
  let rows = [], baseline = [], currentId = null, formDirty = false, hasChanges = false;
  let imagePreviewUrl = null, dbPromise = null, serverReady = false;
  let nextImageFile = null;
  let baselineSignature = '';
  function signature(items) { return JSON.stringify(items); }
  const defaults = {area:'서울',category:'맛집·카페',enabled:true,hero:true,directory:true,real:true};

  const msg = (message,type='success') => {
    const n = $('notice'); n.textContent = message; n.className = 'notice'+(type==='error'?' error':type==='warn'?' warn':'');
  };
  const escape = (v) => String(v || '').toLowerCase().trim();
  function cloneRows(a) { return a.map(x => ({...x})); }
  function idNew() { return 'partner-'+(crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2)); }
  function safeSave(key,value) { try {localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){msg('브라우저 저장 공간이 부족하거나 차단됐습니다. 백업 JSON을 내려받으세요: '+e.message,'error');return false;} }
  function persist() { hasChanges = true; safeSave(STORAGE,{version:13,updated:Date.now(),baselineSignature,rows}); $('draftSource').textContent='브라우저 임시저장'; }
  function persistForm(){
    try{sessionStorage.setItem(FORM_STORAGE,JSON.stringify({id:currentId,record:readForm()}));}catch{}
  }
  function clearFormDraft(){try{sessionStorage.removeItem(FORM_STORAGE);}catch{}}
  function applyAll() {
    const current = C.today(),active=rows.filter(x=>C.active(x,current));
    $('statTotal').textContent=rows.length;
    $('statActive').textContent=active.length;
    $('statHero').textContent=active.filter(x=>x.hero).length;
    $('statHidden').textContent=rows.length-active.length;
    drawList();
  }
  function matches(x) {
    const q=escape($('search').value);
    const region=$('areaFilter').value;
    const f=$('statusFilter').value;
    return (!q || escape([x.name,x.area,x.district,x.title,x.benefit].join(' ')).includes(q))
      && (!region || x.area===region)
      && (f==='all' || (f==='active' && C.active(x)) || (f==='hidden'&&!C.active(x)) || (f==='hero'&&C.active(x)&&x.hero));
  }
  function el(tag,className,textContent){const x=document.createElement(tag);if(className)x.className=className;if(textContent!==undefined)x.textContent=textContent;return x;}
  function drawList(){
    const results=rows.filter(matches).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'ko'));
    $('matchedCount').textContent=results.length+'곳';
    $('listCount').textContent=`총 ${rows.length}곳 중 ${results.length}곳 표시`;
    const root=$('partnerList');root.replaceChildren();
    if(!results.length){root.append(el('div','empty','검색 조건에 맞는 업체가 없습니다.'));return;}
    results.forEach(record=>{
      const item=el('div','partner-item'+(record.id===currentId?' selected':''));item.tabIndex=0;
      const thumb=record.image?el('img','partner-thumb'):el('span','partner-fallback','▧');
      if(thumb.tagName==='IMG'){
        thumb.src=C.url(record.image) || '';thumb.alt='';thumb.loading='lazy';
        thumb.onerror=()=>{const fallback=el('span','partner-fallback','▧');thumb.replaceWith(fallback);};
        if(record.image.startsWith('./rk-partner-')){
          getImage(record.image).then(blob=>{if(!blob || !thumb.isConnected)return;const u=URL.createObjectURL(blob);thumb.src=u;thumb.addEventListener('load',()=>URL.revokeObjectURL(u),{once:true});}).catch(()=>{});
        }
      }
      const info=el('div','partner-info');info.append(el('strong','',record.name),el('small','',record.area+(record.district?' · '+record.district:'')+' · '+record.category));
      info.append(el('span','status'+(C.active(record)?' on':''),C.active(record)?'노출 중':!record.enabled?'숨김':'기간 외'));
      const tools=el('div','partner-tools');const edit=el('button','','수정');edit.type='button';edit.onclick=(e)=>{e.stopPropagation();loadRecord(record.id);};
      const toggle=el('button','',record.enabled?'숨김':'공개');toggle.type='button';toggle.onclick=e=>{e.stopPropagation();if(formDirty&&!confirm('입력 중인 수정사항은 저장되지 않았습니다. 계속할까요?'))return;const r=rows.find(x=>x.id===record.id);r.enabled=!r.enabled;persist();if(currentId===record.id)fillForm(r);applyAll();msg(r.name+' · '+(r.enabled?'공개 허용':'숨김')+' 처리됐습니다. 배포 ZIP을 올려야 사이트에 반영됩니다.');};
      tools.append(edit,toggle);item.append(thumb,info,tools);
      item.onclick=()=>loadRecord(record.id);
      item.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target===item){e.preventDefault();loadRecord(record.id);}};
      root.append(item);
    });
  }
  function clearImageObject(){if(imagePreviewUrl)URL.revokeObjectURL(imagePreviewUrl);imagePreviewUrl=null;}
  async function previewImage(path){
    clearImageObject();const img=$('photoPreview'),label=$('photoFallback');img.hidden=true;label.hidden=false;img.removeAttribute('src');
    if(!path){label.textContent='등록된 사진이 여기에 표시됩니다.';return;}
    let src=C.url(path);
    if(path.startsWith('./rk-partner-')) {
      try {const blob=await getImage(path);if(blob){src=URL.createObjectURL(blob);imagePreviewUrl=src;}}catch{}
    }
    if(!src){label.textContent='유효한 사진 주소가 아닙니다.';return;}
    img.src=src;img.hidden=false;label.hidden=true;
    img.onerror=()=>{img.hidden=true;label.hidden=false;label.textContent='사진을 표시할 수 없습니다. 직접 이미지 파일 또는 실제 이미지 URL을 사용하세요.';};
  }
  function fillForm(record){
    clearFormDraft();formDirty=false;currentId=record?.id||null;nextImageFile=null;
    textKeys.forEach(key=>{$(key).value=record?.[key]??(key==='order'?rows.length+1:defaults[key]??'');});
    boolKeys.forEach(key=>{$(key).checked=record ? record[key]===true : defaults[key]===true;});
    $('editorHeading').textContent=record?'업체 수정 · '+record.name:'새 업체 등록';
    $('editorPill').textContent=record?'EDIT':'NEW';
    $('duplicateButton').hidden=!record;$('deleteButton').hidden=!record;
    previewImage($('image').value);drawList();
  }
  function readForm(){
    const r={id:currentId||idNew()};textKeys.forEach(k=>r[k]=$(k).value.trim());boolKeys.forEach(k=>r[k]=$(k).checked);
    r.order=Number(r.order||rows.length+1);return r;
  }
  function canSwitch(){return !formDirty||confirm('아직 업체 저장을 누르지 않은 입력사항이 있습니다. 입력을 버릴까요?');}
  function loadRecord(id){if(!canSwitch())return;const x=rows.find(r=>r.id===id);if(!x)return;fillForm(x);if(window.innerWidth<1020)$('editorHeading').scrollIntoView({block:'start',behavior:'smooth'});}

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(Error('이 브라우저는 사진 임시저장을 지원하지 않습니다.'));return;}
      const req=indexedDB.open(IMAGE_DB,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(IMAGE_STORE))req.result.createObjectStore(IMAGE_STORE);};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||Error('사진 저장소를 열 수 없습니다.'));
    });
    return dbPromise;
  }
  async function putImage(path,blob){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(IMAGE_STORE,'readwrite');t.objectStore(IMAGE_STORE).put(blob,path);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
  async function getImage(path){const db=await openDb();return new Promise((resolve,reject)=>{const req=db.transaction(IMAGE_STORE,'readonly').objectStore(IMAGE_STORE).get(path);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}
  function loadPicture(file){return new Promise((resolve,reject)=>{const objectUrl=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(objectUrl);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(Error('사진 파일을 읽을 수 없습니다.'));};img.src=objectUrl;});}
  async function optimizeImage(file){
    const image=await loadPicture(file);
    const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(Error('이미지를 변환하지 못했습니다.')),'image/webp',.82));
    return blob;
  }
  async function selectPhoto(file){
    if(!file)return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('JPG, PNG, WebP 이미지만 가능합니다.');
    if(file.size>8*1024*1024)throw Error('이미지는 8MB 이하만 가능합니다.');
    const blob=await optimizeImage(file);
    const filePath='./rk-partner-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.webp';
    await putImage(filePath,blob);
    $('image').value=filePath;nextImageFile=filePath;formDirty=true;persistForm();await previewImage(filePath);
    msg('사진을 최적화해 임시 보관했습니다 ('+Math.round(blob.size/1024)+'KB). ‘업체 저장’ 후 배포 ZIP에 사진이 포함됩니다.');
  }

  function saveRecord(){
    const record=readForm();
    if(!record.name)throw Error('업체명을 입력하세요.');
    if(!record.area)throw Error('지역을 선택하세요.');
    const validated=C.validate([record])[0];
    const index=rows.findIndex(x=>x.id===validated.id);
    if(index===-1)rows.push(validated);else rows[index]=validated;
    persist();fillForm(validated);applyAll();
    msg('✓ '+validated.name+' 저장 완료 · 현재 브라우저에 안전하게 임시저장했습니다. 사이트 반영은 배포 ZIP을 올려야 합니다.');
  }
  function makeDataFile(data){return 'window.RK_PARTNERS = '+JSON.stringify(C.validate(data),null,2)+';\n';}
  function download(blob,name){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);}
  const encode=s=>new TextEncoder().encode(s);
  // ZIP STORE (no compression): files are already compressed photos; no external library required.
  const crcTable=new Uint32Array(256);for(let i=0;i<256;i++){let n=i;for(let k=0;k<8;k++)n=n&1?0xEDB88320^(n>>>1):n>>>1;crcTable[i]=n>>>0;}
  function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  function zip(files){
    const chunks=[],directory=[];let offset=0;
    const push=(u)=>{chunks.push(u);offset+=u.length;};
    const u16=(dv,at,v)=>dv.setUint16(at,v,true),u32=(dv,at,v)=>dv.setUint32(at,v>>>0,true);
    const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosDate=((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    for(const file of files){
      const name=encode(file.name),data=file.data instanceof Uint8Array?file.data:new Uint8Array(file.data);
      if(data.length>0xFFFFFFFF)throw Error('파일 크기가 너무 큽니다.');
      const crc=crc32(data),base=offset,h=new Uint8Array(30+name.length),v=new DataView(h.buffer);
      u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,0x800);u16(v,8,0);u16(v,10,dosTime);u16(v,12,dosDate);
      u32(v,14,crc);u32(v,18,data.length);u32(v,22,data.length);u16(v,26,name.length);u16(v,28,0);h.set(name,30);push(h);push(data);
      const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);
      u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x800);u16(cv,10,0);u16(cv,12,dosTime);u16(cv,14,dosDate);
      u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u32(cv,42,base);c.set(name,46);directory.push(c);
    }
    const dirStart=offset;directory.forEach(push);const dirSize=offset-dirStart;
    const e=new Uint8Array(22),dv=new DataView(e.buffer);u32(dv,0,0x06054b50);u16(dv,8,files.length);u16(dv,10,files.length);u32(dv,12,dirSize);u32(dv,16,dirStart);push(e);
    return new Blob(chunks,{type:'application/zip'});
  }
  async function exportPackage(){
    if(formDirty)throw Error('편집 중인 업체를 먼저 ‘업체 저장’으로 저장하세요.');
    const valid=C.validate(rows);
    const files=[{name:'partners-data.js',data:encode(makeDataFile(valid))}];
    let photos=0;
    for(const path of new Set(valid.map(x=>x.image).filter(x=>x.startsWith('./rk-partner-')))){
      const blob=await getImage(path);
      if(!blob)throw Error('사진 원본을 찾지 못했습니다: '+path+' · 업체 편집에서 사진을 다시 올려주세요.');
      files.push({name:path.slice(2),data:new Uint8Array(await blob.arrayBuffer())});photos++;
    }
    files.push({name:'UPLOAD-README.txt',data:encode('랜덤코리아 업체 데이터 배포 안내\r\n\r\n1. ZIP 파일을 압축 해제합니다.\r\n2. GitHub 저장소 최상위에 partners-data.js와 함께 포함된 이미지 파일을 업로드합니다.\r\n3. 반드시 Commit changes 한 뒤 배포 완료를 확인합니다.\r\n4. 기존 GitHub 파일은 삭제하지 마세요. 기존 이미지, JS, CSS를 유지해야 합니다.\r\n5. 이번 ZIP은 임시 등록·편집한 업체 '+valid.length+'곳의 데이터 및 새로 선택한 사진 '+photos+'개를 포함합니다.\r\n6. 기존 데이터에 이미 등록된 이미지 파일은 ZIP에 다시 포함되지 않습니다.\r\n7. 이미지가 없는 업체는 웹사이트에서 이미지가 표시되지 않을 수 있습니다.\r\n')} );
    download(zip(files),'random-korea-partners-deploy-'+new Date().toISOString().slice(0,10)+'.zip');
    msg('배포 ZIP 다운로드 완료 · 업체 '+valid.length+'곳 / 신규 사진 '+photos+'개. 압축 해제 후 개별 파일을 GitHub에 올리세요.');
  }
  function backup(){
    const info={format:'RANDOM_KOREA_PARTNER_BACKUP_V13',createdAt:new Date().toISOString(),rows:C.validate(rows)};
    download(new Blob([JSON.stringify(info,null,2)],{type:'application/json;charset=utf-8'}),'random-korea-partners-backup-'+new Date().toISOString().slice(0,10)+'.json');
    msg('업체 백업 JSON을 다운로드했습니다. 별도로 보관해 주세요. 사진 파일은 배포 ZIP에 포함됩니다.');
  }
  function parseRecordFile(contents){
    const t=contents.trim().replace(/^\uFEFF/,'');
    let parsed;
    if(t.startsWith('window.RK_PARTNERS')){let rest=t.slice(t.indexOf('=')+1).trim().replace(/;\s*$/,'');parsed=JSON.parse(rest);}
    else parsed=JSON.parse(t);
    return C.validate(Array.isArray(parsed)?parsed:parsed.rows);
  }
  function parseDelimited(input,delimiter){
    const result=[];let row=[],part='',quoted=false;
    const data=input.replace(/^\uFEFF/,'');
    for(let i=0;i<data.length;i++){
      const ch=data[i];
      if(quoted){if(ch==='"'&&data[i+1]==='"'){part+='"';i++;}else if(ch==='"')quoted=false;else part+=ch;continue;}
      if(ch==='"'&&part==='')quoted=true;
      else if(ch===delimiter){row.push(part.trim());part='';}
      else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&data[i+1]==='\n')i++;row.push(part.trim());part='';if(row.some(Boolean))result.push(row);row=[];}
      else part+=ch;
    }
    row.push(part.trim());if(row.some(Boolean))result.push(row);
    if(quoted)throw Error('CSV 따옴표가 닫히지 않았습니다.');return result;
  }
  const headers={
    '업체명':'name','상호명':'name','이름':'name','name':'name',
    '지역':'area','광역지역':'area','광역 지역':'area','area':'area',
    '시군구':'district','시·군·구':'district','상세지역':'district','동':'district','district':'district',
    '업종':'category','카테고리':'category','category':'category',
    '제목':'title','배너제목':'title','배너 제목':'title','title':'title',
    '혜택':'benefit','할인혜택':'benefit','할인·혜택':'benefit','benefit':'benefit',
    '설명':'description','업체소개':'description','description':'description',
    '이미지':'image','사진':'image','이미지url':'image','image':'image',
    '인스타':'url','인스타그램':'url','소개링크':'url','업체링크':'url','url':'url',
    '예약':'booking','예약링크':'booking','네이버예약':'booking','booking':'booking',
    '시작일':'start','start':'start','종료일':'end','end':'end',
    '순서':'order','order':'order'
  };
  function normalizeRegion(region){
    const a=String(region||'').trim();if(pageRegion.includes(a))return a;
    const map={'서울특별시':'서울','경기도':'경기','인천광역시':'인천','강원도':'강원','강원특별자치도':'강원','충청남도':'충청','충청북도':'충청','대전':'충청','대전광역시':'충청','세종':'충청','세종특별자치시':'충청','전라남도':'전라','전라북도':'전라','전북특별자치도':'전라','광주':'전라','광주광역시':'전라','경상남도':'경상','경상북도':'경상','부산':'경상','부산광역시':'경상','울산':'경상','울산광역시':'경상','대구':'경상','대구광역시':'경상','제주도':'제주','제주특별자치도':'제주'};
    return map[a]||a;
  }
  function bulkImport(contents){
    if(formDirty)throw Error('현재 편집 중인 업체를 먼저 저장한 뒤 일괄 등록해 주세요.');
    const delimiter=contents.includes('\t')?'\t':',';
    const lines=parseDelimited(contents,delimiter);
    if(!lines.length)throw Error('등록할 업체 데이터가 없습니다.');
    const guessed=lines[0].map(x=>headers[x.toLowerCase().replace(/\s+/g,'')]||headers[x.toLowerCase()]);
    const hasHeader=guessed.includes('name')&&guessed.includes('area');
    const fields=hasHeader?guessed:['name','area','district','category','benefit','image','url','booking','title','description'];
    let added=0,updated=0,skipped=0;const errors=[];
    const newRows=cloneRows(rows);
    for(let i=hasHeader?1:0;i<lines.length;i++){
      const line=lines[i],x={};fields.forEach((k,j)=>{if(k)x[k]=(line[j]||'').trim();});
      if(!x.name){skipped++;continue;}
      const area=normalizeRegion(x.area);
      if(!pageRegion.includes(area)){errors.push((i+1)+'행: 알 수 없는 지역 '+(x.area||'(빈칸)'));continue;}
      const existing=newRows.find(r=>escape(r.name)===escape(x.name)&&r.area===area&&escape(r.district)===escape(x.district||''));
      if(existing&&!$('updateDuplicate').checked){skipped++;continue;}
      const candidate=existing?{...existing}:{id:idNew(),name:'',area,category:'맛집·카페',enabled:true,hero:true,directory:true,real:true,order:Math.max(0,...newRows.map(r=>r.order))+1};
      for(const [key,value] of Object.entries(x))if(value!=='' && key!=='id')candidate[key]=value;
      candidate.area=area;
      if(!candidate.title)candidate.title=candidate.name;
      candidate.order=Number(candidate.order);
      try{
        const validated=C.validate([candidate])[0];
        if(existing){const index=newRows.findIndex(r=>r.id===existing.id);newRows[index]=validated;updated++;}else{newRows.push(validated);added++;}
      }catch(e){errors.push((i+1)+'행 ('+x.name+'): '+e.message);}
    }
    if(errors.length){$('bulkText').focus();throw Error('일괄 등록 중 오류로 전체 저장을 중단했습니다. '+errors.slice(0,4).join(' / ')+(errors.length>4?' 외 '+(errors.length-4)+'건':''));}
    rows=newRows;persist();applyAll();
    msg('일괄 처리 완료 · 신규 '+added+'곳, 업데이트 '+updated+'곳, 중복·빈 행 제외 '+skipped+'곳. GitHub 배포 전 ZIP을 다운로드하세요.');
  }
  function template(){
    const sample=[['업체명','지역','시군구','업종','혜택','이미지','소개링크','예약링크','제목','설명'],['예시 카페','제주','제주시 애월','맛집·카페','예약시 할인','','https://www.instagram.com/','https://map.naver.com/','제주 바다가 보이는 카페','산책 후 쉬어가기 좋은 곳']];
    const csv='\uFEFF'+sample.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    download(new Blob([csv],{type:'text/csv;charset=utf-8'}),'random-korea-partner-template.csv');
  }
  function init(){
    if(!C || !Array.isArray(window.RK_PARTNERS)){msg('업체 데이터 또는 공통 JS를 찾을 수 없습니다. 파일을 확인하세요.','error');$('exportButton').disabled=true;return;}
    try{baseline=C.validate(window.RK_PARTNERS);baselineSignature=signature(baseline);serverReady=true;}catch(e){msg('기존 업체 데이터 읽기 실패: '+e.message,'error');$('exportButton').disabled=true;return;}
    rows=cloneRows(baseline);
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
      if(saved?.version===13 && Array.isArray(saved.rows)){
        const mismatch = saved.baselineSignature && saved.baselineSignature!==baselineSignature;
        const restore = !mismatch || confirm('GitHub에 배포된 업체 데이터가 이전에 편집한 때와 달라졌습니다.\n\n확인: 이전 브라우저 임시저장('+saved.rows.length+'곳)을 불러오기\n취소: 현재 GitHub 데이터('+baseline.length+'곳) 사용\n\n최신 데이터가 지워지지 않도록 신중하게 선택하세요.');
        if(restore){
          rows=C.validate(saved.rows);hasChanges=true;
          const last=new Date(saved.updated).toLocaleString('ko-KR');
          msg('이전에 임시저장한 업체 '+rows.length+'곳을 복원했습니다 ('+last+'). 배포 ZIP을 업로드해야 사이트에 반영됩니다.');
          $('draftSource').textContent='임시저장 복원됨';
        }else{
          msg('현재 GitHub 업체 '+baseline.length+'곳을 불러왔습니다. 이전 임시저장은 브라우저에 남아 있습니다.','warn');
          $('draftSource').textContent='배포 데이터 원본';
        }
      }else{msg('현재 사이트에 등록된 업체 '+rows.length+'곳을 불러왔습니다. 업체를 추가하면 자동 임시저장됩니다.');$('draftSource').textContent='배포 데이터 원본';}
    }catch(e){rows=cloneRows(baseline);msg('임시저장 데이터가 손상돼 사이트 원본을 열었습니다. '+e.message,'warn');}
    for(const value of pageRegion){const option=el('option','',value);option.value=value;$('area').append(option);const f=el('option','',value);f.value=value;$('areaFilter').append(f);}
    let unsavedForm=null;
    try{unsavedForm=JSON.parse(sessionStorage.getItem(FORM_STORAGE)||'null');}catch{}
    fillForm(null);applyAll();
    try{
      const draft=unsavedForm;
      if(draft && draft.record && confirm('저장하지 않고 종료했던 업체 입력 내용이 있습니다. 복원할까요?')){
        const existing=draft.id?rows.find(x=>x.id===draft.id):null;
        fillForm(existing||null);if(!existing&&draft.id)currentId=draft.id;
        [...textKeys,...boolKeys].forEach(k=>{if(draft.record[k]===undefined)return;if(boolKeys.includes(k))$(k).checked=!!draft.record[k];else $(k).value=draft.record[k];});formDirty=true;previewImage($('image').value);persistForm();
      }
    }catch{}
  }
  $('editor').addEventListener('submit',e=>{e.preventDefault();try{saveRecord();}catch(err){msg(err.message,'error');}});
  $('editor').addEventListener('input',()=>{formDirty=true;persistForm();});
  $('image').addEventListener('change',()=>{previewImage($('image').value);});
  $('addButton').onclick=()=>{if(canSwitch()){fillForm(null);$('name').focus();if(window.innerWidth<1020)$('editorHeading').scrollIntoView({behavior:'smooth'});}};
  $('duplicateButton').onclick=()=>{if(!canSwitch())return;const x=rows.find(r=>r.id===currentId);if(!x)return;fillForm({...x,id:null,name:x.name+' (복사본)',order:rows.length+1});currentId=null;formDirty=true;persistForm();msg('복제본을 만들었습니다. 이름 등을 확인한 뒤 업체 저장을 누르세요.');};
  $('deleteButton').onclick=()=>{const x=rows.find(r=>r.id===currentId);if(!x)return;if(!confirm('“'+x.name+'” 업체를 삭제할까요? 삭제 후 배포 ZIP을 올리면 사이트에서도 제거됩니다.'))return;rows=rows.filter(r=>r.id!==x.id);persist();fillForm(null);applyAll();msg('삭제 완료 · 배포 전까지 사이트의 기존 업체 데이터는 유지됩니다.','warn');};
  ['search','areaFilter','statusFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',drawList));
  const imageDrop=$('imageDrop');imageDrop.onclick=()=>$('imageFile').click();imageDrop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('imageFile').click();}};
  imageDrop.ondragover=e=>{e.preventDefault();imageDrop.classList.add('drag');};imageDrop.ondragleave=()=>imageDrop.classList.remove('drag');
  imageDrop.ondrop=async e=>{e.preventDefault();imageDrop.classList.remove('drag');try{await selectPhoto(e.dataTransfer.files[0]);}catch(err){msg(err.message,'error');}};
  $('imageFile').onchange=async e=>{try{await selectPhoto(e.target.files[0]);}catch(err){msg(err.message,'error');}e.target.value='';};
  $('exportButton').onclick=async()=>{const b=$('exportButton');b.disabled=true;b.textContent='ZIP 준비 중…';try{await exportPackage();}catch(err){msg('배포 실패: '+err.message,'error');}finally{b.disabled=false;b.textContent='⬇ GitHub 배포 ZIP';}};
  $('backupButton').onclick=$('backupButton2').onclick=()=>{try{backup();}catch(e){msg('백업 실패: '+e.message,'error');}};
  $('loadServerButton').onclick=()=>{if(!confirm('현재 브라우저의 수정 내역을 버리고 마지막 배포본('+baseline.length+'곳)으로 초기화할까요? 백업 JSON을 먼저 내려받는 것을 권장합니다.'))return;rows=cloneRows(baseline);persist();fillForm(null);applyAll();msg('사이트 배포 데이터로 초기화했습니다. 다시 배포하지 않으면 공개 사이트는 변경되지 않습니다.');};
  $('importDataButton').onclick=()=>$('importDataFile').click();
  $('importDataFile').onchange=async(e)=>{const file=e.target.files[0];if(!file)return;try{
    if(file.size>10*1024*1024)throw Error('데이터 파일이 10MB를 초과합니다.');
    const imported=parseRecordFile(await file.text());
    if(!confirm('기존 편집 목록 '+rows.length+'곳을 파일의 '+imported.length+'곳으로 바꿀까요? 작업 내용을 먼저 백업하는 것이 안전합니다.'))return;
    rows=imported;persist();fillForm(null);applyAll();msg('업체 데이터 '+rows.length+'곳을 불러와 임시저장했습니다.');
  }catch(err){msg('파일 불러오기 실패: '+err.message,'error');}finally{e.target.value='';}};
  $('chooseBulkFile').onclick=()=>$('bulkFile').click();
  $('bulkFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('CSV/TSV 파일 크기는 2MB 이하만 가능합니다.');$('bulkText').value=await file.text();msg(file.name+' 파일을 불러왔습니다. 일괄 등록하기를 눌러 저장하세요.');}catch(err){msg(err.message,'error');}finally{e.target.value='';}};
  $('importBulk').onclick=()=>{try{bulkImport($('bulkText').value);}catch(err){msg(err.message,'error');}};
  $('downloadTemplate').onclick=template;
  window.addEventListener('beforeunload',e=>{if(formDirty){e.preventDefault();e.returnValue='';}});
  init();
})();
