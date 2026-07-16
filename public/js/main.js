const deleteBtn = document.querySelectorAll(".del");
const todoItem = document.querySelectorAll("span.not");
const todoComplete = document.querySelectorAll("span.completed");

const deleteClient = document.querySelectorAll(".deleteClient");

const saveClient = document.querySelector(".saveClient");

Array.from(deleteBtn).forEach((el) => {
  el.addEventListener("click", deleteTodo);
});

Array.from(todoItem).forEach((el) => {
  el.addEventListener("click", markComplete);
});

Array.from(todoComplete).forEach((el) => {
  el.addEventListener("click", markIncomplete);
});

Array.from(deleteClient).forEach((el) => {
  el.addEventListener("click", delClient);
});

if (saveClient) {
  saveClient.addEventListener("click", updateClient);
}

async function deleteTodo() {
  const todoId = this.parentNode.dataset.id;
  try {
    const response = await fetch("todos/deleteTodo", {
      method: "delete",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        todoIdFromJSFile: todoId,
      }),
    });
    const data = await response.json();
    console.log(data);
    location.reload();
  } catch (err) {
    console.log(err);
  }
}

async function markComplete() {
  const todoId = this.parentNode.dataset.id;
  try {
    const response = await fetch("todos/markComplete", {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        todoIdFromJSFile: todoId,
      }),
    });
    const data = await response.json();
    console.log(data);
    location.reload();
  } catch (err) {
    console.log(err);
  }
}

async function markIncomplete() {
  const todoId = this.parentNode.dataset.id;
  try {
    const response = await fetch("todos/markIncomplete", {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        todoIdFromJSFile: todoId,
      }),
    });
    const data = await response.json();
    console.log(data);
    location.reload();
  } catch (err) {
    console.log(err);
  }
}

//// functions for clients ///

async function updateClient() {
  const wrapper = this.parentNode;
  const clientId = wrapper.dataset.id;
  try {
    const response = await fetch("/clients/updateClient", {
      method: "put",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        clientId: clientId,
        clientName: wrapper.querySelector("[name='clientName']").value,
        clientPhone: wrapper.querySelector("[name='clientPhone']").value,
        clientAddress: wrapper.querySelector("[name='clientAddress']").value,
        clientDay: wrapper.querySelector("[name='clientDay']").value,
      }),
    });
    const data = await response.json();
    console.log(data);
    window.location.href = "/clients";
  } catch (err) {
    console.error(err);
  }
}

// --- Route optimizer buttons ---

const clock = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const miles = (m) => (m / 1609.344).toFixed(1);
const mins = (s) => Math.round(s / 60);

document.querySelectorAll(".route-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const day = btn.dataset.day;
    const resultDiv = document.getElementById("route-result");
    resultDiv.innerHTML = `<p>Loading ${day} route…</p>`;
    try {
      const res = await fetch(`/clients/route/${day}`);
      const data = await res.json();
      if (!res.ok) {
        resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        return;
      }
      const rows = data.schedule
        .map(
          (s, i) =>
            `<tr><td>${i + 1}</td><td>${s.name}</td><td>${clock(s.arrive)}</td><td>${clock(s.depart)}</td></tr>`
        )
        .join("");
      resultDiv.innerHTML = `
        <h4>${day} — ${miles(data.totalDistanceMeters)} mi, ${mins(data.totalDurationSeconds)} min driving</h4>
        <table>
          <thead><tr><th>#</th><th>Client</th><th>Arrive</th><th>Depart</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><a href="${data.deepLink}" target="_blank">Open in Google Maps</a></p>`;
    } catch (err) {
      resultDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  });
});

// --- Client table day filter tabs ---

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const day = tab.dataset.day;
    document.querySelectorAll("#clients-list-table tbody tr").forEach((row) => {
      row.style.display = day === "All" || row.dataset.day === day ? "" : "none";
    });
  });
});

async function delClient() {
  const clientId = this.dataset.id;
  const clientName = this.dataset.name;
  if (!confirm(`Delete ${clientName}? This can't be undone.`)) {
    return;
  }
  try {
    const response = await fetch("clients/deleteClient", {
      method: "delete",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        clientIdFromJSFile: clientId,
      }),
    });
    const data = await response.json();
    console.log(data);
    location.reload();
  } catch (err) {
    console.error(err);
  }
}
