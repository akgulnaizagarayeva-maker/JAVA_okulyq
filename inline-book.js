import {sections} from './book-sections.js?v=20261015-test-v8';
import {topics} from './quiz-data.js?v=20261015-test-v8';
import {labVideos} from './lab-videos.js?v=20261015-test-v8';
const $=id=>document.getElementById(id);
let topicIndex=0, questionIndex=0, answers=topics.map(t=>t.questions.map(()=>null));
function show(title){
 $('inlineBook').hidden=false;document.body.classList.add('inline-reading');
 $('chapterLabel').textContent=title;$('inlineBook').scrollTop=0;
}
export function closeSection(){
 if(!$('inlineBook'))return;
 $('inlineBook').hidden=true;document.body.classList.remove('inline-reading');$('inlineContent').querySelectorAll('iframe').forEach(frame=>frame.remove());
}
export function openSection(key,probe=false){
 if(!sections[key])return false;if(probe)return true;
 const [title,html]=sections[key];show(title);$('inlineContent').innerHTML='<h1></h1>'+html;
 $('inlineContent').querySelector('h1').textContent=title;return true;
}
function el(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function quiz(){
 const out=$('inlineContent');out.replaceChildren();
 out.append(el('h1','Өзін-өзі тексеру тесттері'),el('p','15 тақырып · 75 сұрақ · әр тақырыпта 5 сұрақ','quiz-subtitle'));
 const label=el('label','Тақырып');label.htmlFor='quizTopic';out.append(label);
 const select=el('select');select.id='quizTopic';topics.forEach((t,i)=>{const o=el('option',`${i+1}. ${t.title}`);o.value=i;select.append(o)});
 select.value=topicIndex;select.onchange=()=>{topicIndex=Number(select.value);questionIndex=0;quiz()};out.append(select);
 const t=topics[topicIndex],q=t.questions[questionIndex],answer=answers[topicIndex][questionIndex];
 const correct=t.questions.filter((v,i)=>answers[topicIndex][i]===v.answer).length;
 const attempted=answers.flat().filter(v=>v!==null).length;
 const allCorrect=topics.reduce((s,v,i)=>s+v.questions.filter((w,j)=>answers[i][j]===w.answer).length,0);
 out.append(el('p',`Сұрақ ${questionIndex+1} / ${t.questions.length} · Дұрыс жауаптар: ${correct} · Жалпы: ${allCorrect} / 75 (${attempted} жауап берілді)`,'quiz-progress'));
 const progress=el('progress');progress.max=75;progress.value=attempted;progress.setAttribute('aria-label','Орындалған сұрақтар');out.append(progress);
 const group=el('fieldset');group.append(el('legend',q.question));
 q.options.forEach((option,i)=>{
  const l=el('label',null,'quiz-option');const radio=el('input');radio.type='radio';radio.name='answer';radio.value=i;radio.disabled=answer!==null;
  if(answer===i)radio.checked=true;
  l.append(radio,el('span',option));
  if(answer!==null&&i===q.answer)l.classList.add('correct');
  if(answer!==null&&answer===i&&answer!==q.answer)l.classList.add('incorrect');group.append(l);
 });out.append(group);
 const feedback=el('p',null,'quiz-feedback');feedback.setAttribute('role','status');out.append(feedback);
 if(answer!==null)feedback.textContent=(answer===q.answer?'Дұрыс! ':'Қате. Дұрыс жауап: '+q.options[q.answer]+'. ')+(q.explanation||'');
 const actions=el('div',null,'quiz-actions');
 const check=el('button','Жауапты тексеру','primary');check.disabled=answer!==null;check.onclick=()=>{
  const selected=out.querySelector('input[name="answer"]:checked');
  if(!selected){feedback.textContent='Алдымен бір жауапты таңдаңыз.';return;}
  answers[topicIndex][questionIndex]=Number(selected.value);quiz();
 };actions.append(check);
 const prev=el('button','← Алдыңғы');prev.disabled=questionIndex===0;prev.onclick=()=>{questionIndex--;quiz()};actions.append(prev);
 const next=el('button',questionIndex===4?'Келесі тақырып →':'Келесі сұрақ →');next.disabled=answer===null||(topicIndex===14&&questionIndex===4);next.onclick=()=>{
  if(questionIndex<4)questionIndex++;else{topicIndex++;questionIndex=0;}quiz();
 };actions.append(next);out.append(actions);
 if(attempted===75)out.append(el('p',`Тест аяқталды. Нәтиже: ${allCorrect} / 75 (${Math.round(allCorrect/75*100)}%).`,'quiz-result'));
 const reset=el('button','Осы тақырыпты қайта бастау');reset.className='quiz-reset';reset.onclick=()=>{answers[topicIndex]=t.questions.map(()=>null);questionIndex=0;quiz()};out.append(reset);
}
export function openQuiz(){show('Өзін-өзі тексеру тесттері');quiz();}
$('backToBook').onclick=()=>{closeSection();window.dispatchEvent(new Event('resize'))};
if(new URLSearchParams(location.search).get('section')==='assessment'){
 document.addEventListener('book-ready',openQuiz,{once:true});
}

export function openVideo(id){
 const video=Object.values(labVideos).flatMap(item=>item.videos).find(item=>item.id===id);if(!video)return false;
 show(video.title);const out=$('inlineContent');out.replaceChildren();out.append(el('p','ҚАЗАҚША БЕЙНЕСАБАҚ','video-eyebrow'),el('h1',video.title),el('p',video.author,'quiz-subtitle'));
 const box=el('div',null,'video-player'),frame=el('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0`;
 frame.title=video.title;frame.allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';box.append(frame);out.append(box);
 const note=el('p','Бейнесабақтағы мысалдарды өз жобаңызда қайталап, бағдарламаның орындалу нәтижесін тексеріңіз.');out.append(note);
 const fallback=el('a','YouTube-та ашу →','video-fallback');fallback.href=video.url;fallback.target='_blank';fallback.rel='noopener noreferrer';out.append(fallback);return true;
}
