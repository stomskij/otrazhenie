const topbar=document.querySelector('.top');const syncTopbar=()=>topbar.classList.toggle('scrolled',scrollY>80);window.addEventListener('scroll',syncTopbar,{passive:true});syncTopbar();

const calendarGrid=document.getElementById('calendarGrid');
const startDateText=document.getElementById('startDateText');
const endDateText=document.getElementById('endDateText');
const nightsText=document.getElementById('nightsText');
const knownTotal=document.getElementById('knownTotal');
const vkTotal=document.getElementById('vkTotal');
const stayTotal=document.getElementById('stayTotal');
const guestTotal=document.getElementById('guestTotal');
const calcNote=document.getElementById('calcNote');
let startDate=null,endDate=null;
let overnightGuests=2,dayGuests=0,saunaHours=0;
const AUG_YEAR=2026,AUG_MONTH=7;
const busyDays=new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18,19,20,22,31]);
const priceForDay=day=>[5,6].includes(new Date(AUG_YEAR,AUG_MONTH,day).getDay())?13000:10000;
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const dateText=d=>d?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(d):'не выбран';
const sameDay=(a,b)=>a&&b&&a.toDateString()===b.toDateString();
const isAugust=d=>d&&d.getFullYear()===AUG_YEAR&&d.getMonth()===AUG_MONTH;
const isBusy=d=>isAugust(d)&&busyDays.has(d.getDate());

function selectionCrossesBusy(a,b){
  if(!a||!b)return false;
  const cur=new Date(a);cur.setDate(cur.getDate()+1);
  while(cur<b){if(isBusy(cur))return true;cur.setDate(cur.getDate()+1)}
  return false;
}
function drawMonth(){
  calendarGrid.innerHTML='';
  const first=new Date(AUG_YEAR,AUG_MONTH,1);const offset=(first.getDay()+6)%7;const days=31;
  for(let i=0;i<offset;i++){const spacer=document.createElement('span');spacer.className='calendar-spacer';calendarGrid.appendChild(spacer)}
  for(let day=1;day<=days;day++){
    const d=new Date(AUG_YEAR,AUG_MONTH,day);const btn=document.createElement('button');btn.type='button';btn.className='priced-day';
    const busy=isBusy(d);if(busy){btn.classList.add('busy');btn.disabled=true}
    if(sameDay(d,startDate)||sameDay(d,endDate))btn.classList.add('selected');
    if(startDate&&endDate&&d>startDate&&d<endDate)btn.classList.add('in-range');
    btn.innerHTML=`<span class="day-number">${day}</span><small>${money(priceForDay(day)).replace(' ₽','')}</small>${busy?'<i class="busy-dot"></i>':''}`;
    btn.addEventListener('click',()=>selectDate(d));calendarGrid.appendChild(btn);
  }
}
function selectDate(d){
  d=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  if(isBusy(d))return;
  if(!startDate||endDate||d<startDate){startDate=d;endDate=null}
  else if(d.getTime()===startDate.getTime()){endDate=null}
  else if(selectionCrossesBusy(startDate,d)){
    startDate=d;endDate=null;calcNote.textContent='Между выбранными датами есть занятые дни. Выберите другой период.';
  } else {endDate=d}
  updateSummary();drawMonth();
}
function baseStayCost(){
  if(!startDate||!endDate)return 0;
  let total=0;const cur=new Date(startDate);
  while(cur<endDate){total+=priceForDay(cur.getDate());cur.setDate(cur.getDate()+1)}
  return total;
}
function updateSummary(){
  startDateText.textContent=dateText(startDate);endDateText.textContent=dateText(endDate);
  let nights=0;if(startDate&&endDate)nights=Math.max(1,Math.round((endDate-startDate)/86400000));nightsText.textContent=nights;
  const stay=baseStayCost();
  const extraOvernight=Math.max(0,overnightGuests-2)*1000*nights;
  const dayExtra=dayGuests*500;
  const guests=extraOvernight+dayExtra;
  const services=(document.getElementById('hotTub').checked?4500:0)+saunaHours*2000;
  const total=stay+guests+services;
  stayTotal.textContent=nights?money(stay):'—';guestTotal.textContent=money(guests);
  knownTotal.textContent=nights?money(total):'—';vkTotal.textContent=nights?money(Math.max(0,total-1000)):'—';
  if(nights){calcNote.textContent=`${nights} ${nights===1?'ночь':nights<5?'ночи':'ночей'} · базовая цена рассчитана по датам в календаре.`}
  else if(!calcNote.textContent.includes('занятые'))calcNote.textContent='Выберите свободные даты заезда и выезда.';
}
function syncCounters(){document.getElementById('overnightGuests').textContent=overnightGuests;document.getElementById('dayGuests').textContent=dayGuests;document.getElementById('saunaHours').textContent=saunaHours;updateSummary()}
document.querySelectorAll('[data-step]').forEach(btn=>btn.addEventListener('click',()=>{const dir=Number(btn.dataset.dir),type=btn.dataset.step;if(type==='overnight')overnightGuests=Math.min(6,Math.max(1,overnightGuests+dir));if(type==='day')dayGuests=Math.min(10,Math.max(0,dayGuests+dir));if(type==='sauna'){if(dir>0)saunaHours=saunaHours===0?2:Math.min(8,saunaHours+1);else saunaHours=saunaHours<=2?0:saunaHours-1}syncCounters();}));
document.getElementById('hotTub').addEventListener('change',updateSummary);
drawMonth();updateSummary();
