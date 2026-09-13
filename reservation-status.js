import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getDatabase, ref, push, set } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);
const form = document.querySelector('#reservation-form');
const status = document.querySelector('#form-result');
const button = form.querySelector('[type="submit"]');
button.insertAdjacentElement('afterend', status);
status.classList.add('submit-status');
status.textContent = '입력 후 예약 신청하기를 눌러주세요.';
const confirmation = document.createElement('section');
confirmation.className = 'reservation-confirmation';
confirmation.hidden = true;
status.insertAdjacentElement('afterend', confirmation);

function report(text, error = false) {
  status.textContent = text;
  status.className = `form-result submit-status ${error ? 'error' : 'success'}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const data = Object.fromEntries(new FormData(form));
  status.className = 'form-result submit-status';
  status.textContent = '예약 정보를 Firebase 실시간 데이터베이스에 저장하는 중입니다...';
  confirmation.hidden = true;
  const item = push(ref(db, 'reservation'));
  try {
    await set(item, {
      idx: item.key,
      r_name: data.r_name.trim(),
      r_date: data.r_date,
      rs_date: new Date().toISOString(),
      r_number: Number(data.r_number),
      r_tel: data.r_tel.trim(),
      r_status: 'r',
      r_content: data.r_content.trim()
    });
    form.reset();
    form.r_number.value = 1;
    report('예약이 정상적으로 접수되었습니다. 매장에서 확인 후 연락드리겠습니다.');
    confirmation.innerHTML = `<h3>예약 신청 내역</h3><dl><div><dt>예약자 성명</dt><dd>${data.r_name.trim()}</dd></div><div><dt>예약일자 · 시간</dt><dd>${data.r_date.replace('T', ' ')}</dd></div><div><dt>방문인원수</dt><dd>${data.r_number}명</dd></div><div><dt>연락처</dt><dd>${data.r_tel.trim()}</dd></div><div><dt>기타 참고사항</dt><dd>${data.r_content.trim() || '-'}</dd></div></dl>`;
    confirmation.hidden = false;
    window.alert('예약이 정상적으로 접수되었습니다.\n예약 내역은 예약 신청 버튼 아래에서 확인할 수 있습니다.');
  } catch (error) {
    console.error('예약 저장 실패:', error);
    report(`예약 저장 실패 [${error.code || '오류코드 없음'}]: ${error.message}`, true);
  }
}, true);
