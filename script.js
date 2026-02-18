let display = document.getElementById("display");
let keypad = document.getElementById("keypad");
let battery = document.getElementById("battery");

let state="home";
let currentContact=null;
let currentInput="";
let batteryLevel=100;

let contacts=[
 {name:"Message to self",id:"self",color:"#33ff66"},
 {name:"Getou Suguru",id:"getou",color:"#66ccff"},
 {name:"Misamichi Yaga",id:"yaga",color:"#ffcc66"}
];

let messages=JSON.parse(localStorage.getItem("keitaiMessages"));
if(!messages){
 messages={
  self:["Note: Buy charms.","Test message."],
  getou:["Are you free later?"],
  yaga:["Meeting at 10."]
 };
 localStorage.setItem("keitaiMessages",JSON.stringify(messages));
}

let snakeHigh=localStorage.getItem("snakeHigh")||0;

let t9={
 "2":"ABC","3":"DEF","4":"GHI",
 "5":"JKL","6":"MNO","7":"PQRS",
 "8":"TUV","9":"WXYZ","0":" "
};

let lastKey=null;
let tapIndex=0;
let tapTimer=null;

/* INIT */
createKeys();
home();
startClock();

/* CLOCK */

function startClock(){
 setInterval(()=>{
  let now=new Date();
  let time=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  let date=now.toLocaleDateString();
  battery.innerText=time+" "+date+" | "+batteryLevel+"%";
 },1000);
}

/* SYSTEM */

function drain(){
 batteryLevel--;
 if(batteryLevel<0) batteryLevel=0;
}

function home(){
 state="home";
 display.innerHTML=
 `1: Messages<br>
 2: Files<br>
 3: Snake<br>
 <br>High Score: ${snakeHigh}`;
}

function createKeys(){
 let keys=["1","2","3","4","5","6","7","8","9","*","0","#"];
 keys.forEach(k=>{
  let b=document.createElement("button");
  b.innerText=k;
  b.onclick=()=>handleKey(k);
  keypad.appendChild(b);
 });
}

function handleKey(k){
 drain();

 if(state==="home"){
  if(k==="1") openContacts();
  if(k==="2") openFiles();
  if(k==="3") startSnake();
  return;
 }

 if(state==="contacts"){
  let i=parseInt(k)-1;
  if(contacts[i]) openChat(contacts[i]);
 }

 if(state==="chat") handleT9(k);
}

/* CONTACTS */

function openContacts(){
 state="contacts";
 display.innerHTML="";
 contacts.forEach((c,i)=>{
  display.innerHTML+=
   `<div class="list-item">
      <div class="icon" style="background:${c.color}"></div>
      ${i+1}: ${c.name}
    </div>`;
 });
}

/* CHAT */

function openChat(contact){
 state="chat";
 currentContact=contact.id;
 currentInput="";
 renderChat();
}

function renderChat(){
 display.innerHTML="";
 let chat=messages[currentContact]||[];
 chat.forEach(m=>{
  display.innerHTML+="> "+m+"<br>";
 });
 display.innerHTML+="_ "+currentInput;
}

function handleT9(k){
 if(!t9[k]) return;

 if(lastKey===k){
  tapIndex=(tapIndex+1)%t9[k].length;
  currentInput=currentInput.slice(0,-1);
 }else{
  tapIndex=0;
 }

 lastKey=k;
 currentInput+=t9[k][tapIndex];

 clearTimeout(tapTimer);
 tapTimer=setTimeout(()=>{lastKey=null;},800);

 renderChat();

 document.onkeydown=function(e){
  if(e.key==="Enter") send();
 };
}

function send(){
 if(!currentInput) return;

 messages[currentContact].push(currentInput);
 localStorage.setItem("keitaiMessages",JSON.stringify(messages));

 autoReply(currentContact);

 currentInput="";
 renderChat();
}

function autoReply(contactId){
 setTimeout(()=>{
  if(contactId==="getou"){
   messages[contactId].push(":-)");
  }
  else if(contactId==="yaga"){
   messages[contactId].push("Noted.");
  }
  else if(contactId==="self"){
   messages[contactId].push("Reminder saved.");
  }

  localStorage.setItem("keitaiMessages",JSON.stringify(messages));
  renderChat();
 },1000);
}

/* FILES */

function openFiles(){
 state="files";
 display.innerHTML=
 `welcome.txt<br>
 manual.txt<br>
 ringtones/<br>
 photos/<br>
 system.log<br>
 <br>Factory default files`;
}

/* SNAKE */

function startSnake(){
 state="snake";
 display.innerHTML="<canvas id='game' width='180' height='180'></canvas>";
 let canvas=document.getElementById("game");
 let ctx=canvas.getContext("2d");

 let snake=[{x:5,y:5}];
 let food={x:2,y:2};
 let dx=1,dy=0;
 let size=15;
 let score=0;

 let loop=setInterval(()=>{
  ctx.fillStyle="#0f1f0f";
  ctx.fillRect(0,0,180,180);

  snake.unshift({x:snake[0].x+dx,y:snake[0].y+dy});

  if(snake[0].x===food.x&&snake[0].y===food.y){
   score++;
   food={x:Math.floor(Math.random()*10),
         y:Math.floor(Math.random()*10)};
  }else{
   snake.pop();
  }

  if(snake[0].x<0||snake[0].x>11||snake[0].y<0||snake[0].y>11){
   clearInterval(loop);
   if(score>snakeHigh){
    snakeHigh=score;
    localStorage.setItem("snakeHigh",snakeHigh);
   }
   home();
  }

  ctx.fillStyle="#33ff66";
  snake.forEach(s=>{
   ctx.fillRect(s.x*size,s.y*size,size-2,size-2);
  });

  ctx.fillRect(food.x*size,food.y*size,size-2,size-2);

 },200);

 document.onkeydown=function(e){
  if(e.key==="ArrowUp"){dx=0;dy=-1;}
  if(e.key==="ArrowDown"){dx=0;dy=1;}
  if(e.key==="ArrowLeft"){dx=-1;dy=0;}
  if(e.key==="ArrowRight"){dx=1;dy=0;}
 };
}
