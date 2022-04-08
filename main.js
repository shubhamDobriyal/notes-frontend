const loginSection = document.querySelector("#login-form");
const signupSection = document.querySelector("#signup-form");
const navigateSignup = loginSection.querySelector("#navigate-signup");
const navigateLogin = signupSection.querySelector("#navigate-login");
const loginForm = loginSection.querySelector("form");;
const signupForm = signupSection.querySelector("form");
const loginError = loginForm.querySelector("#login-error");
const signupError = signupForm.querySelector("#signup-error");
const homeSection = document.querySelector("#home-section");
const logoutBtn = homeSection.querySelector("#logout-btn");
const listItems = homeSection.querySelector("#notes-list");
const content = homeSection.querySelector(".content");
const addBtn = homeSection.querySelector("#add-btn");
const newNoteModal = document.querySelector("#new-note-modal");
const cancelBtn = newNoteModal.querySelector("#cancel-btn");
const newNoteForm = newNoteModal.querySelector("#new-note-form");
const userEdit = homeSection.querySelector("#user-edit");
const editModal = document.querySelector("#edit-modal");
const editForm = editModal.querySelector("#edit-form");
const cancelEdit = editForm.querySelector("#cancel-edit");
const loader = document.createElement("span");
loader.className = "loader";
loader.innerHTML = '<span class="box b1"></span><span class="box b2"></span><span class="box b3"></span><span class="box b4"></span>';

let user = {}
if (localStorage.getItem("is-logged-in") === "true") {
  user = JSON.parse(localStorage.getItem("user"))
  showHomeSection()
} else {
  loginSection.classList.add("show");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const submitBtn = loginForm.querySelector("#login-btn");
  submitBtn.innerHTML = "";
  submitBtn.appendChild(loader);
  submitBtn.disabled = true;
  const data = new FormData(loginForm);
  const body = {
    email: data.get("email"),
    password: data.get("password")
  }
  fetch("http://localhost/project-api/login.php", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json())
    .then(res => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Login";

      const status = res.status;
      if (status === 0) {
        loginError.classList.add("show");
      }
      else {
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem('user', JSON.stringify(res.user))
        user = res.user;
        showHomeSection()
      }
    })
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const submitBtn = signupForm.querySelector("#signup-btn");
  submitBtn.innerHTML = "";
  submitBtn.appendChild(loader);
  submitBtn.disabled = true;
  const data = new FormData(signupForm);
  const body = {
    email: data.get("email"),
    name: data.get("name"),
    password: data.get("password"),
    c_password: data.get("cnfrm_password")
  }
  fetch("http://localhost/project-api/sign-up.php", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json())
    .then(res => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Sign Up";
      if (!res.status) {
        signupError.classList.add("show");
        signupError.innerHTML = res.message;
      } else {
        localStorage.setItem("is-logged-in", "true");
        localStorage.setItem('user', JSON.stringify(res.user))
        user = res.user;
        showHomeSection()
      }
    })
});

function setUserDetails() {
  const userName = homeSection.querySelector(".user-edit h2");
  const userImage = homeSection.querySelector("#profile-img");
  userName.innerHTML = user.name;
  userImage.src = "http://localhost/project-api/images/" + user.image;
}

function showHomeSection() {
  loginSection.classList.remove("show");
  signupSection.classList.remove("show");
  homeSection.classList.add("show");
  setUserDetails()
  getNotes()
}

function getNotes(){
  document.body.appendChild(loader);
  fetch("http://localhost/project-api/get-notes.php?id=" + user.id)
  .then(res => res.json())
  .then(res => {
   document.body.removeChild(loader);

    listItems.innerHTML = ''
    content.innerHTML = ''
    res.notes.forEach(note => {
      const li = document.createElement('li')
      li.className = 'list-item'
      const listText = document.createElement('div')
      listText.className = 'list-text'
      const h4 = document.createElement('h4') 
      const p = document.createElement('p')
      h4.textContent = note.title
      p.textContent = note.date
      listText.appendChild(h4)
      listText.appendChild(p)
      li.appendChild(listText)
      
      const editButton = document.createElement('button')
      editButton.className = 'edit-btn'
      const editImage = document.createElement('img')
      editImage.src = 'assets/edit.svg'
      editImage.alt = 'edit icon'
      editButton.appendChild(editImage)
      li.appendChild(editButton)
      
      const deleteButton = document.createElement('button')
      deleteButton.className = 'delete-btn'
      const img = document.createElement('img')
      img.src = 'assets/trash-2.svg'
      img.alt = 'delete icon'
      deleteButton.appendChild(img)
      li.appendChild(deleteButton)
      
      li.addEventListener("click", () => {
        content.textContent = note.content;
      })
      
      editButton.addEventListener("click", () => {
        newNoteModal.querySelector("input").value = note.title;
        newNoteModal.querySelector("textarea").value = note.content;
        newNoteForm.querySelector("#note-id").value = note.id;
        newNoteModal.classList.add("show");

      })

      deleteButton.addEventListener("click", () => {
        fetch("http://localhost/project-api/delete-notes.php?id=" + note.id)
        .then(res => res.json())
        .then(res => {
          if(res.status === 1){
            getNotes();
          }
        })
      })

      listItems.appendChild(li)
    });
  })
}

navigateSignup.addEventListener("click", (e) => {
  loginSection.classList.remove("show");
  signupSection.classList.add("show");
});

navigateLogin.addEventListener("click", (e) => {
  signupSection.classList.remove("show");
  loginSection.classList.add("show");
});

logoutBtn.addEventListener("click", (e) => {
  localStorage.removeItem("user");
  localStorage.removeItem("is-logged-in");
  homeSection.classList.remove("show");
  loginSection.classList.add("show");

});

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  newNoteModal.classList.add("show");
});

cancelBtn.addEventListener("click", e => {
  e.preventDefault();
  newNoteModal.classList.remove("show");
  newNoteModal.querySelector("input").value = '';
  newNoteModal.querySelector("textarea").value = '';
  newNoteModal.querySelector("#note-id").value = '';
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  formData.append("id", user.id);
  const submitBtn = editForm.querySelector("button.primary");
  submitBtn.innerHTML = "";
  submitBtn.appendChild(loader);
  submitBtn.disabled = true;
  fetch("http://localhost/project-api/update-profile.php", {
      method: "post",
      body: formData
    })
    .then(res => res.json())
    .then(res => {
      submitBtn.innerHTML = "Update Profile";
      submitBtn.disabled = false;
      if(res.status === 1){
        user = { ...user, ...res.user};
        localStorage.setItem('user', JSON.stringify(user))
        setUserDetails();
        editModal.classList.remove("show");
      }else{
        alert(res.message);
      }
      console.log(res);
    })
    .catch(e => {
      alert("Something went wrong!");
      console.log(e)
      submitBtn.disabled = false;
    })
});

newNoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(newNoteForm);
  const title = formData.get("title");
  const content = formData.get("content");
  const noteId = formData.get("note_id");
  if(title === "") {
    alert("title cannot be blank");
  } else if(content === ""){
    alert("content cannot be blank");
  } else{
    newNoteForm.querySelector("button").disabled = true;
    newNoteForm.querySelector("button").textContent = "Adding ...";
    fetch("http://localhost/project-api/add-notes.php", {
      method: "post",
      body: JSON.stringify({
        title: title,
        content: content,
        id: user.id,
        noteId: noteId
      })
    })
    .then(res => res.json())
    .then(res => {
      newNoteForm.querySelector("button").disabled = false;
      newNoteForm.querySelector("button").textContent = "Add Note";
      if(res.status === 1){
        newNoteModal.classList.remove("show");
        newNoteForm.title.value = "";
        newNoteForm.content.value = "";
        newNoteForm.querySelector("#note-id").value = "";
        getNotes();
      } else {
        alert(res.message);
      }
    })
  }
})

userEdit.addEventListener("click", (e) => {
  editModal.classList.add("show");
  editForm.name.value = user.name;
});

cancelEdit.addEventListener("click", (e) => {
  editModal.classList.remove("show");
});     