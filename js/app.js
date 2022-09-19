(function () {
  /* _______________ Globals _______________ */
  const todoList = document.getElementById("todo-list");
  const userSelect = document.getElementById("user-todo");
  const form = document.querySelector(".form");
  let todos = [];
  let users = [];
  /* _______________ /Globals _______________ */

  /* _______________ Attach events _______________ */
  document.addEventListener("DOMContentLoaded", initApp);
  form.addEventListener("submit", handleSubmit);
  /* _______________ /Attach events _______________ */

  /* _______________ Basic Logic _______________ */
  function getUserName(userId) {
    const user = users.find((u) => u.id === userId);
    return user.name;
  }
  function printTodo({ id, userId, title, completed }) {
    const li = document.createElement("li");
    li.className = "list__item";
    li.dataset.id = id;
    li.innerHTML = `<span class='list__item-text'>${title} <i>by</i> <b>${getUserName(
      userId
    )}</b></span>`;

    // Checkbox
    const label = document.createElement("label");
    const status = document.createElement("input");
    const statusSpan = document.createElement("span");

    label.className = "list__item-label";
    label.append(status);
    label.append(statusSpan);

    statusSpan.className = "list__item-label-span";
    status.className = "list__item-label-check";
    status.type = "checkbox";
    status.checked = completed;
    status.addEventListener("change", handleTodoChange);

    // Close
    const close = document.createElement("span");
    close.innerHTML = "&times;";
    close.className = "list__item-close";
    close.addEventListener("click", handleClose);

    li.prepend(label);
    li.append(close);

    todoList.prepend(li);
  }

  function createUserOption(user) {
    const option = document.createElement("option");
    option.value = user.id;
    option.innerText = user.name;

    userSelect.append(option);
  }

  function removeTodo(todoId) {
    todos = todos.filter((todo) => todo.id !== todoId);

    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector("input").removeEventListener("change", handleTodoChange);
    todo
      .querySelector(".list__item-close")
      .removeEventListener("click", handleClose);
    todo.remove();
  }
  function alertError(error) {
    alert(error.message);
  }
  /* _______________ /Basic Logic _______________ */

  /* _______________ Event logic _______________ */
  function initApp() {
    Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
      [todos, users] = values;

      // Отправить в разметку
      todos.forEach((todo) => printTodo(todo));
      users.forEach((user) => createUserOption(user));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    createToDo({
      userId: Number(form.user.value),
      title: form.todo.value,
      completed: false,
    });
  }

  function handleTodoChange() {
    // /Checked logic
    const todoId = this.parentElement.parentElement.dataset.id;
    const completed = this.checked;
    const todo = this.parentElement.parentElement;

    toggleTodoComplete(todoId, completed);
  }

  function handleClose() {
    const todoId = this.parentElement.dataset.id;
    deleteTodo(todoId);
  }
  /* _______________ /Event logic _______________ */

  /* _______________ Async logic _______________ */
  async function getAllTodos() {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=20"
      );
      const data = await response.json();

      return data;
    } catch (error) {
      alertError(error);
    }
  }

  async function getAllUsers() {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users?_limit=10"
      );
      const data = await response.json();

      return data;
    } catch (error) {
      alertError(error);
    }
  }

  async function createToDo(todo) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos",
        {
          method: "POST",
          body: JSON.stringify(todo),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const newTodo = await response.json();

      printTodo(newTodo);
    } catch (error) {
      alertError(error);
    }
  }

  async function toggleTodoComplete(todoId, completed) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ completed }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        // Error
        throw new Error("Failed to connect with the server! Please try later.");
      }
    } catch (error) {
      alertError(error);
    }
  }

  async function deleteTodo(todoId) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // remove Todo from DOM
        removeTodo(todoId);
      } else {
        throw new Error("Failed to connect with the server! Please try later.");
      }
    } catch (error) {
      alertError(error);
    }
  }
  /* _______________ /Async logic _______________ */
})();
