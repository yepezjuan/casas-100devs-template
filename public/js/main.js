const deleteBtn = document.querySelectorAll(".del");
const todoItem = document.querySelectorAll("span.not");
const todoComplete = document.querySelectorAll("span.completed");

const deleteClient = document.querySelectorAll("span.deleteClient");

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

async function delClient() {
  const clientId = this.parentNode.dataset.id;
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
