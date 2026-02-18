let display = document.getElementById("display");
let keyboard = document.getElementById("keyboard");

let state="home";
let currentContact=null;
let currentInput="";

let contacts=[
 {name:"Message to self",id:"self"},
 {name:"Geto Suguru",id:"getou"},
 {name:"Misamichi Yaga",id:"yaga"}
];

let messages=JSON.parse(localStorage.getItem("keitaiMessages"));
if(!messages){
 messages={
  Geto:[":)"],
  yaga:["."]
 };
 localStorage.setItem("keitaiMessages",JSON.stringify(messages));
}

let snakeHigh=localStorage.getItem("snakeHigh")||0;

createKeyboard();
home();

/* ---------- SYSTEM ---------- */

function home(){
 state="home";
 display.innerHTML=
 `1: Messages<br>
 2: Files<br>
 3: Snake<br>
 <br>High Score: ${snakeHigh}`;
}

/* ---------- KEYBOARD ---------- */

function createKeyboard(){
 keyboard.innerHTML="";
 
 let letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
 letters.forEach(l=>{
  let b=document.createElement("button");
  b.innerText=l;
  b.onclick=()=>press(l);
  keyboard.appendChild(b);
 });

 let space=document.createElement("button");
 space.innerText="SPACE";
 space.className="wide";
 space.onclick=()=>press(" ");
 keyboard.appendChild(space);

 let back=document.createElement("button");
 back.innerText="⌫";
 back.className="wide";
 back.onclick=backspace;
 keyboard.appendChild(back);

 let enter=document.createElement("button");
 enter.innerText="ENTER";
 enter.className="wide";
 enter.onclick=enterPress;
 keyboard.appendChild(enter);
}

function press(char){
 if(state==="chat"){
  currentInput+=char;
  renderChat();
 }
}

function backspace(){
 if(state==="chat"){
  currentInput=currentInput.slice(0,-1);
  renderChat();
 }
}

function enterPress(){
 if(state==="home"){
  openContacts();
  return;
 }

 if(state==="contacts"){
  return;
 }

 if(state==="chat"){
  send();
 }
}

/* ---------- CONTACTS ---------- */

function openContacts(){
 state="contacts";
 display.innerHTML="";
 contacts.forEach((c,i)=>{
  display.innerHTML+=`${i+1}: ${c.name}<br>`;
 });
}

/* ---------- CHAT ---------- */

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

function send(){
 if(!currentInput) return;

 messages[currentContact].push(currentInput);
 localStorage.setItem("keitaiMessages",JSON.stringify(messages));

 autoReply(currentContact);

 currentInput="";
 renderChat();
}

function autoReply(id){
 setTimeout(()=>{
  if(id==="getou"){
   messages[id].push(":-)");
  }
  else if(id==="yaga"){
   messages[id].push("Noted.");
  }
  else{
   messages[id].push("Saved.");
  }
  localStorage.setItem("keitaiMessages",JSON.stringify(messages));
  renderChat();
 },800);
}

/* ---------- FILES ---------- */

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

/* ---------- SNAKE ---------- */

function startSnake(){
 state="snake";
 display.innerHTML="<canvas id='game' width='200' height='200'></canvas>";
 let canvas=document.getElementById("game");
 let ctx=canvas.getContext("2d");

 let snake=[{x:5,y:5}];
 let food={x:2,y:2};
 let dx=1,dy=0;
 let size=20;
 let score=0;

 let loop=setInterval(()=>{
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,200,200);

  snake.unshift({x:snake[0].x+dx,y:snake[0].y+dy});

  if(snake[0].x===food.x&&snake[0].y===food.y){
   score++;
   food={x:Math.floor(Math.random()*10),
         y:Math.floor(Math.random()*10)};
  }else{
   snake.pop();
  }

  if(snake[0].x<0||snake[0].x>9||snake[0].y<0||snake[0].y>9){
   clearInterval(loop);
   if(score>snakeHigh){
    snakeHigh=score;
    localStorage.setItem("snakeHigh",snakeHigh);
   }
   home();
  }

  ctx.fillStyle="#ffffff";
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

