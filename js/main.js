// Obtener referencias a elementos del DOM
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {}; // Objeto que representa el carrito de compras


// Configuración para acceder a la API de Unsplash
const accessKey = "tYCDZkoZRrE9uq6rwvhSWSpoxSKm-bVww7Y2pNWcf4U";
const objects = ["phonecases"];
const apiUrl = `https://api.unsplash.com/photos/random?query=${objects.join(',')}&count=6&client_id=${accessKey}`;

// Evento que se ejecuta cuando el DOM ha sido completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Cargar datos iniciales
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito')); // Recuperar el carrito desde el almacenamiento local
        pintarCarrito(); // Renderizar el carrito
    }
});

// Evento de clic en las tarjetas de productos
cards.addEventListener('click', e => {
    addCarrito(e); // Agregar producto al carrito al hacer clic en el botón oscuro
});

// Evento de clic en elementos del carrito
items.addEventListener('click', e => {
    btnAccion(e); // Manejar acciones como incrementar o disminuir la cantidad de un producto en el carrito
});

const apiJson = '../mock/api.json'
// Función asíncrona para obtener datos de productos desde un archivo JSON local
const fetchData = async () => {
    try {
        const resProductos = await fetch(`${apiJson}`);
        if (!resProductos.ok) throw new Error(`Error en la solicitud: ${resProductos.statusText}`);
        const dataProductos = await resProductos.json();

        const imageUrls = await fetchApi(); // Obtener URLs de imágenes aleatorias
        pintarCards(dataProductos, imageUrls); // Renderizar las tarjetas de productos
    } catch (error) {
        console.log(error);
    }
};

// Función asíncrona para obtener imágenes aleatorias de Unsplash
const fetchApi = async () => {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Error en la solicitud: ${res.statusText}`);
        const data = await res.json();
        return data.map(item => item.urls.small); // Extraer URLs pequeñas de las imágenes
    } catch (error) {
        console.error("No se pudo obtener la foto", error);
    }
};

// Función para renderizar las tarjetas de productos en el DOM
const pintarCards = (data, imageUrls) => {
    data.forEach((producto, index) => {
        const card = templateCard.cloneNode(true);
        card.querySelector('h5').textContent = producto.title;
        card.querySelector('p').textContent = `${producto.precio.toFixed(2)}`; // Formatear el precio
        card.querySelector('.btn-dark').dataset.id = producto.id;
        card.querySelector('img').src = imageUrls[index];
        fragment.appendChild(card);
    });
    cards.appendChild(fragment);
};

// Función para agregar un producto al carrito
const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement); // Configurar el objeto del producto y agregarlo al carrito
    }
    e.stopPropagation();
};

// Función para configurar el objeto del producto y agregarlo al carrito
const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    };
    if (carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = {...producto}; // Clonar el objeto producto para evitar referencias compartidas
    pintarCarrito(); // Renderizar el carrito
};

// Función para renderizar el carrito en el DOM
const pintarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });
    items.appendChild(fragment);

    pintarFooter(); // Renderizar el pie de página del carrito

    localStorage.setItem('carrito', JSON.stringify(carrito)); // Guardar el carrito en el almacenamiento local
};

// Función para renderizar el pie de página del carrito en el DOM
const pintarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
            <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
        return;
    }
    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0);
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    // Configurar el evento de clic para vaciar el carrito
    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        // Mostrar un mensaje de confirmación utilizando la librería SweetAlert
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          });
        swalWithBootstrapButtons.fire({
            title: "¿Estas seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Si se confirma, vaciar el carrito y renderizar
                swalWithBootstrapButtons.fire({
                    title: "Listo",
                    text: "Tu carrito ha sido vaciado",
                    icon: "success"
                });
                carrito = {};
                pintarCarrito();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: "Listo",
                    text: "Tu carrito no ha sido vaciado",
                    icon: "error"
                });
            }
        });
    });
};

const btnAccion = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {...producto};
        pintarCarrito();
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        pintarCarrito();
    }

    e.stopPropagation();
};
