/* eslint-disable no-magic-numbers */

class Todo {
    BASE_URL = 'https://todo.hillel.it/';
    token = null;

    constructor() {
        this.simpleSignIn();
        this.initAddEvent();
        this.initItemEvents();
    }

    async auth(email, password) {
        const response = await fetch(`${this.BASE_URL}auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: email + password
            })
        });

        const { access_token: accessToken } = await response.json();
        this.token = accessToken;
        return this.token;
    }

    async addNote(value, priority = 1) {
        const response = await fetch(`${this.BASE_URL}todo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value,
                priority
            })
        });

        const note = await response.json();
        this.renderListItem(note);
    }

    async getAll() {
        const response = await fetch(`${this.BASE_URL}todo`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        const allNotes = await response.json();
        return allNotes;
    }

    async getNote(id) {
        const response = await fetch(`${this.BASE_URL}todo/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
        const note = await response.json();
        return note;
    }

    async deleteNote(id) {
        await fetch(`${this.BASE_URL}todo/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async editNote(id, value, priority = 1) {
        await fetch(`${this.BASE_URL}todo/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value,
                priority
            })
        });
    }

    async toggleStatus(id) {
        await fetch(`${this.BASE_URL}todo/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    renderListItem = function({ value, _id }) {
        const list = document.querySelector('.list');
        const li = document.createElement('li');
        li.classList.add('list__item');
        li.setAttribute('id', _id);
        li.innerHTML = `
            <button class="item__check"></button>
            <div class="item__content">${value}</div>
            <button class="item__edit"></button>
            <button class="item__delete"></button>`;
        list.append(li);
    }

    async renderAll() {
        const notesArray = await this.getAll();
        notesArray.forEach(note => this.renderListItem(note));

        const signUp = document.querySelector('.sign-up');
        signUp.hidden = true;

        const todoArea = document.querySelector('.todo-area');
        todoArea.hidden = false;
    }

    simpleSignIn() {
        const localToken = localStorage.getItem('localToken');
        if (localToken) {
            this.token = localToken;

            this.renderAll();
        } else {
            this.signUp();
        }
    }

    signUp() {
        const signUpBtn = document.querySelector('.sign-up__btn');
        signUpBtn.addEventListener('click', async(e) => {
            e.preventDefault();
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            await this.auth(email, password);

            this.renderAll();
            localStorage.setItem('localToken', this.token);
        });
    }

    initAddEvent = async function() {
        const addBtn = document.querySelector('.add__btn');
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const val = document.querySelector('.add__field').value;
            this.addNote(val);
        });
    }

    initItemEvents = async function() {
        const list = document.querySelector('.list');
        list.addEventListener('click', (e) => {
            const checkBtn = e.target.closest('.item__check');
            const editBtn = e.target.closest('.item__edit');
            const deleteBtn = e.target.closest('.item__delete');
            const item = e.target.closest('.list__item');

            if (editBtn) {
                const contentNode = item.querySelector('.item__content');

                if (!editBtn.classList.contains('edit-confirm')) {
                    const prevVal = contentNode.textContent;
                    contentNode.innerHTML = `<input class="edit__field" type="text" name="edit" value=${prevVal}>`;

                    editBtn.classList.add('edit-confirm');
                } else {
                    const val = item.querySelector('input').value;
                    this.editNote(item.id, val);
                    contentNode.innerHTML = `${val}`;

                    editBtn.classList.remove('edit-confirm');
                }
            } else if (deleteBtn) {
                item.remove();
                this.deleteNote(item.id);
            } else if (checkBtn) {
                checkBtn.classList.toggle('checked');
                this.toggleStatus(item.id);
            } else return;
        });
    }
}

new Todo;