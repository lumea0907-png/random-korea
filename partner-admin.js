(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const C = RKPartner;
  const keys = [
    'name', 'area', 'district', 'category', 'title', 'benefit', 'image',
    'url', 'booking', 'description', 'start', 'end', 'order'
  ];
  const bools = ['enabled', 'hero', 'directory', 'real'];
  const imageFolder = './images/partners/';
  let rows = [];
  let editing = null;
  let dirty = false;
  let formDirty = false;
  let page = 1;
  let selectedImageUrl = '';
  let selectedImagePath = '';

  const message = text => { $('message').textContent = text; };

  try {
    rows = C.validate(window.RK_PARTNERS);
    message('현재 데이터 ' + rows.length + '개를 불러왔습니다.');
  } catch (error) {
    message('데이터를 읽지 못했습니다. 최신 파일을 불러오세요. ' + error.message);
    $('export').disabled = true;
  }

  function node(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  }

  function releaseSelectedImage() {
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    selectedImageUrl = '';
    selectedImagePath = '';
    const previewImage = $('imagePreview');
    if (previewImage) previewImage.remove();
    const dropZone = $('imageDropZone');
    if (dropZone) {
      dropZone.classList.remove('has-file');
      const strong = dropZone.querySelector('strong');
      const span = dropZone.querySelector('span');
      if (strong) strong.textContent = '사진을 여기에 끌어놓으세요';
      if (span) span.textContent = '또는 아래 버튼으로 파일 선택 · JPG, PNG, WebP · 5MB 이하';
    }
  }

  function addImageDropZone() {
    const imageField = $('image');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.hidden = true;
    input.id = 'imageFile';

    const zone = document.createElement('div');
    zone.id = 'imageDropZone';
    zone.className = 'image-drop-zone';
    zone.tabIndex = 0;
    zone.setAttribute('role', 'button');
    zone.setAttribute('aria-label', '사진 파일 끌어놓기 또는 선택');

    const text = document.createElement('div');
    text.className = 'image-drop-copy';
    text.innerHTML = '<strong>사진을 여기에 끌어놓으세요</strong><span>또는 아래 버튼으로 파일 선택 · JPG, PNG, WebP · 5MB 이하</span><small>사진 파일도 GitHub 저장소의 images/partners 폴더에 함께 올려야 표시됩니다.</small>';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-pick-button';
    button.textContent = '사진 파일 선택';
    button.addEventListener('click', event => {
      event.stopPropagation();
      input.click();
    });

    zone.append(text, button);
    imageField.insertAdjacentElement('afterend', input);
    input.insertAdjacentElement('afterend', zone);

    const style = document.createElement('style');
    style.textContent = `
      .image-drop-zone{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:9px;padding:16px;border:1px dashed #cbb69e;border-radius:12px;background:#fffaf4;color:#4b392b;transition:background .15s,border-color .15s}
      .image-drop-zone.dragging,.image-drop-zone:hover{border-color:#9b7048;background:#f8efe5}
      .image-drop-zone.has-file{border-style:solid}
      .image-drop-copy{display:grid;gap:5px;font-size:13px}
      .image-drop-copy strong{font-size:14px}
      .image-drop-copy span,.image-drop-copy small{color:#806e5d;line-height:1.5}
      .image-pick-button{flex:none;padding:9px 12px;border:1px solid #d8c7b5;border-radius:8px;background:#fff;color:#4b392b;cursor:pointer}
      #imagePreview{display:block;width:100%;max-width:320px;max-height:200px;object-fit:cover;margin-top:10px;border-radius:10px}
      @media(max-width:600px){.image-drop-zone{align-items:flex-start;flex-direction:column}}
    `;
    document.head.append(style);

    function useFile(file) {
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        message('JPG, PNG 또는 WebP 사진 파일을 선택하세요.');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message('사진 파일은 5MB 이하로 선택하세요.');
        input.value = '';
        return;
      }

      const originalName = file.name.split(/[\\/]/).pop();
      const extension = originalName.includes('.')
        ? originalName.split('.').pop().toLowerCase()
        : (file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg');
      const baseName = originalName.replace(/\.[^.]+$/, '')
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'photo';
      const uniqueName = Date.now() + '-' + baseName + '.' + extension;

      releaseSelectedImage();
      selectedImagePath = imageFolder + uniqueName;
      selectedImageUrl = URL.createObjectURL(file);
      $('image').value = selectedImagePath;
      formDirty = true;
      zone.classList.add('has-file');
      text.querySelector('strong').textContent = originalName + ' 선택됨';
      text.querySelector('span').textContent = '경로: ' + selectedImagePath;
      const image = document.createElement('img');
      image.id = 'imagePreview';
      image.src = selectedImageUrl;
      image.alt = '선택한 사진 미리보기';
      zone.insertAdjacentElement('afterend', image);
      preview();
      message('사진을 선택했습니다. 사진 파일을 GitHub의 images/partners 폴더에도 올려주세요.');
      input.value = '';
    }

    input.addEventListener('change', () => useFile(input.files[0]));
    zone.addEventListener('click', event => {
      if (event.target !== button) input.click();
    });
    zone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
    zone.addEventListener('dragover', event => {
      event.preventDefault();
      zone.classList.add('dragging');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', event => {
      event.preventDefault();
      zone.classList.remove('dragging');
      useFile(event.dataTransfer.files[0]);
    });
  }

  function read() {
    const record = { id: editing || 'partner-' + crypto.randomUUID() };
    keys.forEach(key => { record[key] = $(key).value; });
    bools.forEach(key => { record[key] = $(key).checked; });
    return record;
  }

  function preview() {
    const record = read();
    const box = $('preview');
    box.replaceChildren();
    const imageSource = selectedImageUrl || C.url(record.image);
    if (imageSource) {
      const image = document.createElement('img');
      image.src = imageSource;
      image.alt = '';
      image.onerror = () => image.remove();
      box.append(image);
    }
    box.append(
      node('small', (record.real ? '광고' : '광고 예시') + ' · ' + record.area + ' ' + record.district),
      node('h2', record.title || record.name || '업체의 첫인상을 담아보세요'),
      node('p', record.benefit || '예약 및 매장 소식 확인하기')
    );
  }

  function fill(record) {
    releaseSelectedImage();
    editing = record?.id || null;
    keys.forEach(key => {
      $(key).value = record?.[key] ?? (key === 'order' ? rows.length + 1 : key === 'area' ? '서울' : key === 'category' ? '맛집·카페' : '');
    });
    bools.forEach(key => { $(key).checked = record ? record[key] : true; });
    $('formTitle').textContent = record ? '업체 수정 · ' + record.name : '새 업체 등록';
    const zone = $('imageDropZone');
    if (zone) {
      zone.querySelector('strong').textContent = '사진을 여기에 끌어놓으세요';
      zone.querySelector('span').textContent = '또는 아래 버튼으로 파일 선택 · JPG, PNG, WebP · 5MB 이하';
    }
    formDirty = false;
    preview();
  }

  function canLeave() {
    return !formDirty || confirm('아직 작업 목록에 저장하지 않은 입력을 버릴까요?');
  }

  function draw() {
    const query = $('search').value.trim().toLowerCase();
    const filter = $('filter').value;
    const matches = rows
      .filter(record => (record.name + ' ' + record.area + ' ' + record.district).toLowerCase().includes(query)
        && (filter === 'all' || (filter === 'active' ? C.active(record) : !C.active(record))))
      .sort((a, b) => a.order - b.order);
    page = Math.min(page, Math.max(1, Math.ceil(matches.length / 15)));
    $('count').textContent = rows.length + '곳';
    $('list').replaceChildren();

    for (const record of matches.slice((page - 1) * 15, page * 15)) {
      const item = node('div', '');
      item.className = 'item';
      const text = node('div', '');
      text.append(
        node('b', record.name),
        node('small', record.area + ' ' + record.district + ' · '
          + (C.active(record) ? '노출 중' : !record.enabled ? '숨김' : record.start > C.today() ? '노출 예약' : '기간 종료')
          + (record.real ? '' : ' · 예시'))
      );
      const button = node('button', '수정');
      button.onclick = () => {
        if (canLeave()) {
          fill(record);
          $('formTitle').scrollIntoView({ block: 'nearest' });
          $('name').focus();
        }
      };
      item.append(text, button);
      $('list').append(item);
    }
    if (!matches.length) $('list').append(node('p', '조건에 맞는 업체가 없습니다.'));
    $('page').textContent = page + ' / ' + Math.max(1, Math.ceil(matches.length / 15));
    $('prev').disabled = page === 1;
    $('next').disabled = page * 15 >= matches.length;
  }

  $('editor').addEventListener('input', () => {
    formDirty = true;
    preview();
  });
  $('image').addEventListener('input', () => {
    if (selectedImageUrl && $('image').value !== selectedImagePath) releaseSelectedImage();
  });
  $('editor').onsubmit = event => {
    event.preventDefault();
    try {
      const record = C.validate([read()])[0];
      const index = rows.findIndex(item => item.id === record.id);
      if (index < 0) rows.push(record);
      else rows[index] = record;
      dirty = true;
      $('export').disabled = false;
      editing = record.id;
      $('formTitle').textContent = '업체 수정 · ' + record.name;
      formDirty = false;
      preview();
      draw();
      const hasLocalImage = record.image.startsWith(imageFolder);
      message(record.name + ' 작업 목록에 저장됨 · '
        + (hasLocalImage ? '사진 파일도 GitHub의 images/partners 폴더에 올린 뒤 ' : '')
        + '배포 파일을 내려받아야 사이트에 반영됩니다.');
    } catch (error) {
      message(error.message);
    }
  };

  $('new').onclick = $('cancel').onclick = () => {
    if (canLeave()) fill(null);
  };
  $('search').oninput = $('filter').onchange = () => { page = 1; draw(); };
  $('prev').onclick = () => { page--; draw(); };
  $('next').onclick = () => { page++; draw(); };

  $('export').onclick = () => {
    if (formDirty) {
      message('입력 중인 업체를 먼저 작업 목록에 저장하세요.');
      return;
    }
    try {
      const data = C.validate(rows);
      const blob = new Blob(['window.RK_PARTNERS = ' + JSON.stringify(data, null, 2) + ';\n'], {
        type: 'text/javascript;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'partners-data.js';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dirty = false;
      message('partners-data.js를 내려받습니다. 선택한 사진 파일도 GitHub의 images/partners 폴더에 함께 올려주세요.');
    } catch (error) {
      message(error.message);
    }
  };

  $('import').onclick = () => {
    if ((!dirty && !formDirty) || confirm('현재 작업을 파일 내용으로 바꿀까요? 내려받지 않은 변경은 사라집니다.')) $('file').click();
  };
  $('file').onchange = async () => {
    const file = $('file').files[0];
    if (!file) return;
    try {
      if (file.size > 10000000) throw Error('파일은 10MB 이하만 가능합니다.');
      let text = (await file.text()).trim();
      if (text.startsWith('window.RK_PARTNERS = ')) text = text.slice('window.RK_PARTNERS = '.length).replace(/;\s*$/, '');
      rows = C.validate(JSON.parse(text));
      dirty = false;
      page = 1;
      fill(null);
      draw();
      $('export').disabled = false;
      message(rows.length + '개 업체를 불러왔습니다.');
    } catch (error) {
      message('불러오기 실패: ' + error.message);
    } finally {
      $('file').value = '';
    }
  };

  addImageDropZone();
  window.addEventListener('beforeunload', event => {
    if (dirty || formDirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  fill(null);
  draw();
})();
