const defaultRooms=[
{id:1,number:"101",type:"Single",price:1800,status:"available"},
{id:2,number:"102",type:"Double",price:2500,status:"available"},
{id:3,number:"103",type:"Deluxe",price:3500,status:"occupied"},
{id:4,number:"201",type:"Double",price:2500,status:"available"},
{id:5,number:"202",type:"Deluxe",price:3500,status:"maintenance"},
{id:6,number:"203",type:"Suite",price:5500,status:"available"}
];
const defaultGuests=[
{id:1,name:"Aarav Sharma",phone:"9876543210",email:"aarav@email.com",idproof:"Aadhaar"},
{id:2,name:"Priya Patel",phone:"9123456780",email:"priya@email.com",idproof:"Passport"}
];
const defaultBookings=[
{id:1,guestId:1,roomId:3,checkin:"2026-10-02",checkout:"2026-10-05",amount:10500,status:"Checked-in",payment:"Paid"},
{id:2,guestId:2,roomId:2,checkin:"2026-10-08",checkout:"2026-10-10",amount:5000,status:"Booked",payment:"Pending"}
];

let rooms=load("rooms",defaultRooms), guests=load("guests",defaultGuests), bookings=load("bookings",defaultBookings);
function load(key,fallback){const v=localStorage.getItem("hotel_"+key);return v?JSON.parse(v):JSON.parse(JSON.stringify(fallback))}
function save(){localStorage.setItem("hotel_rooms",JSON.stringify(rooms));localStorage.setItem("hotel_guests",JSON.stringify(guests));localStorage.setItem("hotel_bookings",JSON.stringify(bookings))}
const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const guestName=id=>guests.find(g=>g.id==id)?.name||"Unknown";
const roomById=id=>rooms.find(r=>r.id==id);
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function openModal(title,html,submit){$("modalTitle").textContent=title;$("modalForm").innerHTML=html;$("modalForm").onsubmit=e=>{e.preventDefault();submit(new FormData(e.target));};$("modal").classList.add("show")}
$("closeModal").onclick=()=>$("modal").classList.remove("show");
$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.remove("show")};

document.querySelectorAll(".nav-btn").forEach(btn=>btn.onclick=()=>showSection(btn.dataset.section));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showSection(b.dataset.go));
function showSection(id){
 document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
 const titles={dashboard:["Dashboard","Welcome to HotelEase"],rooms:["Rooms","Manage hotel rooms and availability"],guests:["Guests","Manage guest information"],bookings:["Bookings","Manage reservations and check-in/out"],billing:["Billing","Manage invoices and payments"]};
 $("pageTitle").textContent=titles[id][0];$("pageSubtitle").textContent=titles[id][1];
 renderAll();
}

function renderAll(){renderDashboard();renderRooms();renderGuests();renderBookings();renderBilling()}
function renderDashboard(){
 $("totalRooms").textContent=rooms.length;
 $("availableRooms").textContent=rooms.filter(r=>r.status==="available").length;
 $("totalGuests").textContent=guests.length;
 $("totalRevenue").textContent=money(bookings.filter(b=>b.payment==="Paid").reduce((s,b)=>s+Number(b.amount),0));
 const counts={available:0,occupied:0,maintenance:0};rooms.forEach(r=>counts[r.status]++);
 $("roomSummary").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="summary-item"><b>${v}</b><span>${k[0].toUpperCase()+k.slice(1)}</span></div>`).join("");
 $("recentBookings").innerHTML=bookings.slice(-5).reverse().map(b=>`<tr><td>${guestName(b.guestId)}</td><td>${roomById(b.roomId)?.number||"-"}</td><td>${b.checkin}</td><td><span class="status ${b.status}">${b.status}</span></td></tr>`).join("")||`<tr><td colspan="4" class="empty">No bookings</td></tr>`;
}
function renderRooms(){
 const q=($("roomSearch").value||"").toLowerCase(), f=$("roomFilter").value;
 const list=rooms.filter(r=>(!q||r.number.toLowerCase().includes(q)||r.type.toLowerCase().includes(q))&&(f==="all"||r.status===f));
 $("roomGrid").innerHTML=list.map(r=>`<div class="room-card"><h3>Room ${r.number}</h3><p>${r.type} Room</p><div class="room-price">${money(r.price)} <small>/ night</small></div><span class="status ${r.status}">${r.status[0].toUpperCase()+r.status.slice(1)}</span><div class="actions" style="margin-top:14px"><button class="action-btn" onclick="editRoom(${r.id})">Edit</button>${r.status!=="occupied"?`<button class="action-btn red" onclick="deleteRoom(${r.id})">Delete</button>`:""}</div></div>`).join("")||`<div class="empty">No rooms found.</div>`;
}
function renderGuests(){
 const q=($("guestSearch").value||"").toLowerCase();
 const list=guests.filter(g=>[g.name,g.phone,g.email].some(x=>x.toLowerCase().includes(q)));
 $("guestTable").innerHTML=list.map(g=>`<tr><td><b>${g.name}</b></td><td>${g.phone}</td><td>${g.email}</td><td>${g.idproof}</td><td>${bookings.filter(b=>b.guestId===g.id).length}</td><td><div class="actions"><button class="action-btn" onclick="editGuest(${g.id})">Edit</button><button class="action-btn red" onclick="deleteGuest(${g.id})">Delete</button></div></td></tr>`).join("")||`<tr><td colspan="6" class="empty">No guests found.</td></tr>`;
}
function renderBookings(){
 const q=($("bookingSearch").value||"").toLowerCase(),f=$("bookingFilter").value;
 const list=bookings.filter(b=>(!q||guestName(b.guestId).toLowerCase().includes(q)||String(roomById(b.roomId)?.number).includes(q))&&(f==="all"||b.status===f));
 $("bookingTable").innerHTML=list.map(b=>`<tr><td><b>${guestName(b.guestId)}</b></td><td>${roomById(b.roomId)?.number||"-"}</td><td>${b.checkin}<br>to ${b.checkout}</td><td>${money(b.amount)}</td><td><span class="status ${b.status}">${b.status}</span></td><td><div class="actions">${b.status==="Booked"?`<button class="action-btn green" onclick="checkIn(${b.id})">Check-in</button>`:""}${b.status==="Checked-in"?`<button class="action-btn" onclick="checkOut(${b.id})">Check-out</button>`:""}${b.status==="Booked"?`<button class="action-btn red" onclick="cancelBooking(${b.id})">Cancel</button>`:""}</div></td></tr>`).join("")||`<tr><td colspan="6" class="empty">No bookings found.</td></tr>`;
}
function renderBilling(){
 const paid=bookings.filter(b=>b.payment==="Paid").reduce((s,b)=>s+Number(b.amount),0),pending=bookings.filter(b=>b.payment!=="Paid"&&b.status!=="Cancelled").reduce((s,b)=>s+Number(b.amount),0);
 $("billCount").textContent=bookings.filter(b=>b.status!=="Cancelled").length;$("paidAmount").textContent=money(paid);$("pendingAmount").textContent=money(pending);
 $("billingTable").innerHTML=bookings.filter(b=>b.status!=="Cancelled").map(b=>`<tr><td>INV-${String(b.id).padStart(4,"0")}</td><td>${guestName(b.guestId)}</td><td>${roomById(b.roomId)?.number||"-"}</td><td><b>${money(b.amount)}</b></td><td><span class="status ${b.payment==="Paid"?"Checked-in":"Booked"}">${b.payment}</span></td><td>${b.payment!=="Paid"?`<button class="action-btn green" onclick="payBill(${b.id})">Mark Paid</button>`:`<span style="color:#1f9d68;font-size:12px">✓ Paid</span>`}</td></tr>`).join("")||`<tr><td colspan="6" class="empty">No bills available.</td></tr>`;
}

$("addRoomBtn").onclick=()=>openModal("Add Room",`<div class="form-grid"><div class="form-group"><label>Room Number</label><input name="number" required></div><div class="form-group"><label>Room Type</label><select name="type"><option>Single</option><option>Double</option><option>Deluxe</option><option>Suite</option></select></div><div class="form-group"><label>Price / Night (₹)</label><input name="price" type="number" min="0" required></div><div class="form-group"><label>Status</label><select name="status"><option value="available">Available</option><option value="maintenance">Maintenance</option></select></div></div><button class="primary-btn form-submit">Save Room</button>`,d=>{rooms.push({id:Date.now(),number:d.get("number"),type:d.get("type"),price:Number(d.get("price")),status:d.get("status")});save();$("modal").classList.remove("show");toast("Room added successfully");renderAll()});
function editRoom(id){let r=roomById(id);openModal("Edit Room",`<div class="form-grid"><div class="form-group"><label>Room Number</label><input name="number" value="${r.number}" required></div><div class="form-group"><label>Room Type</label><select name="type">${["Single","Double","Deluxe","Suite"].map(x=>`<option ${x===r.type?"selected":""}>${x}</option>`).join("")}</select></div><div class="form-group"><label>Price / Night (₹)</label><input name="price" type="number" value="${r.price}" required></div><div class="form-group"><label>Status</label><select name="status"><option value="available">Available</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option></select></div></div><button class="primary-btn form-submit">Update Room</button>`,d=>{Object.assign(r,{number:d.get("number"),type:d.get("type"),price:Number(d.get("price")),status:d.get("status")});save();$("modal").classList.remove("show");toast("Room updated");renderAll()})}
function deleteRoom(id){if(confirm("Delete this room?")){rooms=rooms.filter(r=>r.id!==id);save();renderAll();toast("Room deleted")}}

$("addGuestBtn").onclick=()=>guestForm();
function guestForm(g=null){openModal(g?"Edit Guest":"Add Guest",`<div class="form-grid"><div class="form-group"><label>Full Name</label><input name="name" value="${g?.name||""}" required></div><div class="form-group"><label>Phone</label><input name="phone" pattern="[0-9]{10}" value="${g?.phone||""}" required></div><div class="form-group"><label>Email</label><input name="email" type="email" value="${g?.email||""}" required></div><div class="form-group"><label>ID Proof</label><select name="idproof">${["Aadhaar","Passport","Driving License","Voter ID"].map(x=>`<option ${x===g?.idproof?"selected":""}>${x}</option>`).join("")}</select></div></div><button class="primary-btn form-submit">${g?"Update":"Save"} Guest</button>`,d=>{if(g)Object.assign(g,{name:d.get("name"),phone:d.get("phone"),email:d.get("email"),idproof:d.get("idproof")});else guests.push({id:Date.now(),name:d.get("name"),phone:d.get("phone"),email:d.get("email"),idproof:d.get("idproof")});save();$("modal").classList.remove("show");toast(g?"Guest updated":"Guest added");renderAll()})}
function editGuest(id){guestForm(guests.find(g=>g.id===id))}
function deleteGuest(id){if(bookings.some(b=>b.guestId===id&&["Booked","Checked-in"].includes(b.status))){toast("Guest has an active booking");return}if(confirm("Delete this guest?")){guests=guests.filter(g=>g.id!==id);save();renderAll();toast("Guest deleted")}}

$("addBookingBtn").onclick=()=>{
 const available=rooms.filter(r=>r.status==="available");
 if(!guests.length||!available.length){toast("Add a guest and an available room first");return}
 openModal("New Booking",`<div class="form-grid"><div class="form-group full"><label>Guest</label><select name="guestId" required>${guests.map(g=>`<option value="${g.id}">${g.name} - ${g.phone}</option>`).join("")}</select></div><div class="form-group"><label>Room</label><select name="roomId" required>${available.map(r=>`<option value="${r.id}">Room ${r.number} - ${r.type} (${money(r.price)})</option>`).join("")}</select></div><div class="form-group"><label>Payment</label><select name="payment"><option>Pending</option><option>Paid</option></select></div><div class="form-group"><label>Check-in</label><input name="checkin" type="date" value="${new Date().toISOString().slice(0,10)}" required></div><div class="form-group"><label>Check-out</label><input name="checkout" type="date" required></div></div><button class="primary-btn form-submit">Create Booking</button>`,d=>{
  const room=roomById(d.get("roomId")),ci=new Date(d.get("checkin")),co=new Date(d.get("checkout"));
  if(co<=ci){toast("Check-out must be after check-in");return}
  const nights=Math.ceil((co-ci)/86400000), amount=nights*room.price;
  bookings.push({id:Date.now(),guestId:Number(d.get("guestId")),roomId:Number(d.get("roomId")),checkin:d.get("checkin"),checkout:d.get("checkout"),amount,status:"Booked",payment:d.get("payment")});
  room.status="occupied";save();$("modal").classList.remove("show");toast("Booking created");renderAll()
 });
};
function checkIn(id){const b=bookings.find(x=>x.id===id);b.status="Checked-in";if(roomById(b.roomId))roomById(b.roomId).status="occupied";save();renderAll();toast("Guest checked in")}
function checkOut(id){const b=bookings.find(x=>x.id===id);b.status="Checked-out";if(roomById(b.roomId))roomById(b.roomId).status="available";save();renderAll();toast("Guest checked out")}
function cancelBooking(id){const b=bookings.find(x=>x.id===id);b.status="Cancelled";if(roomById(b.roomId))roomById(b.roomId).status="available";save();renderAll();toast("Booking cancelled")}
function payBill(id){const b=bookings.find(x=>x.id===id);b.payment="Paid";save();renderAll();toast("Payment marked as paid")}

["roomSearch","roomFilter","guestSearch","bookingSearch","bookingFilter"].forEach(id=>$(id).addEventListener("input",renderAll));
$("resetData").onclick=()=>{if(confirm("Reset all demo data?")){rooms=JSON.parse(JSON.stringify(defaultRooms));guests=JSON.parse(JSON.stringify(defaultGuests));bookings=JSON.parse(JSON.stringify(defaultBookings));save();renderAll();toast("Demo data restored")}};
$("today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
renderAll();
