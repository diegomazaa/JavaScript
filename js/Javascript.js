

document.addEventListener('DOMContentLoaded', function () {
   
  
    
    function handleClick(event) {
     
      event.preventDefault();

      const producto = event.target.closest('.card');
      const nombre = producto.querySelector('.card-title').textContent;
      const descripcion = producto.querySelector('.card-text').textContent;
  
      
      localStorage.setItem('nombreProducto', nombre);
      localStorage.setItem('descripcionProducto', descripcion);
  
     
      mostrarMensaje('Producto añadido al carrito');
    }
  
    
    function mostrarMensaje(mensaje) {
     
      const mensajeElemento = document.getElementById('mensaje');
  
      
      mensajeElemento.textContent = mensaje;
    }
  
    
    const botones = document.querySelectorAll('.btn-primary');
    botones.forEach(function (boton) {
      boton.addEventListener('click', handleClick);
    });
  });
  





