/* Plain JavaScript: no server, packages, account, or internet required. */
'use strict';
const app = document.getElementById('app');
const TYPES = {
  Walking: {icon:'♧', detail:'A stroll outside'},
  Running: {icon:'➚', detail:'Time for a run'},
  Hiking: {icon:'△', detail:'Head out on a trail'},
  Commuting: {icon:'▱', detail:'On your way to work or class'}
};
// Deliberately fixed sample weather. This is not a live weather service.
const WEATHER = [
  {hour:6,temp:54,rain:5,wind:6,uv:0,condition:'Clear',icon:'☀'},
  {hour:9,temp:65,rain:10,wind:8,uv:3,condition:'Sunny',icon:'☀'},
  {hour:12,temp:80,rain:10,wind:10,uv:7,condition:'Sunny',icon:'☀'},
  {hour:15,temp:78,rain:65,wind:18,uv:4,condition:'Showers',icon:'☂'},
  {hour:18,temp:67,rain:50,wind:14,uv:1,condition:'Light rain',icon:'☂'},
  {hour:21,temp:58,rain:15,wind:7,uv:0,condition:'Cloudy',icon:'☁'}
];
const today = new Date();
// Format dates in local time rather than shifting them with toISOString().
function localDate(date) {return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
const dateDefault = localDate(today);
const initialPlans = [
  {id:'sample-1',type:'Commuting',date:dateDefault,time:'08:00',minutes:30,location:'Albuquerque, NM'},
  {id:'sample-2',type:'Walking',date:dateDefault,time:'17:00',minutes:45,location:'Albuquerque, NM'}
];
let plans = initialPlans;
// Persistence is optional: continue working if the browser blocks file storage.
try {const saved=JSON.parse(localStorage.getItem('calm-weather-plans-v1')); if(Array.isArray(saved)) plans=saved.filter(validPlan);} catch (_) {}
let draft = null;
let activeId = null;
let storageNote = '';
function validPlan(p){return p && TYPES[p.type] && typeof p.id==='string' && typeof p.location==='string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.time) && Number.isInteger(p.minutes) && p.minutes>0 && p.minutes<=720;}
// Escape user text before inserting it into HTML.
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function persist(){try{localStorage.setItem('calm-weather-plans-v1',JSON.stringify(plans));storageNote='';}catch(_){storageNote='Your plan is available for this session. This browser could not save it for next time.';}}
function announce(message){document.getElementById('announcement').textContent=message;}
function go(screen){if(location.hash===`#${screen}`)render();else location.hash=screen;}
function startPlan(id=null){activeId=id;draft=id?{...plans.find(p=>p.id===id)}:{type:'Walking',date:dateDefault,time:'09:00',minutes:60,location:'Albuquerque, NM'};go('activity');}
function formatTime(time){const [h,m]=time.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;}
function formatDate(date){return new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'});}
function weatherAt(hour){return [...WEATHER].reverse().find(w=>w.hour<=hour)||WEATHER[0];}
// Check every sample interval touched by the activity, including midnight.
function weatherFor(p){const [h,m]=p.time.split(':').map(Number);const begin=h*60+m;const slots=[weatherAt(h)];for(let t=begin+1;t<begin+p.minutes;t++)if(t%180===0)slots.push(weatherAt(Math.floor((t%1440)/60)));return {temp:Math.min(...slots.map(w=>w.temp)),maxTemp:Math.max(...slots.map(w=>w.temp)),rain:Math.max(...slots.map(w=>w.rain)),wind:Math.max(...slots.map(w=>w.wind)),uv:Math.max(...slots.map(w=>w.uv))};}
function tipsFor(p){const w=weatherFor(p),tips=[];if(w.rain>=40)tips.push({title:'Bring a rain layer',text:`Sample rain chance reaches ${w.rain}% during your activity. ${p.type==='Commuting'?'Pack an umbrella and allow 10 extra minutes.':'A light waterproof jacket will help keep you dry.'}`});if(w.temp<60)tips.push({title:'Take a light jacket',text:`It may be as cool as ${w.temp}°F. Wear a layer you can remove as you warm up.`});if(w.uv>=6)tips.push({title:'Plan for strong sun',text:`The sample UV index reaches ${w.uv}. Bring sunscreen, sunglasses, and a hat.`});if(['Running','Hiking'].includes(p.type)||w.maxTemp>=78)tips.push({title:'Bring water',text:`${p.type==='Hiking'?'Pack water for your trail time.':p.type==='Running'?'Have water before and after your run.':'Keep water with you as temperatures rise.'} Sample temperatures reach ${w.maxTemp}°F.`});if(w.wind>=15)tips.push({title:'Expect a breezy stretch',text:`Sample winds reach ${w.wind} mph. ${p.type==='Hiking'?'Choose a sheltered trail if possible.':'A wind-resistant outer layer may feel more comfortable.'}`});if(!tips.length)tips.push({title:'A comfortable window',text:`Sample temperatures are ${w.temp}–${w.maxTemp}°F with a low rain chance. Comfortable shoes and a little water should suit your ${p.type.toLowerCase()}.`});return tips;}
function weatherCard(){return `<section class="card weather-card" aria-label="Sample current weather"><div class="weather-top"><div><p class="eyebrow">Albuquerque, New Mexico</p><h2>Today’s weather</h2></div><span class="weather-symbol" aria-hidden="true">☀</span></div><div><div class="temperature">80°<span style="font-size:1.5rem;letter-spacing:0">F</span></div><p>Sunny, with showers later</p></div><div class="weather-bottom"><div>Rain<strong>10% now</strong></div><div>Wind<strong>10 mph</strong></div><div>UV index<strong>7 · High</strong></div></div></section>`;}
function heading(title,subtitle,action=''){return `<div class="page-title"><div><p class="eyebrow">Your day, with a little foresight</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${action}</div>`;}
function flow(content,step){return `<div class="flow-layout"><aside class="flow-aside"><p class="eyebrow">${activeId?'Edit your plan':'Add an activity'}</p><ol class="step-list">${['Activity','Duration','Location'].map((s,i)=>`<li class="${step===i+1?'current':''}" ${step===i+1?'aria-current="step"':''}><span class="step-number">${i+1}</span>${s}</li>`).join('')}</ol><p class="muted small">A few details help us match the weather to your plans.</p><button class="text-button" data-action="cancel">Cancel</button></aside><section class="card flow-card">${content}</section></div>`;}
function currentPlan(){return plans.find(p=>p.id===activeId)||[...plans].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];}
function render(){
  const screen=location.hash.slice(1)||'home';
  document.querySelectorAll('nav a').forEach(a=>{a.removeAttribute('aria-current');if(a.hash===`#${screen}`)a.setAttribute('aria-current','page');});
  if(['activity','duration','location'].includes(screen)&&!draft){startPlan();return;}
  if(screen==='home'){
    const next=[...plans].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
    app.innerHTML=heading('What’s on your day?','Make a plan. We’ll help you prepare for the weather.')+`<div class="grid">${weatherCard()}<section class="card home-plan"><div><p class="eyebrow">Your plans</p><h2>${next?'A little preparation goes a long way.':'Your day is a blank canvas.'}</h2><p class="muted">Add a walk, run, hike, or commute to get weather recommendations for the time you’ll be outside.</p>${next?`<div class="summary-box"><span class="tag">Next on your timeline</span><h3 style="margin-top:14px">${esc(next.type)} · ${formatTime(next.time)}</h3><p class="small muted">${formatDate(next.date)} · ${next.minutes} min · ${esc(next.location)}</p></div>`:''}</div><div class="actions"><a class="secondary" href="#timeline">View timeline</a><button class="primary" data-action="add">Add activity</button></div></section></div><h2 class="section-label">A glance at the sample day</h2><div class="day-strip">${WEATHER.slice(1,5).map(w=>`<div class="day-chip"><strong>${formatTime(`${w.hour}:00`)}</strong><span aria-hidden="true">${w.icon}</span> ${w.temp}°F <span class="muted small">· ${w.rain}% rain</span></div>`).join('')}</div>`;
  }else if(screen==='timeline'){
    app.innerHTML=heading('Your timeline','A forecast that fits around your plans.',`<button class="primary" data-action="add">+ Add activity</button>`)+(plans.length?`<ul class="activity-list">${[...plans].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(p=>`<li class="activity-row"><div class="time-label">${formatTime(p.time)}<p class="small muted">${formatDate(p.date)}</p></div><span class="activity-icon" aria-hidden="true">${TYPES[p.type].icon}</span><div><h2>${esc(p.type)}</h2><p class="muted small">${p.minutes} min · ${esc(p.location)}</p><p class="small" style="margin-top:7px">${esc(tipsFor(p)[0].title)}</p></div><div class="row-actions"><button class="secondary" data-action="recommend" data-id="${esc(p.id)}">Recommendations</button><details><summary aria-label="Options for ${esc(p.type)}">⋯</summary><div class="menu"><button data-action="edit" data-id="${esc(p.id)}">Edit activity</button><button class="danger" data-action="delete" data-id="${esc(p.id)}">Delete activity</button></div></details></div></li>`).join('')}</ul>`:`<div class="empty"><h2>No activities yet</h2><p class="muted">Add your first activity to start planning your day.</p><button class="primary" data-action="add">Add activity</button></div>`)+`<div class="actions"><a class="secondary" href="#forecast">Detailed forecast</a></div><p class="notice">${storageNote}</p>`;
  }else if(screen==='activity'){
    app.innerHTML=flow(`<p class="eyebrow">Step 1 of 3</p><h1>Pick your activity</h1><p class="muted">What are you planning to do?</p><form id="activity-form"><div class="activity-options">${Object.entries(TYPES).map(([name,t])=>`<label class="option"><span class="activity-icon" aria-hidden="true">${t.icon}</span><span><strong>${name}</strong><span class="small muted">${t.detail}</span></span><input type="radio" name="activity" value="${name}" ${draft.type===name?'checked':''} required></label>`).join('')}</div><div class="actions"><button class="primary" type="submit">Continue</button></div></form>`,1);
  }else if(screen==='duration'){
    app.innerHTML=flow(`<p class="eyebrow">Step 2 of 3 · ${esc(draft.type)}</p><h1>Select duration</h1><p class="muted">When will you head out, and for how long?</p><form id="duration-form"><label class="field">Date<input name="date" type="date" value="${esc(draft.date)}" required></label><div class="two-fields"><label class="field">Start time<input name="time" type="time" value="${esc(draft.time)}" required></label><label class="field">Duration (minutes)<input name="minutes" type="number" min="1" max="720" step="1" value="${draft.minutes}" required></label></div><p class="notice">The same sample forecast is used for every date.</p><p class="error" id="error" role="alert"></p><div class="actions"><button type="button" class="secondary" data-action="back-activity">Back</button><button class="primary" type="submit">Confirm duration</button></div></form>`,2);
  }else if(screen==='location'){
    app.innerHTML=flow(`<p class="eyebrow">Step 3 of 3</p><h1>Verify location</h1><p class="muted">Where will this activity take place?</p><form id="location-form"><label class="field">Activity location<input name="location" maxlength="100" value="${esc(draft.location)}" placeholder="City, neighborhood, or trail" required></label><div class="map"><svg viewBox="0 0 600 220" role="img" aria-label="Illustrative map with a location marker; not a live map"><rect width="600" height="220" fill="#e7eef0"/><path d="M430 0L440 60L390 110L405 170L365 220" stroke="#bbd8c3" stroke-width="100" fill="none"/><g stroke="#fff" stroke-width="12" fill="none"><path d="M0 40L600 80M0 180L600 145M80 0L150 220M275 0L285 220M510 0L490 220"/></g><g stroke="#cad7dc" stroke-width="2" fill="none"><path d="M0 40L600 80M0 180L600 145M80 0L150 220M275 0L285 220M510 0L490 220"/></g><circle cx="290" cy="108" r="29" fill="#185462" opacity=".12"/><path d="M290 128Q263 104 274 89Q290 71 306 89Q317 104 290 128Z" fill="#185462"/><circle cx="290" cy="96" r="6" fill="white"/></svg><span class="map-label">Illustrative map · Sample location</span></div><p class="location-note">Your location labels the activity. Weather recommendations use the Albuquerque sample forecast.</p><p class="error" id="error" role="alert"></p><div class="actions"><button type="button" class="secondary" data-action="back-duration">Back</button><button class="primary" type="submit">${activeId?'Save changes':'Confirm location'}</button></div></form>`,3);
  }else if(screen==='recommendations'){
    const p=currentPlan();
    if(!p){go('timeline');return;}
    app.innerHTML=heading('A little heads-up',`Weather recommendations for your ${esc(p.type.toLowerCase())}.`)+`<div class="grid"><section><div class="summary-box"><h2>${esc(p.type)}</h2><p>${formatDate(p.date)} · ${formatTime(p.time)} · ${p.minutes} min</p><p class="muted small">${esc(p.location)}</p></div><div class="recommendations">${tipsFor(p).map((t,i)=>`<article class="recommendation"><span class="number">0${i+1}</span><div><h3>${t.title}</h3><p>${t.text}</p></div></article>`).join('')}</div><div class="actions"><a class="primary" href="#timeline">View timeline</a><a class="secondary" href="#forecast">Detailed forecast</a></div></section>${weatherCard()}</div><p class="notice">Based on sample weather for your selected time. Not a live forecast.</p>`;
  }else if(screen==='forecast'){
    app.innerHTML=heading('Detailed forecast','Albuquerque, NM · Sample weather for a single day',`<a class="secondary" href="#timeline">View timeline</a>`)+`<div class="forecast-grid">${weatherCard()}<div class="metrics"><div class="metric"><span class="muted">Feels like</span><strong>79°F</strong><span class="small muted">At noon</span></div><div class="metric"><span class="muted">Rain chance</span><strong>65%</strong><span class="small muted">Afternoon peak</span></div><div class="metric"><span class="muted">Wind</span><strong>18 mph</strong><span class="small muted">Afternoon peak</span></div><div class="metric"><span class="muted">UV index</span><strong>7</strong><span class="small muted">High at noon</span></div></div></div><h2 class="section-label">Throughout the day</h2><div class="table-wrap"><table><caption class="sr-only">Sample weather at three-hour intervals</caption><thead><tr><th scope="col">Time</th><th scope="col">Conditions</th><th scope="col">Temperature</th><th scope="col">Rain chance</th><th scope="col">Wind</th><th scope="col">UV</th></tr></thead><tbody>${WEATHER.map(w=>`<tr><th scope="row">${formatTime(`${w.hour}:00`)}</th><td>${w.icon} ${w.condition}</td><td>${w.temp}°F</td><td>${w.rain}%</td><td>${w.wind} mph</td><td>${w.uv}</td></tr>`).join('')}</tbody></table></div><p class="notice">Sample data for prototype testing. All dates and activity locations use this forecast.</p>`;
  }else{go('home');return;}
  app.focus({preventScroll:true});window.scrollTo(0,0);
}
// One event handler for the buttons in every screen.
app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button)return;
  const {action,id}=button.dataset;
  if(action==='add')startPlan();
  if(action==='edit')startPlan(id);
  if(action==='recommend'){activeId=id;go('recommendations');}
  if(action==='cancel'){draft=null;activeId=null;go('timeline');}
  if(action==='back-activity')go('activity');
  if(action==='back-duration'){draft.location=app.querySelector('[name="location"]').value;go('duration');}
  if(action==='delete'){
    const p=plans.find(p=>p.id===id);
    if(confirm(`Delete this ${p.type.toLowerCase()} from your timeline?`)){plans=plans.filter(p=>p.id!==id);persist();announce('Activity deleted.');render();}
  }
});
app.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target;const data=new FormData(form);
  if(form.id==='activity-form'){draft.type=data.get('activity');go('duration');}
  if(form.id==='duration-form'){
    const minutes=Number(data.get('minutes'));
    if(!Number.isInteger(minutes)||minutes<1||minutes>720){document.getElementById('error').textContent='Choose a duration from 1 to 720 minutes.';return;}
    Object.assign(draft,{date:data.get('date'),time:data.get('time'),minutes});go('location');
  }
  if(form.id==='location-form'){
    const locationName=data.get('location').trim();
    if(!locationName){document.getElementById('error').textContent='Enter a location before confirming.';return;}
    draft.location=locationName;
    if(activeId){plans=plans.map(p=>p.id===activeId?{...draft,id:activeId}:p);}else{activeId=`plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;plans.push({...draft,id:activeId});}
    persist();draft=null;announce('Activity saved. Recommendations are ready.');go('recommendations');
  }
});
window.addEventListener('hashchange',render);
render();
