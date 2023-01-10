const form = document.querySelector("form")
const todoCol = document.querySelector(".todo")
const inProgressCol = document.querySelector(".in-progress")
const doneCol = document.querySelector(".done")
const toInProgressBtn = document.querySelector("#to-in-progress")
const toDoneBtn = document.querySelector("#to-done")

function createTodo(title, description) {
    const card = document.createElement("div")
    card.classList.add("card")

    const titleElement = document.createElement("h3")
    titleElement.textContent = title

    const descElement = document.createElement("p")
    descElement.textContent = description

    card.appendChild(titleElement)
    card.appendChild(descElement)
    card.addEventListener("click", (e) => {
        e.target.classList.toggle("selected")
    })

    return card
}

function makeRequest(url, method, body, onSuccessFunction) {
    fetch(url, {
        "method": method,
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(body)
    }).then(data => {
        if (data.ok) return data.json()
    }).then(data => {
        if (data === undefined) return
        onSuccessFunction(data)
    })
}

form.addEventListener("submit", (e) => {
    e.preventDefault()

    const requestBody = {
        "title": e.target.querySelector("input").value,
        "description": e.target.querySelector("textarea").value,
        "completed": false,
        "isInProgress": false
    }
    makeRequest("http://localhost:3000/tasks", "POST", requestBody, (data) => {
        const { id, title, description } = data
        const card = createTodo(title, description)
        card.setAttribute("data-id", id)
        todoCol.appendChild(card)
    })

    e.target.reset()
})

toInProgressBtn.addEventListener("click", _ => {
    todoCol.querySelectorAll(".selected").forEach((card) => {
        const [title, desc] = card.children
        const requestBody = {
            "title": title.textContent,
            "description": desc.textContent,
            "completed": false,
            "isInProgress": true
        }
        makeRequest(`http://localhost:3000/tasks/${card.getAttribute("data-id")}`, "PUT", requestBody, _ => {
            todoCol.removeChild(card)
            inProgressCol.appendChild(card)
            card.classList.remove("selected")
        })
    })
})
toDoneBtn.addEventListener("click", _ => {
    inProgressCol.querySelectorAll(".selected").forEach((card) => {
        const [title, desc] = card.children
        const requestBody = {
            "title": title.textContent,
            "description": desc.textContent,
            "completed": true,
            "isInProgress": false
        }
        makeRequest(`http://localhost:3000/tasks/${card.getAttribute("data-id")}`, "PUT", requestBody, _ => {
            inProgressCol.removeChild(card)
            doneCol.appendChild(card)
            card.classList.remove("selected")
        })
    })
})

fetch("http://localhost:3000/tasks").then(data => data.json()).then(data => {
    data.forEach(task => {
        const { id, title, description, completed, isInProgress } = task
        const card = createTodo(title, description)
        card.setAttribute("data-id", id)
        if (completed) {
            doneCol.appendChild(card)
        } else if (isInProgress) {
            inProgressCol.appendChild(card)
        } else {
            todoCol.appendChild(card)
        }
    })
})