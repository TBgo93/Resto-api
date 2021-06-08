let mealsState = []
let user = {}
let ruta = 'login' //login, register y orders


const stringToHTML = (string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(string, 'text/html')
    return doc.body.firstChild
}
const renderLoading = (state) => {
    const loadingView = document.getElementById('loading-view')
    if(state){
        return document.getElementById('app').innerHTML = loadingView.innerHTML
    }else{
        return ``
    }
}

const renderItem = (item) => {
    const element = stringToHTML(`
    <li data-id="${item._id}">${item.name}<br>
        <small>${item.desc}</small>
    </li>
    `)
    /* const reset = document.getElementById('reset') */

    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`
    <li data-id="${order._id}">${meal.name}<br>
        <small>Para: ${order.user_email}</small>
    </li>
    `)
    return element
}



const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealsValue = mealId.value
        if (!mealsValue) {
            alert('Debes seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }

        const order = {
            meal_id: mealsValue,
            user_id: user._id,
            user_email: user.email,
        }

        const token = sessionStorage.getItem('token')

        fetch('https://resto-api-eta.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
        .then(respuesta => {
            const renderedOrder = renderOrder(respuesta, mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
            /* agrega limpiar class selected */
            const mealsList = document.getElementById('meals-list')
            Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        })
    }
    const logout = document.getElementById('logout')
    logout.addEventListener('click', (e) => {
        e.preventDefault()
        sessionStorage.clear()
        location.reload()
    })
}

const inicializaDatos = () => {
    fetch('https://resto-api-eta.vercel.app/api/meals')
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealsList = document.getElementById('meals-list')
            const submit = document.getElementById('submit')
            const listItems = data.map(renderItem)
            mealsList.removeChild(mealsList.firstElementChild)
            listItems.forEach(element => mealsList.appendChild(element))
            submit.removeAttribute('disabled')
            fetch('https://resto-api-eta.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders-list')
                    const listOrders = ordersData.map(orderData => renderOrder(orderData, data))

                    ordersList.removeChild(ordersList.firstElementChild)
                    listOrders.forEach(element => ordersList.appendChild(element))
                })
        })
}

const renderApp = () => {
    const token = sessionStorage.getItem('token')
    if (token) {
        user = JSON.parse(sessionStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        fetch('https://resto-api-eta.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        }).then(x => x.json())
            .then(
                /* render loading true */
                renderLoading(true)
            )
            .then(respuesta => {
                sessionStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
                return fetch('https://resto-api-eta.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    },
                })
            })
            .then(x => x.json())
            .then(fetchedUser => {
                const { email, role, _id, } = fetchedUser 
                sessionStorage.setItem('user', JSON.stringify({ email, role, _id }))
                user = fetchedUser
                /* render loading false */
                renderLoading(false)
                renderOrders()
            })
    }
}
window.onload = () => {
    renderApp()
}